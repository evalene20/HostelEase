const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// Get all complaints with full details (admin view)
router.get('/', auth, isAdmin, (req, res) => {
  const sql = `
    SELECT
      c.complaint_id,
      c.student_id,
      s.full_name,
      s.register_no,
      c.complaint_type,
      c.priority,
      c.complaint_date,
      st.staff_id,
      st.staff_name AS assigned_staff,
      st.role AS assigned_role,
      st.phone_no AS staff_phone,
      ca.assigned_on,
      ca.remarks,
      CASE
        WHEN ca.staff_id IS NOT NULL THEN 'ASSIGNED'
        ELSE 'PENDING_REVIEW'
      END AS complaint_status,
      DATEDIFF(CURDATE(), c.complaint_date) AS days_open
    FROM Complaint c
    JOIN Student s ON c.student_id = s.student_id
    LEFT JOIN Complaint_Assignment ca ON ca.complaint_id = c.complaint_id
    LEFT JOIN Staff st ON ca.staff_id = st.staff_id
    ORDER BY
      CASE c.priority
        WHEN 'HIGH' THEN 1
        WHEN 'MEDIUM' THEN 2
        WHEN 'LOW' THEN 3
      END,
      c.complaint_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Get available staff for assignment
router.get('/staff', auth, isAdmin, (req, res) => {
  const { role } = req.query;

  let sql = 'SELECT staff_id, staff_name, role, phone_no FROM Staff';
  const params = [];

  if (role) {
    sql += ' WHERE role = ?';
    params.push(role);
  }

  sql += ' ORDER BY staff_name';

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Assign staff to complaint
router.post('/:id/assign', auth, isAdmin, (req, res) => {
  const complaintId = req.params.id;
  const { staff_id, remarks } = req.body || {};

  if (!staff_id) {
    return res.status(400).json({ error: 'Staff ID required' });
  }

  // Check if complaint exists
  db.query('SELECT complaint_id FROM Complaint WHERE complaint_id = ?', [complaintId], (checkErr, checkResults) => {
    if (checkErr) return res.status(500).json({ error: checkErr.message });
    if (checkResults.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check if staff exists
    db.query('SELECT staff_id, staff_name, role FROM Staff WHERE staff_id = ?', [staff_id], (staffErr, staffResults) => {
      if (staffErr) return res.status(500).json({ error: staffErr.message });
      if (staffResults.length === 0) {
        return res.status(404).json({ error: 'Staff not found' });
      }

      const staff = staffResults[0];

      // Remove existing assignment if any
      db.query('DELETE FROM Complaint_Assignment WHERE complaint_id = ?', [complaintId], (delErr) => {
        if (delErr) return res.status(500).json({ error: delErr.message });

        // Create new assignment
        const sql = `
          INSERT INTO Complaint_Assignment (complaint_id, staff_id, assigned_on, remarks)
          VALUES (?, ?, CURDATE(), ?)
        `;

        db.query(sql, [complaintId, staff_id, remarks || `Assigned to ${staff.staff_name}`], (insertErr) => {
          if (insertErr) return res.status(500).json({ error: insertErr.message });

          res.json({
            message: 'Staff assigned successfully',
            complaint_id: complaintId,
            staff_id,
            staff_name: staff.staff_name,
            role: staff.role,
            remarks: remarks || `Assigned to ${staff.staff_name}`
          });
        });
      });
    });
  });
});

// Update complaint priority
router.put('/:id/priority', auth, isAdmin, (req, res) => {
  const complaintId = req.params.id;
  const { priority } = req.body;

  if (!['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
    return res.status(400).json({ error: 'Invalid priority. Use LOW, MEDIUM, or HIGH' });
  }

  const sql = 'UPDATE Complaint SET priority = ? WHERE complaint_id = ?';

  db.query(sql, [priority, complaintId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({
      message: 'Priority updated',
      complaint_id: complaintId,
      priority
    });
  });
});

// Update assignment remarks
router.put('/:id/remarks', auth, isAdmin, (req, res) => {
  const complaintId = req.params.id;
  const { remarks } = req.body || {};

  const sql = 'UPDATE Complaint_Assignment SET remarks = ? WHERE complaint_id = ?';

  db.query(sql, [remarks, complaintId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      message: 'Remarks updated',
      complaint_id: complaintId,
      remarks
    });
  });
});

// Unassign staff from complaint
router.delete('/:id/assign', auth, isAdmin, (req, res) => {
  const complaintId = req.params.id;

  db.query('DELETE FROM Complaint_Assignment WHERE complaint_id = ?', [complaintId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No assignment found for this complaint' });
    }

    res.json({
      message: 'Staff unassigned',
      complaint_id: complaintId
    });
  });
});

module.exports = router;
