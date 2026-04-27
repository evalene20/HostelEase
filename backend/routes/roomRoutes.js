const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/authMiddleware');
const { getRoomStatusNote } = require('../services/aiRules');

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Get all rooms - auth required
router.get('/', auth, (req, res) => {
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
    if (err) return sendError(res, 500, err.message);

    const enriched = result.map((room) => ({
      ...room,
      ai_room_alert: getRoomStatusNote(room),
    }));

    sendSuccess(res, enriched, 'Rooms retrieved');
  });
});

// Create room - auth required
router.post('/', auth, (req, res) => {
  const { hostel_id, room_no, capacity } = req.body || {};

  if (!hostel_id || !room_no || !capacity) {
    return sendError(res, 400, 'Missing required fields: hostel_id, room_no, capacity');
  }

  const sql = `INSERT INTO Room (hostel_id, room_no, capacity) VALUES (?, ?, ?)`;

  db.query(sql, [hostel_id, room_no, capacity], (err, result) => {
    if (err) return sendError(res, 500, err.message);
    sendSuccess(res, { room_id: result.insertId }, 'Room created successfully');
  });
});

// Maintenance request for room - auth required
router.post('/:id/maintenance', auth, (req, res) => {
  const roomId = req.params.id;
  const { issue_type = 'GENERAL', description = '' } = req.body || {};

  const sql = `INSERT INTO Room_Maintenance (room_id, issue_type, description, status, requested_on) VALUES (?, ?, ?, 'PENDING', NOW())`;

  db.query(sql, [roomId, issue_type, description], (err, result) => {
    if (err) return sendError(res, 500, err.message);
    sendSuccess(res, { maintenance_id: result.insertId }, 'Maintenance request submitted');
  });
});

// Policy inspection for room - auth required
router.post('/:id/policy', auth, (req, res) => {
  const roomId = req.params.id;
  const { notes = '' } = req.body || {};

  const sql = `INSERT INTO Room_Inspection (room_id, inspection_type, notes, inspected_on) VALUES (?, 'POLICY', ?, NOW())`;

  db.query(sql, [roomId, notes], (err, result) => {
    if (err) return sendError(res, 500, err.message);
    sendSuccess(res, { inspection_id: result.insertId }, 'Policy inspection recorded');
  });
});

module.exports = router;
