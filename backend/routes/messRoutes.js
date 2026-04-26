const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/authMiddleware');
const { getMessSummary } = require('../services/aiRules');

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Get all mess info - auth required
router.get('/', auth, (req, res) => {
  const sql = `
    SELECT
      m.mess_id,
      m.mess_name,
      m.incharge_name,
      h.hostel_name,
      mn.day_of_week,
      mn.meal_type,
      mn.items
    FROM Mess m
    JOIN Hostel h ON m.hostel_id = h.hostel_id
    LEFT JOIN Menu mn ON mn.mess_id = m.mess_id
    ORDER BY h.hostel_name, FIELD(mn.day_of_week, 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'), FIELD(mn.meal_type, 'BREAKFAST', 'LUNCH', 'DINNER')
  `;

  db.query(sql, (err, result) => {
    if (err) return sendError(res, 500, err.message);

    const summary = getMessSummary(result);
    const enriched = result.map((row) => ({
      ...row,
      ai_menu_note: summary,
    }));

    sendSuccess(res, enriched, 'Mess info retrieved');
  });
});

module.exports = router;
