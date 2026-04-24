const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', (req, res) => {
  const sql = `
    SELECT r.room_id, r.room_no, r.capacity, h.hostel_name
    FROM Room r
    JOIN Hostel h ON r.hostel_id = h.hostel_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;