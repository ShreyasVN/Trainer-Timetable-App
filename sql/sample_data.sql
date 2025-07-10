-- Sample data for Trainer Utilization Testing

-- Insert sample trainers
INSERT INTO member (email, password, role) VALUES
('trainer1@example.com', '$2b$10$example_hash_1', 'trainer'),
('trainer2@example.com', '$2b$10$example_hash_2', 'trainer'),
('trainer3@example.com', '$2b$10$example_hash_3', 'trainer'),
('admin@example.com', '$2b$10$example_hash_admin', 'admin');

-- Insert sample sessions for current month
INSERT INTO sessions (trainer_id, course_name, date, time, location, duration, attended) VALUES
(1, 'JavaScript Basics', '2025-01-15', '09:00:00', 'Room A', 60, 1),
(1, 'React Fundamentals', '2025-01-16', '14:00:00', 'Room B', 90, 1),
(1, 'Node.js Workshop', '2025-01-17', '10:00:00', 'Room C', 120, 0),
(2, 'Python Programming', '2025-01-15', '13:00:00', 'Room D', 60, 1),
(2, 'Data Science Intro', '2025-01-18', '15:00:00', 'Room E', 90, 1),
(2, 'Machine Learning', '2025-01-20', '11:00:00', 'Room F', 120, 1),
(3, 'Web Development', '2025-01-16', '16:00:00', 'Room G', 60, 0),
(3, 'Database Design', '2025-01-19', '09:00:00', 'Room H', 90, 1),
(3, 'API Development', '2025-01-21', '14:00:00', 'Room I', 120, 1); 