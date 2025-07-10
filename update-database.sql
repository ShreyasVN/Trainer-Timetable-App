-- Update existing database to add missing name column and fix admin user
USE trainer_timetable;

-- Add name column if it doesn't exist
ALTER TABLE member ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Update or insert admin user with correct password hash (admin123)
DELETE FROM member WHERE email = 'admin@example.com';
INSERT INTO member (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Add a test trainer for testing
INSERT INTO member (name, email, password, role) VALUES 
('Test Trainer', 'trainer@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'trainer')
ON DUPLICATE KEY UPDATE name = 'Test Trainer';

-- Show current users
SELECT id, name, email, role FROM member;
