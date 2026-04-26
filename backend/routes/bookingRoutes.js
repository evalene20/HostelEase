const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { suggestBookingDecision } = require('../services/aiRules');
const { auth, isAdmin } = require('../middleware/authMiddleware');

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Get all bookings - auth required (STUDENT sees own, ADMIN sees all)
router.get('/', auth, (req, res) => {
  const { role, userId } = req.user;
  console.log('[DEBUG] /bookings GET - req.user:', { role, userId });

  let sql;
  let params = [];

  if (role === 'STUDENT') {
    sql = `
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
      WHERE b.student_id = ?
      GROUP BY b.booking_id
      ORDER BY b.booking_date DESC, b.booking_id DESC
    `;
    params = [userId];
  } else {
    sql = `
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
  }

  console.log('[DEBUG] /bookings GET - SQL:', sql.replace(/\s+/g, ' ').trim());
  console.log('[DEBUG] /bookings GET - params:', params);

  db.query(sql, params, (err, result) => {
    if (err) return sendError(res, 500, err.message);
    console.log('[DEBUG] /bookings GET - result count:', result.length);

    const enriched = result.map((booking) => {
      const suggestion = suggestBookingDecision(booking);
      return {
        ...booking,
        ai_booking_decision: suggestion.decision,
        ai_booking_reason: suggestion.reason,
      };
    });

    console.log('[DEBUG] /bookings GET - returning', enriched.length, 'bookings');
    sendSuccess(res, enriched, 'Bookings retrieved');
  });
});

// Create booking - auth required + duplicate check
router.post('/', auth, (req, res) => {
  const { student_id, room_id, booking_date } = req.body || {};

  if (!student_id || !room_id || !booking_date) {
    return sendError(res, 400, 'Missing required fields: student_id, room_id, booking_date');
  }

  const checkSql = `
    SELECT * FROM Booking
    WHERE student_id = ?
    AND status IN ('REQUESTED','APPROVED')
  `;

  db.query(checkSql, [student_id], (err, existing) => {
    if (err) return sendError(res, 500, err.message);

    if (existing.length > 0) {
      return sendError(res, 400, 'Active booking already exists for this student');
    }

    const sql = `CALL SafeInsertBooking(?, ?, ?)`;

    db.query(sql, [student_id, room_id, booking_date], (err) => {
      if (err) return sendError(res, 500, err.message);

      sendSuccess(res, {
        ai_booking_reason: 'Pending admin approval based on room capacity'
      }, 'Booking request created');
    });
  });
});

// Update booking status - auth + isAdmin required
router.put('/:id/status', auth, isAdmin, (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return sendError(res, 400, 'Invalid status. Use APPROVED or REJECTED');
  }

  const sql = `UPDATE Booking SET status = ? WHERE booking_id = ?`;

  db.query(sql, [status, bookingId], (err) => {
    if (err) return sendError(res, 500, err.message);

    sendSuccess(res, { booking_id: bookingId, status }, `Booking ${status.toLowerCase()}`);
  });
});

module.exports = router;