SELECT s.full_name, r.room_no
FROM Student s
JOIN Booking b ON s.student_id = b.student_id
JOIN Room r ON b.room_id = r.room_id;

SELECT c.complaint_type, s.staff_name
FROM Complaint c
JOIN Complaint_Assignment ca ON c.complaint_id = ca.complaint_id
JOIN Staff s ON ca.staff_id = s.staff_id;

SELECT m.mess_name, menu.day_of_week, menu.meal_type
FROM Mess m
JOIN Menu menu ON m.mess_id = menu.mess_id;