const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { auth } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-ease-secret-key';

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Login - no auth required
router.post('/login', (req, res) => {
  const { role, username, password, studentId } = req.body || {};

  if (!role || !username || !password) {
    return sendError(res, 400, 'Missing required fields: role, username, password');
  }

  if (role === 'admin') {
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = jwt.sign(
      { role: 'ADMIN', username, userId: 0 },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return sendSuccess(res, {
      token,
      role: 'ADMIN',
      username
    }, 'Login successful');
  }

  if (role === 'student') {
    if (!studentId) {
      return sendError(res, 400, 'Student ID required');
    }

    const sql = `
      SELECT s.student_id, s.full_name, s.register_no, c.college_name
      FROM Student s
      JOIN College c ON s.college_id = c.college_id
      WHERE s.student_id = ? AND s.password = ?
    `;

    db.query(sql, [studentId, password], (err, results) => {
      if (err) return sendError(res, 500, err.message);

      if (results.length === 0) {
        return sendError(res, 401, 'Student not found');
      }

      const student = results[0];
      const token = jwt.sign(
        {
          role: 'STUDENT',
          username: student.full_name,
          userId: student.student_id,
          registerNo: student.register_no
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return sendSuccess(res, {
        token,
        role: 'STUDENT',
        username: student.full_name,
        studentId: student.student_id,
        registerNo: student.register_no,
        collegeName: student.college_name
      }, 'Login successful');
    });
    return;
  }

  return sendError(res, 400, 'Invalid role');
});

// Verify token - auth required
router.get('/verify', auth, (req, res) => {
  sendSuccess(res, { user: req.user }, 'Token valid');
});

// Get profile - auth required
router.get('/profile', auth, (req, res) => {
  const { userId, role } = req.user;

  if (role === 'ADMIN') {
    return sendSuccess(res, {
      role: 'ADMIN',
      username: req.user.username,
      permissions: ['all']
    }, 'Profile loaded');
  }

  const sql = `
    SELECT
      s.student_id,
      s.full_name,
      s.register_no,
      c.college_name,
      c.city,
      c.contact_email,
      h.hostel_name,
      h.location,
      r.room_no,
      r.capacity,
      b.status as booking_status,
      b.booking_date
    FROM Student s
    JOIN College c ON s.college_id = c.college_id
    LEFT JOIN Booking b ON b.student_id = s.student_id AND b.status = 'APPROVED'
    LEFT JOIN Room r ON b.room_id = r.room_id
    LEFT JOIN Hostel h ON r.hostel_id = h.hostel_id
    WHERE s.student_id = ?
    ORDER BY b.booking_date DESC
    LIMIT 1
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return sendError(res, 500, err.message);

    if (results.length === 0) {
      const basicSql = `
        SELECT s.student_id, s.full_name, s.register_no, c.college_name, c.city, c.contact_email
        FROM Student s
        JOIN College c ON s.college_id = c.college_id
        WHERE s.student_id = ?
      `;
      db.query(basicSql, [userId], (basicErr, basicResults) => {
        if (basicErr) return sendError(res, 500, basicErr.message);
        if (basicResults.length === 0) {
          return sendError(res, 404, 'Student not found');
        }
        return sendSuccess(res, {
          role: 'STUDENT',
          ...basicResults[0],
          hostel_name: null,
          room_no: null,
          booking_status: null
        }, 'Profile loaded');
      });
      return;
    }

    sendSuccess(res, { role: 'STUDENT', ...results[0] }, 'Profile loaded');
  });
});

module.exports = router;
