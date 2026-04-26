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


ALTER TABLE Student ADD password VARCHAR(255);

UPDATE Student SET password = '1234' WHERE student_id = 1;