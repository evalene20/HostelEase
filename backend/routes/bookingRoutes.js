const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { suggestBookingDecision } = require('../services/aiRules');
const { auth, isAdmin } = require('../middleware/authMiddleware');

// get bookings with ai rule based

router.get('/', auth, (req, res) => {
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
    GROUP BY b.booking_id
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

// create booking

router.post('/', auth, (req, res) => {
  const { student_id, room_id, booking_date } = req.body || {};

  if (!student_id || !room_id || !booking_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // no duplicate active bookings
 const checkSql = `
  SELECT * FROM Booking
  WHERE student_id = ?
  AND status IN ('REQUESTED','APPROVED')
`;

db.query(checkSql, [student_id], (err, existing) => {
  if (err) return res.status(500).json({ error: err.message });

  if (existing.length > 0) {
    return res.status(400).json({
      error: 'Active booking already exists for this student'
    });
  }

  // proceed
});

    // Call stored procedure
    const sql = `CALL SafeInsertBooking(?, ?, ?)`;

    db.query(sql, [student_id, room_id, booking_date], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: 'Booking request created',
        ai_booking_reason: 'Pending admin approval based on room capacity'
      });
    });
  });


router.put('/:id/status', auth, isAdmin, (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const sql = `UPDATE Booking SET status = ? WHERE booking_id = ?`;

  db.query(sql, [status, bookingId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: `Booking ${status}` });
  });
});



module.exports = router;