const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedTestDatabase() {
  let connection;
  
  try {
    // Connect to test database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'trainer_timetable',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to test database');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await connection.execute(
      'INSERT IGNORE INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', adminPassword, 'admin']
    );
    console.log('✅ Admin user created');

    // Create trainer user
    const trainerPassword = await bcrypt.hash('trainer123', 10);
    await connection.execute(
      'INSERT IGNORE INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Test Trainer', 'trainer@example.com', trainerPassword, 'trainer']
    );
    console.log('✅ Trainer user created');

    // Create additional trainer users
    const trainer2Password = await bcrypt.hash('trainer123', 10);
    await connection.execute(
      'INSERT IGNORE INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Jane Smith', 'jane.smith@example.com', trainer2Password, 'trainer']
    );

    const trainer3Password = await bcrypt.hash('trainer123', 10);
    await connection.execute(
      'INSERT IGNORE INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Mike Johnson', 'mike.johnson@example.com', trainer3Password, 'trainer']
    );
    console.log('✅ Additional trainer users created');

    // Insert sample sessions
    await connection.execute(`
      INSERT IGNORE INTO sessions (trainer_id, course_name, date, time, location, duration, attended) VALUES 
      (2, 'JavaScript Fundamentals', '2025-07-15', '09:00:00', 'Room A1', 90, false),
      (2, 'React Development', '2025-07-16', '14:00:00', 'Room B2', 120, false),
      (3, 'Database Design', '2025-07-17', '10:00:00', 'Room C3', 60, false),
      (4, 'API Development', '2025-07-18', '15:30:00', 'Room A1', 90, false)
    `);
    console.log('✅ Sample sessions created');

    // Insert course categories
    await connection.execute(`
      INSERT IGNORE INTO course_category (name, description) VALUES 
      ('Programming', 'Programming and software development courses'),
      ('Database', 'Database design and management courses'),
      ('Web Development', 'Frontend and backend web development'),
      ('Mobile Development', 'Mobile application development')
    `);
    console.log('✅ Course categories created');

    // Insert sample busy slots
    await connection.execute(`
      INSERT IGNORE INTO busy_slots (trainer_id, start_time, end_time, reason) VALUES 
      (2, '2025-07-19 09:00:00', '2025-07-19 12:00:00', 'Personal appointment'),
      (3, '2025-07-20 13:00:00', '2025-07-20 17:00:00', 'Training conference')
    `);
    console.log('✅ Sample busy slots created');

    // Insert sample notifications
    await connection.execute(`
      INSERT IGNORE INTO notifications (type, message, recipient_role) VALUES 
      ('session', 'New session scheduled for JavaScript Fundamentals', 'admin'),
      ('busy', 'Trainer marked busy slot for July 19th', 'admin')
    `);
    console.log('✅ Sample notifications created');

    console.log('\n🎉 Test database seeded successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Trainer: trainer@example.com / trainer123');

  } catch (error) {
    console.error('❌ Error seeding test database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedTestDatabase();
