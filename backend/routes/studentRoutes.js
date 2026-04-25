const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT s.student_id, s.full_name, s.register_no, c.college_name
FROM Student s
LEFT JOIN College c ON s.college_id = c.college_id;
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

router.post('/', (req, res) => {
  const { register_no, full_name, college_id } = req.body || {};

  if (!register_no || !full_name || !college_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO Student (register_no, full_name, college_id)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [register_no, full_name, college_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Student created successfully', student_id: result.insertId });
  });
});

module.exports = router;
