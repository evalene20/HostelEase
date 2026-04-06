SELECT DISTINCT b.student_id
FROM Booking b
WHERE b.booking_id IN (
SELECT booking_id FROM Payment
WHERE amount > (SELECT AVG(amount) FROM Payment)
);

SELECT * FROM Room
WHERE capacity > (SELECT AVG(capacity) FROM Room);

SELECT student_id
FROM Complaint
GROUP BY student_id
HAVING COUNT(*) > 1;