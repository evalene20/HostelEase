const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { suggestBookingDecision } = require('../services/aiRules');

// GET bookings
router.get('/', (req, res) => {
  const sql = `
    SELECT
      b.booking_id,
      b.student_id,
      b.room_id,
      b.booking_date,
      s.full_name,
      s.register_no,
      r.room_no,
      r.capacity,
      h.hostel_name,
      COUNT(CASE WHEN b2.status = 'APPROVED' THEN 1 END) AS current_occupancy,
      b.status
    FROM Booking b
    JOIN Student s ON b.student_id = s.student_id
    JOIN Room r ON b.room_id = r.room_id
    JOIN Hostel h ON r.hostel_id = h.hostel_id
    LEFT JOIN Booking b2 ON b2.room_id = r.room_id
    GROUP BY b.booking_id, b.student_id, b.room_id, b.booking_date, s.full_name, s.register_no, r.room_no, r.capacity, h.hostel_name, b.status
    ORDER BY b.booking_date DESC, b.booking_id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const enriched = result.map((booking) => {
      const suggestion = suggestBookingDecision(booking);
      return {
        ...booking,
        ai_booking_decision: suggestion.decision,
        ai_booking_reason: suggestion.reason,
      };
    });

    res.json(enriched);
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

    res.json({ message: 'Booking processed successfully', ai_booking_reason: 'Booking request stored and ready for approval review' });
  });
});

module.exports = router;
