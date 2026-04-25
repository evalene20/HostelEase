const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { summarizeStudentRisk } = require('../services/aiRules');

router.get('/', (req, res) => {
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
    ORDER BY s.student_id;
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query('SELECT student_id, complaint_type FROM Complaint', (complaintErr, complaints) => {
      if (complaintErr) return res.status(500).json({ error: complaintErr.message });

      db.query(
        `
          SELECT b.student_id, p.payment_status
          FROM Payment p
          JOIN Booking b ON p.booking_id = b.booking_id
        `,
        (paymentErr, payments) => {
          if (paymentErr) return res.status(500).json({ error: paymentErr.message });

          const enriched = result.map((student) => {
            const risk = summarizeStudentRisk(
              complaints.filter((complaint) => Number(complaint.student_id) === Number(student.student_id)),
              payments.filter((payment) => Number(payment.student_id) === Number(student.student_id))
            );

            return {
              ...student,
              ai_student_risk: risk.level,
              ai_student_risk_reason: risk.reason,
            };
          });

          res.json(enriched);
        }
      );
    });
  });
});

router.post('/', (req, res) => {
  const { register_no, full_name, college_id } = req.body || {};

  if (!register_no || !full_name || !college_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO Student (register_no, full_name, college_id)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [register_no, full_name, college_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Student created successfully', student_id: result.insertId });
  });
});

module.exports = router;
