const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/authMiddleware');
const { detectPaymentRisk } = require('../services/aiRules');

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Get all payments - auth required (STUDENT sees own, ADMIN sees all or filtered by student_id)
router.get('/', auth, (req, res) => {
  const { role, userId } = req.user;
  const { student_id } = req.query;
  console.log('[DEBUG] /payments GET - req.user:', { role, userId, student_id });

  let sql;
  let params = [];

  if (role === 'STUDENT') {
    sql = `
      SELECT
        p.payment_id,
        p.booking_id,
        b.student_id,
        s.full_name,
        p.amount,
        p.payment_status,
        p.payment_date
      FROM Payment p
      JOIN Booking b ON p.booking_id = b.booking_id
      JOIN Student s ON b.student_id = s.student_id
      WHERE b.student_id = ?
      ORDER BY p.payment_date DESC, p.payment_id DESC
    `;
    params = [userId];
  } else if (student_id) {
    // Admin filtering by specific student
    sql = `
      SELECT
        p.payment_id,
        p.booking_id,
        b.student_id,
        s.full_name,
        p.amount,
        p.payment_status,
        p.payment_date
      FROM Payment p
      JOIN Booking b ON p.booking_id = b.booking_id
      JOIN Student s ON b.student_id = s.student_id
      WHERE b.student_id = ?
      ORDER BY p.payment_date DESC, p.payment_id DESC
    `;
    params = [student_id];
  } else {
    // Admin sees all
    sql = `
      SELECT
        p.payment_id,
        p.booking_id,
        b.student_id,
        s.full_name,
        p.amount,
        p.payment_status,
        p.payment_date
      FROM Payment p
      JOIN Booking b ON p.booking_id = b.booking_id
      JOIN Student s ON b.student_id = s.student_id
      ORDER BY p.payment_date DESC, p.payment_id DESC
    `;
  }

  console.log('[DEBUG] /payments GET - SQL params:', params);

  db.query(sql, params, (err, result) => {
    if (err) return sendError(res, 500, err.message);
    console.log('[DEBUG] /payments GET - result count:', result.length);

    const enriched = result.map((payment) => {
      const risk = detectPaymentRisk(
        result.filter((c) => Number(c.student_id) === Number(payment.student_id))
      );
      return {
        ...payment,
        student_payment_risk: risk.riskLevel,
        ai_payment_reason: risk.reason,
      };
    });

    sendSuccess(res, enriched, 'Payments retrieved');
  });
});

// Create payment - auth required
router.post('/', auth, (req, res) => {
  const { booking_id, amount, payment_date, payment_status } = req.body || {};

  if (!booking_id || !amount || !payment_date || !payment_status) {
    return sendError(res, 400, 'Missing required fields: booking_id, amount, payment_date, payment_status');
  }

  const sql = `INSERT INTO Payment (booking_id, amount, payment_date, payment_status) VALUES (?, ?, ?, ?)`;

  db.query(sql, [booking_id, amount, payment_date, payment_status], (err, result) => {
    if (err) return sendError(res, 500, err.message);

    sendSuccess(res, {
      payment_id: result.insertId,
      ai_payment_note: payment_status === 'FAILED' ? 'Payment risk warning triggered' : 'Payment recorded successfully'
    }, 'Payment created successfully');
  });
});

module.exports = router;
