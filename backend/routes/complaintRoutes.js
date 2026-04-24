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

module.exports = router;