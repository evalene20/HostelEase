-- Outing table for student outing requests and tracking
CREATE TABLE Outing (
  outing_id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  outing_date DATE NOT NULL,
  time_out TIME NOT NULL,
  expected_return TIME NOT NULL,
  actual_return TIME NULL,
  status ENUM('REQUESTED','PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'REQUESTED',
  purpose VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_outing_student
    FOREIGN KEY (student_id) REFERENCES Student(student_id)
);

-- Index for faster lookups by student
CREATE INDEX idx_outing_student ON Outing(student_id);
CREATE INDEX idx_outing_status ON Outing(status);
CREATE INDEX idx_outing_date ON Outing(outing_date);
