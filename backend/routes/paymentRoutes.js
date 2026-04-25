const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { detectPaymentRisk } = require('../services/aiRules');

router.get('/', (req, res) => {
  const sql = `
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

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const enriched = result.map((payment) => {
      const risk = detectPaymentRisk(
        result.filter((candidate) => Number(candidate.student_id) === Number(payment.student_id))
      );

      return {
        ...payment,
        student_payment_risk: risk.riskLevel,
        ai_payment_reason: risk.reason,
      };
    });

    res.json(enriched);
  });
});

router.post('/', (req, res) => {
  const { booking_id, amount, payment_date, payment_status } = req.body || {};

  if (!booking_id || !amount || !payment_date || !payment_status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO Payment (booking_id, amount, payment_date, payment_status)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [booking_id, amount, payment_date, payment_status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: 'Payment created successfully',
      payment_id: result.insertId,
      ai_payment_note: payment_status === 'FAILED' ? 'Payment risk warning triggered' : 'Payment recorded successfully',
    });
  });
});

module.exports = router;
