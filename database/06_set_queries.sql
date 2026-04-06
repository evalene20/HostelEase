SELECT DISTINCT student_id 
FROM Booking 
WHERE student_id IN (
    SELECT b.student_id 
    FROM Booking b 
    JOIN Payment p ON b.booking_id = p.booking_id
);

SELECT DISTINCT b.student_id
FROM Booking b
WHERE NOT EXISTS (
  SELECT 1 FROM Payment p 
  WHERE p.booking_id = b.booking_id
);

SELECT student_id FROM Booking
UNION
SELECT student_id FROM Complaint;