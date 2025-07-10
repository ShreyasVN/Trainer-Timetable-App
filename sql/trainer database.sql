-- Make sure you are using the correct database
CREATE DATABASE IF NOT EXISTS trainer_timetable;
USE trainer_timetable;

-- Create the member table for user authentication
CREATE TABLE IF NOT EXISTS member (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('trainer', 'admin') DEFAULT 'trainer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the sessions table for training sessions
CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trainer_id INT NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location VARCHAR(255) NOT NULL,
  duration INT DEFAULT 60,
  attended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_trainer BOOLEAN DEFAULT FALSE,
  approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  FOREIGN KEY (trainer_id) REFERENCES member(id) ON DELETE CASCADE
);

-- Create the busy_slots table for custom trainer busy times
CREATE TABLE IF NOT EXISTS busy_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trainer_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trainer_id) REFERENCES member(id) ON DELETE CASCADE
);

-- Create the notifications table for in-app admin notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50),
  message VARCHAR(255),
  recipient_role VARCHAR(50),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- (Optional) Insert a default admin user (password: admin123, hash must match your backend)
INSERT INTO member (email, password, role) VALUES 
('admin@example.com', '$2b$10$rQZ8K9vX8K9vX8K9vX8K9O.8K9vX8K9vX8K9vX8K9vX8K9vX8K9vX8K', 'admin')
ON DUPLICATE KEY UPDATE email = email;