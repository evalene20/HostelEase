const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET complaints
router.get('/', (req, res, next) => {
  db.query('SELECT * FROM Complaint', (err, result) => {
    if (err) return next(err);
    res.json(result);
  });
});

// ADD complaint with smart priority
router.post('/', (req, res, next) => {
  const { student_id, complaint_type, complaint_date } = req.body;

  let priority = 'MEDIUM';

  if (complaint_type === 'WATER') priority = 'HIGH';
  else if (complaint_type === 'CLEANING') priority = 'LOW';
  else if (complaint_type === 'INTERNET') priority = 'MEDIUM';

  const query = `
    INSERT INTO Complaint (student_id, complaint_type, complaint_date, priority)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [student_id, complaint_type, complaint_date, priority], (err) => {
    if (err) return next(err);
    res.send(`Complaint added with priority ${priority}`);
  });
});

module.exports = router;