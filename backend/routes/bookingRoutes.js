const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET bookings (JOIN)
router.get('/', (req, res, next) => {
  const query = `
    SELECT 
      b.booking_id,
      s.full_name,
      r.room_no,
      b.booking_date,
      b.status
    FROM Booking b
    JOIN Student s ON b.student_id = s.student_id
    JOIN Room r ON b.room_id = r.room_id
  `;

  db.query(query, (err, result) => {
    if (err) return next(err);
    res.json(result);
  });
});

// ADD booking with capacity check
router.post('/', (req, res, next) => {
  const { student_id, room_id, booking_date } = req.body;

  const capacityQuery = `SELECT capacity FROM Room WHERE room_id = ?`;

  db.query(capacityQuery, [room_id], (err, roomResult) => {
    if (err) return next(err);

    if (roomResult.length === 0) {
      return res.status(404).send('Room not found');
    }

    const capacity = roomResult[0].capacity;

    const countQuery = `
      SELECT COUNT(*) AS count
      FROM Booking
      WHERE room_id = ? AND status = 'APPROVED'
    `;

    db.query(countQuery, [room_id], (err, countResult) => {
      if (err) return next(err);

      const count = countResult[0].count;

      if (count >= capacity) {
        return res.status(400).send('Room is full');
      }

      const insertQuery = `
        INSERT INTO Booking (student_id, room_id, booking_date, status)
        VALUES (?, ?, ?, 'REQUESTED')
      `;

      db.query(insertQuery, [student_id, room_id, booking_date], (err) => {
        if (err) return next(err);
        res.send('Booking created');
      });
    });
  });
});

module.exports = router;