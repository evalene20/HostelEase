CREATE DATABASE smart_hostel_db;
USE smart_hostel_db;

-- DDL Commands

CREATE TABLE College (
  college_id INT PRIMARY KEY AUTO_INCREMENT,
  college_name VARCHAR(150) NOT NULL,
  city VARCHAR(80) NOT NULL,
  contact_email VARCHAR(120) NOT NULL UNIQUE
);
CREATE TABLE Student (
  student_id INT PRIMARY KEY AUTO_INCREMENT,
  register_no VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  college_id INT NOT NULL,
  CONSTRAINT fk_student_college
    FOREIGN KEY (college_id) REFERENCES College(college_id)
);
CREATE TABLE Hostel (
  hostel_id INT PRIMARY KEY AUTO_INCREMENT,
  hostel_name VARCHAR(120) NOT NULL UNIQUE,
  hostel_type ENUM('BOYS','GIRLS','COED') NOT NULL,
  location VARCHAR(120) NOT NULL
);
CREATE TABLE Room (
  room_id INT PRIMARY KEY AUTO_INCREMENT,
  hostel_id INT NOT NULL,
  room_no VARCHAR(10) NOT NULL,
  capacity TINYINT NOT NULL,
  CONSTRAINT fk_room_hostel
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id),
  CONSTRAINT uq_room UNIQUE (hostel_id, room_no),
  CONSTRAINT chk_room_capacity CHECK (capacity BETWEEN 1 AND 8)
);


CREATE TABLE Booking (
  booking_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  room_id INT NOT NULL,
  booking_date DATE NOT NULL,
  status ENUM('REQUESTED','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'REQUESTED',
  CONSTRAINT fk_booking_student
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
  CONSTRAINT fk_booking_room
    FOREIGN KEY (room_id) REFERENCES Room(room_id)
);
CREATE TABLE Payment (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_status ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'SUCCESS',
  CONSTRAINT fk_payment_booking
    FOREIGN KEY (booking_id) REFERENCES Booking(booking_id),
  CONSTRAINT chk_payment_amount CHECK (amount > 0)
);
CREATE TABLE Payment_Details (
  payment_id INT NOT NULL,
  line_no INT NOT NULL,
  mode ENUM('UPI','CARD','CASH','NETBANKING') NOT NULL,
  transaction_ref VARCHAR(60) NOT NULL UNIQUE,
  PRIMARY KEY (payment_id, line_no),
  CONSTRAINT fk_pdetails_payment
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id)
);
CREATE TABLE Complaint (
  complaint_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  complaint_type ENUM('WATER','ELECTRICITY','CLEANING','INTERNET','OTHER') NOT NULL,
  complaint_date DATE NOT NULL,
  priority ENUM('LOW','MEDIUM','HIGH') NOT NULL DEFAULT 'MEDIUM',
  CONSTRAINT fk_complaint_student
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
);
CREATE TABLE Staff (
  staff_id INT PRIMARY KEY AUTO_INCREMENT,
  staff_name VARCHAR(120) NOT NULL,
  role ENUM('WARDEN','MAINTENANCE','HOUSEKEEPING','MESS') NOT NULL,
  phone_no VARCHAR(15) NOT NULL UNIQUE
);
CREATE TABLE Complaint_Assignment (
  complaint_id INT NOT NULL,
  staff_id INT NOT NULL,
  assigned_on DATE NOT NULL,
  remarks VARCHAR(200),
  PRIMARY KEY (complaint_id, staff_id),
  CONSTRAINT fk_ca_complaint
    FOREIGN KEY (complaint_id) REFERENCES Complaint(complaint_id),
  CONSTRAINT fk_ca_staff
    FOREIGN KEY (staff_id) REFERENCES Staff(staff_id)
);

CREATE TABLE Mess (
  mess_id INT PRIMARY KEY AUTO_INCREMENT,
  hostel_id INT NOT NULL UNIQUE,
  mess_name VARCHAR(120) NOT NULL,
  incharge_name VARCHAR(120) NOT NULL,
  CONSTRAINT fk_mess_hostel
    FOREIGN KEY (hostel_id) REFERENCES Hostel(hostel_id)
);
CREATE TABLE Menu (
  menu_id INT PRIMARY KEY AUTO_INCREMENT,
  mess_id INT NOT NULL,
  day_of_week ENUM('MON','TUE','WED','THU','FRI','SAT','SUN') NOT NULL,
  meal_type ENUM('BREAKFAST','LUNCH','DINNER') NOT NULL,
  items VARCHAR(255) NOT NULL,
  CONSTRAINT fk_menu_mess
    FOREIGN KEY (mess_id) REFERENCES Mess(mess_id),
  CONSTRAINT uq_menu UNIQUE (mess_id, day_of_week, meal_type)
);

-- DML Commands
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

-- Constraints

