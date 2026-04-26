const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, isAdmin, isStudent } = require('../middleware/authMiddleware');

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Get outings - auth required (admin sees all, student sees own)
router.get('/', auth, (req, res) => {
  const { role, userId } = req.user;

  const computedStatus = `
    CASE
      WHEN o.actual_return IS NOT NULL AND o.actual_return > o.expected_return THEN 'LATE'
      WHEN o.actual_return IS NULL AND CURTIME() > o.expected_return AND o.status = 'APPROVED' THEN 'LATE'
      ELSE o.status
    END AS computed_status
  `;

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
        ${computedStatus}
      FROM Outing o
      JOIN Student s ON o.student_id = s.student_id
      ORDER BY o.created_at DESC
    `;

    db.query(sql, (err, results) => {
      if (err) return sendError(res, 500, err.message);
      sendSuccess(res, results, 'Outings retrieved');
    });
    return;
  }

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
      ${computedStatus}
    FROM Outing o
    WHERE o.student_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return sendError(res, 500, err.message);
    sendSuccess(res, results, 'Outings retrieved');
  });
});

// Create outing - auth + isStudent required
router.post('/', auth, isStudent, (req, res) => {
  const { userId } = req.user;
  const { outing_date, time_out, expected_return, purpose } = req.body || {};

  if (!outing_date || !time_out || !expected_return) {
    return sendError(res, 400, 'Missing required fields: outing_date, time_out, expected_return');
  }

  const sql = `
    INSERT INTO Outing (student_id, outing_date, time_out, expected_return, purpose, status)
    VALUES (?, ?, ?, ?, ?, 'PENDING')
  `;

  db.query(sql, [userId, outing_date, time_out, expected_return, purpose || ''], (err, result) => {
    if (err) return sendError(res, 500, err.message);

    sendSuccess(res, {
      outing_id: result.insertId,
      status: 'PENDING'
    }, 'Outing request submitted');
  });
});

// Update outing status - auth + isAdmin required
router.put('/:id/status', auth, isAdmin, (req, res) => {
  const outingId = req.params.id;
  const { status } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return sendError(res, 400, 'Invalid status. Use APPROVED or REJECTED');
  }

  const sql = `UPDATE Outing SET status = ? WHERE outing_id = ?`;

  db.query(sql, [status, outingId], (err) => {
    if (err) return sendError(res, 500, err.message);

    sendSuccess(res, { outing_id: outingId, status }, `Outing ${status.toLowerCase()}`);
  });
});

// Record return time - auth required (students can only update own)
router.put('/:id/return', auth, (req, res) => {
  const outingId = req.params.id;
  const { userId, role } = req.user;
  const { actual_return } = req.body;

  const updateReturn = () => {
    const returnTime = actual_return || new Date().toTimeString().slice(0, 5);
    const sql = `UPDATE Outing SET actual_return = ? WHERE outing_id = ?`;

    db.query(sql, [returnTime, outingId], (err) => {
      if (err) return sendError(res, 500, err.message);
      sendSuccess(res, { outing_id: outingId, actual_return: returnTime }, 'Return time recorded');
    });
  };

  if (role === 'STUDENT') {
    const checkSql = 'SELECT student_id FROM Outing WHERE outing_id = ?';
    db.query(checkSql, [outingId], (checkErr, checkResults) => {
      if (checkErr) return sendError(res, 500, checkErr.message);
      if (checkResults.length === 0) {
        return sendError(res, 404, 'Outing not found');
      }
      if (checkResults[0].student_id !== userId) {
        return sendError(res, 403, 'Can only update own outings');
      }
      updateReturn();
    });
    return;
  }

  updateReturn();
});

module.exports = router;
