const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT c.complaint_id, s.full_name, c.complaint_type, c.priority, c.complaint_date
    FROM Complaint c
    JOIN Student s ON c.student_id = s.student_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post('/', (req, res) => {
  const { student_id, complaint_type, complaint_date, priority } = req.body || {};

  if (!student_id || !complaint_type || !complaint_date || !priority) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO Complaint (student_id, complaint_type, complaint_date, priority)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [student_id, complaint_type, complaint_date, priority], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Complaint created successfully', complaint_id: result.insertId });
  });
});

module.exports = router;
