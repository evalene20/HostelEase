const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all students
router.get('/', (req, res, next) => {
  db.query('SELECT * FROM Student', (err, result) => {
    if (err) return next(err);
    res.json(result);
  });
});

// ADD student
router.post('/', (req, res, next) => {
  const { register_no, full_name, college_id } = req.body;

  const query = `
    INSERT INTO Student (register_no, full_name, college_id)
    VALUES (?, ?, ?)
  `;

  db.query(query, [register_no, full_name, college_id], (err) => {
    if (err) return next(err);
    res.send('Student added');
  });
});

module.exports = router;