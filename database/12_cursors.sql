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