const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all rooms
router.get('/', (req, res, next) => {
  db.query('SELECT * FROM Room', (err, result) => {
    if (err) return next(err);
    res.json(result);
  });
});

module.exports = router;