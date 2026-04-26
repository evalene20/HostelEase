const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, isAdmin } = require('../middleware/authMiddleware');
const { getStaffFocus } = require('../services/aiRules');

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Get all staff - auth + isAdmin required
router.get('/', auth, isAdmin, (req, res) => {
  const sql = `
    SELECT
      s.staff_id,
      s.staff_name,
      s.role,
      s.phone_no,
      COUNT(ca.complaint_id) AS assigned_complaints
    FROM Staff s
    LEFT JOIN Complaint_Assignment ca ON ca.staff_id = s.staff_id
    GROUP BY s.staff_id, s.staff_name, s.role, s.phone_no
    ORDER BY s.staff_name
  `;

  db.query(sql, (err, result) => {
    if (err) return sendError(res, 500, err.message);

    const enriched = result.map((staff) => ({
      ...staff,
      ai_role_focus: getStaffFocus(staff.role),
    }));

    sendSuccess(res, enriched, 'Staff retrieved');
  });
});

// Create staff - auth + isAdmin required
router.post('/', auth, isAdmin, (req, res) => {
  const { staff_name, role, phone_no } = req.body || {};

  if (!staff_name || !role || !phone_no) {
    return sendError(res, 400, 'Missing required fields: staff_name, role, phone_no');
  }

  const sql = `INSERT INTO Staff (staff_name, role, phone_no) VALUES (?, ?, ?)`;

  db.query(sql, [staff_name, role, phone_no], (err, result) => {
    if (err) return sendError(res, 500, err.message);
    sendSuccess(res, { staff_id: result.insertId }, 'Staff created successfully');
  });
});

module.exports = router;
