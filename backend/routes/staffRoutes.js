const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getStaffFocus } = require('../services/aiRules');

router.get('/', (req, res) => {
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
    if (err) return res.status(500).json({ error: err.message });
    const enriched = result.map((staff) => ({
      ...staff,
      ai_role_focus: getStaffFocus(staff.role),
    }));
    res.json(enriched);
  });
});

router.post('/', (req, res) => {
  const { staff_name, role, phone_no } = req.body || {};

  if (!staff_name || !role || !phone_no) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO Staff (staff_name, role, phone_no)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [staff_name, role, phone_no], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Staff created successfully', staff_id: result.insertId });
  });
});

module.exports = router;
