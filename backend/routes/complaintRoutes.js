const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, isStudent } = require('../middleware/authMiddleware');
const {
  assignStaff,
  predictComplaintFeedback,
  predictComplaintPriority,
} = require('../services/aiRules');

const sendSuccess = (res, data, message = 'Success') => {
  return res.json({ success: true, message, data });
};

const sendError = (res, status, message) => {
  return res.status(status).json({ success: false, message, data: null });
};

// Get all complaints - auth required (STUDENT sees own, ADMIN sees all)
router.get('/', auth, (req, res) => {
  const { role, userId } = req.user;
  console.log('[DEBUG] /complaints GET - req.user:', { role, userId });

  let sql;
  let params = [];

  if (role === 'STUDENT') {
    sql = `
      SELECT
        c.complaint_id,
        c.student_id,
        s.full_name,
        c.complaint_type,
        c.priority,
        c.complaint_date,
        st.staff_name AS assigned_staff,
        st.role AS assigned_role,
        ca.assigned_on,
        ca.remarks,
        CASE
          WHEN ca.staff_id IS NOT NULL THEN 'IN_PROGRESS'
          ELSE 'OPEN'
        END AS complaint_status,
        DATEDIFF(CURDATE(), c.complaint_date) AS resolution_time_days
      FROM Complaint c
      JOIN Student s ON c.student_id = s.student_id
      LEFT JOIN Complaint_Assignment ca ON ca.complaint_id = c.complaint_id
      LEFT JOIN Staff st ON ca.staff_id = st.staff_id
      WHERE c.student_id = ?
      ORDER BY c.complaint_date DESC, c.complaint_id DESC
    `;
    params = [userId];
  } else {
    sql = `
      SELECT
        c.complaint_id,
        c.student_id,
        s.full_name,
        c.complaint_type,
        c.priority,
        c.complaint_date,
        st.staff_name AS assigned_staff,
        st.role AS assigned_role,
        ca.assigned_on,
        ca.remarks,
        CASE
          WHEN ca.staff_id IS NOT NULL THEN 'IN_PROGRESS'
          ELSE 'OPEN'
        END AS complaint_status,
        DATEDIFF(CURDATE(), c.complaint_date) AS resolution_time_days
      FROM Complaint c
      JOIN Student s ON c.student_id = s.student_id
      LEFT JOIN Complaint_Assignment ca ON ca.complaint_id = c.complaint_id
      LEFT JOIN Staff st ON ca.staff_id = st.staff_id
      ORDER BY c.complaint_date DESC, c.complaint_id DESC
    `;
  }

  console.log('[DEBUG] /complaints GET - SQL params:', params);

  db.query(sql, params, (err, result) => {
    if (err) return sendError(res, 500, err.message);
    console.log('[DEBUG] /complaints GET - result count:', result.length);
    const enriched = result.map((complaint) => ({
      ...complaint,
      ai_feedback: predictComplaintFeedback(result, complaint),
    }));
    sendSuccess(res, enriched, 'Complaints retrieved');
  });
});

// Create complaint - auth + isStudent required
router.post('/', auth, isStudent, (req, res) => {
  const { complaint_type, complaint_date } = req.body || {};
  const { userId } = req.user;

  if (!complaint_type || !complaint_date) {
    return sendError(res, 400, 'Missing required fields: complaint_type, complaint_date');
  }

  db.query('SELECT student_id, complaint_type, priority FROM Complaint', (complaintErr, complaints) => {
    if (complaintErr) return sendError(res, 500, complaintErr.message);

    db.query('SELECT staff_id, staff_name, role FROM Staff', (staffErr, staffList) => {
      if (staffErr) return sendError(res, 500, staffErr.message);

      const priorityResult = predictComplaintPriority(complaints, {
        student_id: Number(userId),
        complaint_type,
      });

      const assignmentResult = assignStaff(complaint_type, staffList);

      const sql = `
        INSERT INTO Complaint (student_id, complaint_type, complaint_date, priority)
        VALUES (?, ?, ?, ?)
      `;

      db.query(sql, [userId, complaint_type, complaint_date, priorityResult.predictedPriority], (err, result) => {
        if (err) return sendError(res, 500, err.message);

        const responseData = {
          complaint_id: result.insertId,
          predictedPriority: priorityResult.predictedPriority,
          ai_assignment_reason: assignmentResult.reason,
        };

        if (!assignmentResult.assignedStaff) {
          return sendSuccess(res, responseData, 'Complaint created successfully');
        }

        db.query(
          `
            INSERT INTO Complaint_Assignment (complaint_id, staff_id, assigned_on, remarks)
            VALUES (?, ?, CURDATE(), ?)
          `,
          [
            result.insertId,
            assignmentResult.assignedStaff.staff_id,
            `Auto-assigned by rule engine for ${complaint_type}`,
          ],
          (assignmentErr) => {
            if (assignmentErr) return sendError(res, 500, assignmentErr.message);

            sendSuccess(res, {
              ...responseData,
              assigned_staff: assignmentResult.assignedStaff.staff_name,
            }, 'Complaint created and assigned successfully');
          }
        );
      });
    });
  });
});

module.exports = router;