SELECT r.room_id, r.capacity, COUNT(b.booking_id) AS total_bookings
FROM Room r
JOIN Booking b ON r.room_id = b.room_id
WHERE b.status = 'APPROVED'
GROUP BY r.room_id, r.capacity
HAVING COUNT(b.booking_id) > r.capacity;

SELECT * FROM Payment WHERE amount <= 0;

SELECT transaction_ref, COUNT(*)
FROM Payment_Details
GROUP BY transaction_ref
HAVING COUNT(*) > 1;

-- Aggregate

SELECT SUM(amount) AS total_revenue FROM Payment;

SELECT complaint_type, COUNT(*) AS total
FROM Complaint
GROUP BY complaint_type;

SELECT AVG(capacity) AS avg_capacity FROM Room;

-- Sets

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

-- Sub Queries
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

-- Join

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

-- Views
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

-- Triggers

DELIMITER //
CREATE TRIGGER before_payment_insert
BEFORE INSERT ON Payment
FOR EACH ROW
BEGIN
    IF NEW.amount <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid payment amount';
    END IF;
END //
DELIMITER ;


DELIMITER //
CREATE TRIGGER after_payment_insert
AFTER INSERT ON Payment
FOR EACH ROW
BEGIN
    UPDATE Booking
    SET status = 'APPROVED'
    WHERE booking_id = NEW.booking_id;
END //
DELIMITER ;


CREATE TABLE Complaint_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT,
    assigned_date DATE
);


DELIMITER //
CREATE TRIGGER log_assignment
AFTER INSERT ON Complaint_Assignment
FOR EACH ROW
BEGIN
    -- Ensure NEW.assigned_on is a valid column in Complaint_Assignment
    INSERT INTO Complaint_Log (complaint_id, assigned_date) 
    VALUES (NEW.complaint_id, NEW.assigned_on);
END //
DELIMITER ;

-- Procedure


DELIMITER $$

-- 1. Safe Booking Procedure (with validation)
CREATE PROCEDURE SafeInsertBooking(
  IN p_student_id INT,
  IN p_room_id INT,
  IN p_date DATE
)
BEGIN
  DECLARE room_capacity INT;
  DECLARE booked_count INT;

  -- Exception handler
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SELECT 'Error occurred while booking' AS message;
  END;

  -- Get room capacity
  SELECT capacity INTO room_capacity
  FROM Room
  WHERE room_id = p_room_id;

  -- Count approved bookings
  SELECT COUNT(*) INTO booked_count
  FROM Booking
  WHERE room_id = p_room_id AND status = 'APPROVED';

  -- Business logic
  IF booked_count >= room_capacity THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Room is full';
  ELSE
    INSERT INTO Booking(student_id, room_id, booking_date, status)
    VALUES(p_student_id, p_room_id, p_date, 'REQUESTED');

    SELECT 'Booking inserted successfully' AS message;
  END IF;

END $$


-- 2. List All Students
CREATE PROCEDURE list_students()
BEGIN
  SELECT student_id, full_name FROM Student;
END $$


-- 3. Increase Room Capacity (Bulk Update)
CREATE PROCEDURE increase_capacity()
BEGIN
  UPDATE Room
  SET capacity = capacity + 1;

  SELECT 'Room capacities increased by 1' AS message;
END $$

DELIMITER ;

-- Cursors

DELIMITER $$

-- 1. Iterate through Payments (with output)
CREATE PROCEDURE iterate_payments()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE amt DECIMAL(10,2);

  DECLARE cur CURSOR FOR SELECT amount FROM Payment;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;

  read_loop: LOOP
    FETCH cur INTO amt;

    IF done THEN
      LEAVE read_loop;
    END IF;

    SELECT amt AS payment_amount;

  END LOOP;

  CLOSE cur;
END $$


-- 2. List Students using Cursor (Row-by-row)
CREATE PROCEDURE list_students_cursor()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE sname VARCHAR(120);

  DECLARE cur CURSOR FOR SELECT full_name FROM Student;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;

  read_loop: LOOP
    FETCH cur INTO sname;

    IF done THEN
      LEAVE read_loop;
    END IF;

    SELECT sname AS student_name;

  END LOOP;

  CLOSE cur;
END $$


-- 3. Increase Capacity using Cursor (row-by-row)
CREATE PROCEDURE increase_capacity_cursor()
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE rid INT;

  DECLARE cur CURSOR FOR SELECT room_id FROM Room;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;

  room_loop: LOOP
    FETCH cur INTO rid;

    IF done THEN
      LEAVE room_loop;
    END IF;

    UPDATE Room
    SET capacity = capacity + 1
    WHERE room_id = rid;

  END LOOP;

  CLOSE cur;

  SELECT 'Room capacities updated using cursor' AS message;

END $$

DELIMITER ;

SELECT * FROM Student;
SELECT * FROM College;







