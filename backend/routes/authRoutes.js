const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { auth } = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-ease-secret-key';

// Simple admin credentials (in production, use hashed passwords in DB)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

// Login endpoint
router.post('/login', (req, res) => {
  const { role, username, password, studentId } = req.body || {};

  if (!role || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (role === 'admin') {
    // Admin login
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { role: 'ADMIN', username, userId: 0 },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      role: 'ADMIN',
      username,
      message: 'Login successful'
    });
  }

  if (role === 'student') {
    // Student login - verify student exists
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID required' });
    }

    const sql = `
      SELECT s.student_id, s.full_name, s.register_no, c.college_name
      FROM Student s
      JOIN College c ON s.college_id = c.college_id
      WHERE s.student_id = ?
    `;

    db.query(sql, [studentId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(401).json({ error: 'Student not found' });
      }

      const student = results[0];

      // For simplicity, any password works for students in this demo
      // In production, you'd verify against a stored hashed password
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

      return res.json({
        token,
        role: 'STUDENT',
        username: student.full_name,
        studentId: student.student_id,
        registerNo: student.register_no,
        collegeName: student.college_name,
        message: 'Login successful'
      });
    });
    return;
  }

  return res.status(400).json({ error: 'Invalid role' });
});

// Verify token endpoint
router.get('/verify', auth, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// Get current user profile
router.get('/profile', auth, (req, res) => {
  const { userId, role } = req.user;

  if (role === 'ADMIN') {
    return res.json({
      role: 'ADMIN',
      username: req.user.username,
      permissions: ['all']
    });
  }

  // Student profile
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
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      // Get basic student info even without booking
      const basicSql = `
        SELECT s.student_id, s.full_name, s.register_no, c.college_name, c.city, c.contact_email
        FROM Student s
        JOIN College c ON s.college_id = c.college_id
        WHERE s.student_id = ?
      `;
      db.query(basicSql, [userId], (basicErr, basicResults) => {
        if (basicErr) return res.status(500).json({ error: basicErr.message });
        if (basicResults.length === 0) {
          return res.status(404).json({ error: 'Student not found' });
        }
        return res.json({
          role: 'STUDENT',
          ...basicResults[0],
          hostel_name: null,
          room_no: null,
          booking_status: null
        });
      });
      return;
    }

    res.json({
      role: 'STUDENT',
      ...results[0]
    });
  });
});

module.exports = router;
