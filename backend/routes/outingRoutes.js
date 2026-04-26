const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, isAdmin, isStudent } = require('../middleware/authMiddleware');

// Get all outing requests (admin) or student's own requests
router.get('/', auth, (req, res) => {
  const { role, userId } = req.user;

  if (role === 'ADMIN') {
    const sql = `
      SELECT
        o.outing_id,
        o.student_id,
        s.full_name,
        s.register_no,
        o.outing_date,
        o.time_out,
        o.expected_return,
        o.actual_return,
        o.status,
        o.purpose,
        o.created_at,
        CASE
          WHEN o.actual_return IS NOT NULL AND o.actual_return > o.expected_return THEN 'LATE'
          WHEN o.actual_return IS NULL AND CURTIME() > o.expected_return AND o.status = 'APPROVED' THEN 'LATE'
          ELSE o.status
        END AS computed_status
      FROM Outing o
      JOIN Student s ON o.student_id = s.student_id
      ORDER BY o.created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
    return;
  }

  // Student: get own requests
  const sql = `
    SELECT
      o.outing_id,
      o.student_id,
      o.outing_date,
      o.time_out,
      o.expected_return,
      o.actual_return,
      o.status,
      o.purpose,
      o.created_at,
      CASE
        WHEN o.actual_return IS NOT NULL AND o.actual_return > o.expected_return THEN 'LATE'
        WHEN o.actual_return IS NULL AND CURTIME() > o.expected_return AND o.status = 'APPROVED' THEN 'LATE'
        ELSE o.status
      END AS computed_status
    FROM Outing o
    WHERE o.student_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create outing request (student only)
router.post('/', auth, isStudent, (req, res) => {
  const { userId } = req.user;
  const { outing_date, time_out, expected_return, purpose } = req.body || {};

  if (!outing_date || !time_out || !expected_return) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO Outing (student_id, outing_date, time_out, expected_return, purpose, status)
    VALUES (?, ?, ?, ?, ?, 'PENDING')
  `;

  db.query(sql, [userId, outing_date, time_out, expected_return, purpose || ''], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: 'Outing request submitted',
      outing_id: result.insertId,
      status: 'PENDING'
    });
  });
});

// Approve/Reject outing (admin only)
router.put('/:id/status', auth, isAdmin, (req, res) => {
  const outingId = req.params.id;
  const { status } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Use APPROVED or REJECTED' });
  }

  const sql = `UPDATE Outing SET status = ? WHERE outing_id = ?`;

  db.query(sql, [status, outingId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: `Outing ${status.toLowerCase()}`, outing_id: outingId, status });
  });
});

// Record actual return time (student or admin)
router.put('/:id/return', auth, (req, res) => {
  const outingId = req.params.id;
  const { userId, role } = req.user;
  const { actual_return } = req.body;

  // Students can only update their own outings
  if (role === 'STUDENT') {
    const checkSql = 'SELECT student_id FROM Outing WHERE outing_id = ?';
    db.query(checkSql, [outingId], (checkErr, checkResults) => {
      if (checkErr) return res.status(500).json({ error: checkErr.message });
      if (checkResults.length === 0) {
        return res.status(404).json({ error: 'Outing not found' });
      }
      if (checkResults[0].student_id !== userId) {
        return res.status(403).json({ error: 'Can only update own outings' });
      }

      updateReturn();
    });
    return;
  }

  // Admin can update any
  updateReturn();

  function updateReturn() {
    const returnTime = actual_return || new Date().toTimeString().slice(0, 5);
    const sql = `UPDATE Outing SET actual_return = ? WHERE outing_id = ?`;

    db.query(sql, [returnTime, outingId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Return time recorded', outing_id: outingId, actual_return: returnTime });
    });
  }
});

module.exports = router;
