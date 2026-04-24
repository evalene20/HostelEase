const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET bookings
router.get('/', (req, res) => {
  const sql = `
    SELECT b.booking_id, s.full_name, r.room_no, h.hostel_name, b.status
    FROM Booking b
    JOIN Student s ON b.student_id = s.student_id
    JOIN Room r ON b.room_id = r.room_id
    JOIN Hostel h ON r.hostel_id = h.hostel_id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// POST booking (using procedure)
router.post('/', (req, res) => {
  const { student_id, room_id, booking_date } = req.body || {};

  if (!student_id || !room_id || !booking_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `CALL SafeInsertBooking(?, ?, ?)`;

  db.query(sql, [student_id, room_id, booking_date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Booking processed successfully' });
  });
});

module.exports = router;