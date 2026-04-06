
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