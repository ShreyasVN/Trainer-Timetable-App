-- MySQL Database Setup for Trainer Timetable App
-- Run this script in your MySQL client (phpMyAdmin, MySQL Workbench, or command line)

-- Create the database
CREATE DATABASE IF NOT EXISTS trainer_timetable;
USE trainer_timetable;

-- Create the member table for user authentication
CREATE TABLE IF NOT EXISTS member (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
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

-- Create notifications table for in-app admin notifications
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50),
  message VARCHAR(255),
  recipient_role VARCHAR(50),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alter the sessions table to support trainer self-scheduling and approval
ALTER TABLE sessions 
  ADD COLUMN created_by_trainer BOOLEAN DEFAULT FALSE,
  ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved';

-- Insert a default admin user (password: admin123)
INSERT INTO member (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Show the created tables
SHOW TABLES;

-- Show the structure of the member table
DESCRIBE member;

-- Show the structure of the sessions table
DESCRIBE sessions; 