-- Seed data for Trainer Timetable App
-- Insert baseline users (admin/trainer) and sample sessions

-- Insert admin user
INSERT IGNORE INTO member (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2b$10$9Zf9Z9Z9Z9Z9Z9Z9Z9Z9ZO9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'admin');

-- Insert trainer users  
INSERT IGNORE INTO member (name, email, password, role) VALUES 
('Test Trainer', 'trainer@example.com', '$2b$10$9Zf9Z9Z9Z9Z9Z9Z9Z9Z9ZO9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'trainer'),
('Jane Smith', 'jane.smith@example.com', '$2b$10$9Zf9Z9Z9Z9Z9Z9Z9Z9Z9ZO9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'trainer'),
('Mike Johnson', 'mike.johnson@example.com', '$2b$10$9Zf9Z9Z9Z9Z9Z9Z9Z9Z9ZO9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'trainer');

-- Insert sample sessions
INSERT IGNORE INTO sessions (trainer_id, course_name, date, time, location, duration, attended) VALUES 
(2, 'JavaScript Fundamentals', '2025-07-15', '09:00:00', 'Room A1', 90, false),
(2, 'React Development', '2025-07-16', '14:00:00', 'Room B2', 120, false),
(3, 'Database Design', '2025-07-17', '10:00:00', 'Room C3', 60, false),
(4, 'API Development', '2025-07-18', '15:30:00', 'Room A1', 90, false);

-- Insert sample course categories
INSERT IGNORE INTO course_category (name, description) VALUES 
('Programming', 'Programming and software development courses'),
('Database', 'Database design and management courses'),
('Web Development', 'Frontend and backend web development'),
('Mobile Development', 'Mobile application development');

-- Insert sample busy slots
INSERT IGNORE INTO busy_slots (trainer_id, start_time, end_time, reason) VALUES 
(2, '2025-07-19 09:00:00', '2025-07-19 12:00:00', 'Personal appointment'),
(3, '2025-07-20 13:00:00', '2025-07-20 17:00:00', 'Training conference');

-- Insert sample notifications
INSERT IGNORE INTO notifications (type, message, recipient_role) VALUES 
('session', 'New session scheduled for JavaScript Fundamentals', 'admin'),
('busy', 'Trainer marked busy slot for July 19th', 'admin');
