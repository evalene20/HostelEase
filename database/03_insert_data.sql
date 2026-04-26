INSERT INTO College (college_name, city, contact_email) VALUES
('ABC Engineering College','Chennai','contact@abce.edu'),
('XYZ Arts & Science College','Coimbatore','info@xyzcollege.edu');

INSERT INTO Student (register_no, full_name, college_id) VALUES
('REG2025CS001','Murali M',1),
('REG2025CS002','Ananya R',1),
('REG2025AS011','Karthik S',2);

INSERT INTO Hostel (hostel_name, hostel_type, location) VALUES
('Green Residency','BOYS','Block A'),
('Blue Residency','GIRLS','Block B');

INSERT INTO Room (hostel_id, room_no, capacity) VALUES
(1,'A101',3),
(1,'A102',2),
(2,'B201',3);

INSERT INTO Booking (student_id, room_id, booking_date, status) VALUES
(1,1,'2026-02-01','APPROVED'),
(2,2,'2026-02-03','REQUESTED'),
(3,3,'2026-02-04','APPROVED');

INSERT INTO Payment (booking_id, amount, payment_date, payment_status) VALUES
(1,12000.00,'2026-02-02','SUCCESS'),
(3,15000.00,'2026-02-05','SUCCESS');

INSERT INTO Payment_Details (payment_id, line_no, mode, transaction_ref) VALUES
(1,1,'UPI','TXN-UPI-10001'),
(1,2,'CARD','TXN-CRD-10002'),
(2,1,'NETBANKING','TXN-NB-20001');

INSERT INTO Complaint (student_id, complaint_type, complaint_date, priority) VALUES
(1,'WATER','2026-02-06','HIGH'),
(1,'INTERNET','2026-02-07','MEDIUM'),
(3,'CLEANING','2026-02-08','LOW');

INSERT INTO Staff (staff_name, role, phone_no) VALUES
('Ravi Kumar','MAINTENANCE','9000011111'),
('Sita Devi','HOUSEKEEPING','9000022222'),
('Joseph','WARDEN','9000033333'),
('Mani','MESS','9000044444');

INSERT INTO Complaint_Assignment (complaint_id, staff_id, assigned_on, remarks) VALUES
(1,1,'2026-02-06','Check motor/pipeline'),
(2,1,'2026-02-07','Router reset and inspection'),
(3,2,'2026-02-08','Cleaning schedule update');

INSERT INTO Mess (hostel_id, mess_name, incharge_name) VALUES
(1,'Green Mess','Mani'),
(2,'Blue Mess','Lakshmi');

INSERT INTO Menu (mess_id, day_of_week, meal_type, items) VALUES
(1,'MON','BREAKFAST','Idli, Sambar, Chutney'),
(1,'MON','LUNCH','Rice, Sambar, Poriyal'),
(1,'MON','DINNER','Chapati, Paneer curry'),
(2,'MON','BREAKFAST','Dosa, Chutney'),
(2,'MON','LUNCH','Variety rice, Curd'),
(2,'MON','DINNER','Idiyappam, Kurma');

-- Set default passwords for all students
UPDATE Student SET password = '1234' WHERE student_id = 1;
UPDATE Student SET password = '1234' WHERE student_id = 2;
UPDATE Student SET password = '1234' WHERE student_id = 3;
