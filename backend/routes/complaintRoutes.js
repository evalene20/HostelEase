const express = require('express');
const router = express.Router();
const db = require('../config/db');
const {
  assignStaff,
  predictComplaintFeedback,
  predictComplaintPriority,
} = require('../services/aiRules');

router.get('/', (req, res) => {
  const sql = `
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
        WHEN ca.staff_id IS NOT NULL THEN 'ASSIGNED'
        ELSE 'PENDING_REVIEW'
      END AS complaint_status,
      DATEDIFF(CURDATE(), c.complaint_date) AS resolution_time_days
    FROM Complaint c
    JOIN Student s ON c.student_id = s.student_id
    LEFT JOIN Complaint_Assignment ca ON ca.complaint_id = c.complaint_id
    LEFT JOIN Staff st ON ca.staff_id = st.staff_id
    ORDER BY c.complaint_date DESC, c.complaint_id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    const enriched = result.map((complaint) => ({
      ...complaint,
      ai_feedback: predictComplaintFeedback(result, complaint),
    }));
    res.json(enriched);
  });
});

router.post('/', (req, res) => {
  const { student_id, complaint_type, complaint_date } = req.body || {};

  if (!student_id || !complaint_type || !complaint_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.query('SELECT student_id, complaint_type, priority FROM Complaint', (complaintErr, complaints) => {
    if (complaintErr) return res.status(500).json({ error: complaintErr.message });

    db.query('SELECT staff_id, staff_name, role FROM Staff', (staffErr, staffList) => {
      if (staffErr) return res.status(500).json({ error: staffErr.message });

      const priorityResult = predictComplaintPriority(complaints, {
        student_id: Number(student_id),
        complaint_type,
      });

      const assignmentResult = assignStaff(complaint_type, staffList);

      const sql = `
        INSERT INTO Complaint (student_id, complaint_type, complaint_date, priority)
        VALUES (?, ?, ?, ?)
      `;

      db.query(sql, [student_id, complaint_type, complaint_date, priorityResult.predictedPriority], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!assignmentResult.assignedStaff) {
          return res.status(201).json({
            message: 'Complaint created successfully',
            complaint_id: result.insertId,
            predictedPriority: priorityResult.predictedPriority,
            ai_assignment_reason: assignmentResult.reason,
          });
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
            if (assignmentErr) return res.status(500).json({ error: assignmentErr.message });

            res.status(201).json({
              message: 'Complaint created successfully',
              complaint_id: result.insertId,
              predictedPriority: priorityResult.predictedPriority,
              assigned_staff: assignmentResult.assignedStaff.staff_name,
              ai_assignment_reason: assignmentResult.reason,
            });
          }
        );
      });
    });
  });
});

module.exports = router;
