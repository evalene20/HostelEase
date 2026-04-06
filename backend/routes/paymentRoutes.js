const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET payments
router.get('/', (req, res, next) => {
  db.query('SELECT * FROM Payment', (err, result) => {
    if (err) return next(err);
    res.json(result);
  });
});

// ADD payment
router.post('/', (req, res, next) => {
  const { booking_id, amount, payment_date } = req.body;

  const query = `
    INSERT INTO Payment (booking_id, amount, payment_date, payment_status)
    VALUES (?, ?, ?, 'SUCCESS')
  `;

  db.query(query, [booking_id, amount, payment_date], (err) => {
    if (err) return next(err);
    res.send('Payment added');
  });
});

module.exports = router;