const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, isAdmin } = require('../middleware/authMiddleware');

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Get all complaints with full details - auth + isAdmin required
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
        WHEN ca.staff_id IS NOT NULL THEN 'IN_PROGRESS'
        ELSE 'OPEN'
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
    if (err) return sendError(res, 500, err.message);
    sendSuccess(res, results, 'Complaints retrieved');
  });
});

// Get available staff - auth + isAdmin required
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
    if (err) return sendError(res, 500, err.message);
    sendSuccess(res, results, 'Staff retrieved');
  });
});

// Assign staff to complaint - auth + isAdmin required
router.post('/:id/assign', auth, isAdmin, (req, res) => {
  const complaintId = req.params.id;
  const { staff_id, remarks } = req.body || {};

  if (!staff_id) {
    return sendError(res, 400, 'Staff ID required');
  }

  db.query('SELECT complaint_id FROM Complaint WHERE complaint_id = ?', [complaintId], (checkErr, checkResults) => {
    if (checkErr) return sendError(res, 500, checkErr.message);
    if (checkResults.length === 0) {
      return sendError(res, 404, 'Complaint not found');
    }

    db.query('SELECT staff_id, staff_name, role FROM Staff WHERE staff_id = ?', [staff_id], (staffErr, staffResults) => {
      if (staffErr) return sendError(res, 500, staffErr.message);
      if (staffResults.length === 0) {
        return sendError(res, 404, 'Staff not found');
      }

      const staff = staffResults[0];

      db.query('DELETE FROM Complaint_Assignment WHERE complaint_id = ?', [complaintId], (delErr) => {
        if (delErr) return sendError(res, 500, delErr.message);

        const sql = `
          INSERT INTO Complaint_Assignment (complaint_id, staff_id, assigned_on, remarks)
          VALUES (?, ?, CURDATE(), ?)
        `;

        db.query(sql, [complaintId, staff_id, remarks || `Assigned to ${staff.staff_name}`], (insertErr) => {
          if (insertErr) return sendError(res, 500, insertErr.message);

          sendSuccess(res, {
            complaint_id: complaintId,
            staff_id,
            staff_name: staff.staff_name,
            role: staff.role,
            remarks: remarks || `Assigned to ${staff.staff_name}`
          }, 'Staff assigned successfully');
        });
      });
    });
  });
});

// Update complaint priority - auth + isAdmin required
router.put('/:id/priority', auth, isAdmin, (req, res) => {
  const complaintId = req.params.id;
  const { priority } = req.body;

  if (!['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
    return sendError(res, 400, 'Invalid priority. Use LOW, MEDIUM, or HIGH');
  }

  const sql = 'UPDATE Complaint SET priority = ? WHERE complaint_id = ?';

  db.query(sql, [priority, complaintId], (err, result) => {
    if (err) return sendError(res, 500, err.message);

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Complaint not found');
    }

    sendSuccess(res, { complaint_id: complaintId, priority }, 'Priority updated');
  });
});

// Update assignment remarks - auth + isAdmin required
router.put('/:id/remarks', auth, isAdmin, (req, res) => {
  const complaintId = req.params.id;
  const { remarks } = req.body || {};

  const sql = 'UPDATE Complaint_Assignment SET remarks = ? WHERE complaint_id = ?';

  db.query(sql, [remarks, complaintId], (err, result) => {
    if (err) return sendError(res, 500, err.message);

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Assignment not found');
    }

    sendSuccess(res, { complaint_id: complaintId, remarks }, 'Remarks updated');
  });
});

// Unassign staff from complaint - auth + isAdmin required
router.delete('/:id/assign', auth, isAdmin, (req, res) => {
  const complaintId = req.params.id;

  db.query('DELETE FROM Complaint_Assignment WHERE complaint_id = ?', [complaintId], (err, result) => {
    if (err) return sendError(res, 500, err.message);

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'No assignment found for this complaint');
    }

    sendSuccess(res, { complaint_id: complaintId }, 'Staff unassigned');
  });
});

// Update complaint status - auth + isAdmin required
// NOTE: This requires the 'status' column to be added to Complaint table first
router.put('/:id/status', auth, isAdmin, (req, res) => {
  const complaintId = req.params.id;
  const { status } = req.body;

  if (!['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'].includes(status)) {
    return sendError(res, 400, 'Invalid status. Use OPEN, IN_PROGRESS, ON_HOLD, RESOLVED, or CLOSED');
  }

  // TODO: Run this SQL first: ALTER TABLE Complaint ADD COLUMN status ENUM('OPEN','IN_PROGRESS','ON_HOLD','RESOLVED','CLOSED') DEFAULT 'OPEN';
  const sql = 'UPDATE Complaint SET status = ? WHERE complaint_id = ?';

  db.query(sql, [status, complaintId], (err, result) => {
    if (err) {
      console.error('[ERROR] Status update failed:', err.message);
      return sendError(res, 500, 'Status column not found. Please run: ALTER TABLE Complaint ADD COLUMN status ENUM(OPEN,IN_PROGRESS,ON_HOLD,RESOLVED,CLOSED) DEFAULT OPEN');
    }

    if (result.affectedRows === 0) {
      return sendError(res, 404, 'Complaint not found');
    }

    sendSuccess(res, { complaint_id: complaintId, status }, 'Status updated');
  });
});

module.exports = router;
