SELECT SUM(amount) AS total_revenue FROM Payment;

SELECT complaint_type, COUNT(*) AS total
FROM Complaint
GROUP BY complaint_type;

SELECT AVG(capacity) AS avg_capacity FROM Room;