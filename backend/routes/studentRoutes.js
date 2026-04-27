const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/authMiddleware');
const { summarizeStudentRisk } = require('../services/aiRules');

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Get all students - auth required
router.get('/', auth, (req, res) => {
  const sql = `
    SELECT
      s.student_id,
      s.full_name,
      s.register_no,
      c.college_name,
      b.booking_id,
      b.status AS booking_status,
      b.booking_date,
      r.room_id,
      r.room_no,
      h.hostel_name
    FROM Student s
    LEFT JOIN College c ON s.college_id = c.college_id
    LEFT JOIN Booking b ON b.booking_id = (
      SELECT b2.booking_id
      FROM Booking b2
      WHERE b2.student_id = s.student_id
      ORDER BY FIELD(b2.status, 'APPROVED', 'REQUESTED', 'REJECTED', 'CANCELLED'), b2.booking_date DESC
      LIMIT 1
    )
    LEFT JOIN Room r ON b.room_id = r.room_id
    LEFT JOIN Hostel h ON r.hostel_id = h.hostel_id
    ORDER BY s.student_id
  `;

  db.query(sql, (err, result) => {
    if (err) return sendError(res, 500, err.message);

    db.query('SELECT student_id, complaint_type FROM Complaint', (complaintErr, complaints) => {
      if (complaintErr) return sendError(res, 500, complaintErr.message);

      db.query(
        `SELECT b.student_id, p.payment_status FROM Payment p JOIN Booking b ON p.booking_id = b.booking_id`,
        (paymentErr, payments) => {
          if (paymentErr) return sendError(res, 500, paymentErr.message);

          const enriched = result.map((student) => {
            const risk = summarizeStudentRisk(
              complaints.filter((c) => Number(c.student_id) === Number(student.student_id)),
              payments.filter((p) => Number(p.student_id) === Number(student.student_id))
            );
            return {
              ...student,
              ai_student_risk: risk.level,
              ai_student_risk_reason: risk.reason,
            };
          });

          sendSuccess(res, enriched, 'Students retrieved');
        }
      );
    });
  });
});

// Create student - auth required
router.post('/', auth, (req, res) => {
  const { register_no, full_name, college_id } = req.body || {};

  if (!register_no || !full_name || !college_id) {
    return sendError(res, 400, 'Missing required fields: register_no, full_name, college_id');
  }

  const sql = `INSERT INTO Student (register_no, full_name, college_id) VALUES (?, ?, ?)`;

  db.query(sql, [register_no, full_name, college_id], (err, result) => {
    if (err) return sendError(res, 500, err.message);
    sendSuccess(res, { student_id: result.insertId }, 'Student created successfully');
  });
});

// Toggle flag for review - auth required
router.put('/:id/flag', auth, (req, res) => {
  const studentId = req.params.id;
  const { flagged = true, reason = '' } = req.body || {};

  const sql = `
    INSERT INTO Student_Flag (student_id, flagged, reason, flagged_on)
    VALUES (?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE flagged = ?, reason = ?, flagged_on = NOW()
  `;

  db.query(sql, [studentId, flagged, reason, flagged, reason], (err, result) => {
    if (err) return sendError(res, 500, err.message);
    sendSuccess(res, { student_id: studentId, flagged }, flagged ? 'Student flagged for review' : 'Flag removed');
  });
});

module.exports = router;
