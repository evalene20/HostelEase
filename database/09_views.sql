CREATE VIEW approved_bookings AS
SELECT * FROM Booking WHERE status = 'APPROVED';

CREATE VIEW payment_summary AS
SELECT booking_id, SUM(amount) AS total_paid
FROM Payment
GROUP BY booking_id;

CREATE VIEW complaint_status AS
SELECT c.complaint_id, s.staff_name
FROM Complaint c
JOIN Complaint_Assignment ca ON c.complaint_id = ca.complaint_id
JOIN Staff s ON ca.staff_id = s.staff_id;