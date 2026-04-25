const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { getRoomStatusNote } = require('../services/aiRules');

router.get('/', (req, res) => {
  const sql = `
    SELECT
      r.room_id,
      r.room_no,
      r.capacity,
      h.hostel_name,
      h.hostel_id,
      COUNT(CASE WHEN b.status = 'APPROVED' THEN 1 END) AS current_occupancy,
      CASE
        WHEN COUNT(CASE WHEN b.status = 'APPROVED' THEN 1 END) >= r.capacity THEN 'FULL'
        WHEN COUNT(CASE WHEN b.status = 'APPROVED' THEN 1 END) >= r.capacity - 1 THEN 'NEARLY_FULL'
        ELSE 'AVAILABLE'
      END AS occupancy_status
    FROM Room r
    JOIN Hostel h ON r.hostel_id = h.hostel_id
    LEFT JOIN Booking b ON b.room_id = r.room_id
    GROUP BY r.room_id, r.room_no, r.capacity, h.hostel_name, h.hostel_id
    ORDER BY h.hostel_name, r.room_no
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    const enriched = result.map((room) => ({
      ...room,
      ai_room_alert: getRoomStatusNote(room),
    }));

    res.json(enriched);
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
