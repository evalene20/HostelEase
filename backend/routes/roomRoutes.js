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

router.post('/', (req, res) => {
  const { hostel_id, room_no, capacity } = req.body || {};

  if (!hostel_id || !room_no || !capacity) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO Room (hostel_id, room_no, capacity)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [hostel_id, room_no, capacity], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Room created successfully', room_id: result.insertId });
  });
});

module.exports = router;
