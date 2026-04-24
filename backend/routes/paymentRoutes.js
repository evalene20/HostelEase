const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT p.payment_id, s.full_name, p.amount, p.payment_status, p.payment_date
    FROM Payment p
    JOIN Booking b ON p.booking_id = b.booking_id
    JOIN Student s ON b.student_id = s.student_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;