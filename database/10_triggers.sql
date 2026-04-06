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

