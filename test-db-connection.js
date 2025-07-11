const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    // Try different password combinations
    const passwords = ['', 'root', 'password', 'admin', '123456', 'root@123'];
    let connection = null;
    
    for (const password of passwords) {
      try {
        console.log(`🔍 Trying password: ${password || '(empty)'}`);
        connection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: password,
          port: 3306
        });
        console.log(`✅ Connected with password: ${password || '(empty)'}`);
        break;
      } catch (err) {
        console.log(`❌ Failed with password: ${password || '(empty)'} - ${err.message}`);
        continue;
      }
    }
    
    if (!connection) {
      throw new Error('Could not connect to MySQL with any of the common passwords');
    }
    
    console.log('✅ Connected to MySQL server successfully!');
    
    // Check if database exists
    const [databases] = await connection.query('SHOW DATABASES LIKE "trainer_timetable"');
    
    if (databases.length === 0) {
      console.log('❌ Database "trainer_timetable" does not exist. Creating it...');
      
      // Create database
      await connection.query('CREATE DATABASE trainer_timetable');
      console.log('✅ Database "trainer_timetable" created successfully!');
      
      // Use the database
      await connection.query('USE trainer_timetable');
      
      // Create tables
      console.log('🔧 Creating tables...');
      
      // Create member table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS member (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('trainer', 'admin') DEFAULT 'trainer',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create sessions table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          trainer_id INT NOT NULL,
          course_name VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          time TIME NOT NULL,
          location VARCHAR(255) NOT NULL,
          duration INT DEFAULT 60,
          attended BOOLEAN DEFAULT FALSE,
          created_by_trainer BOOLEAN DEFAULT FALSE,
          approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (trainer_id) REFERENCES member(id) ON DELETE CASCADE
        )
      `);
      
      // Create busy_slots table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS busy_slots (
          id INT AUTO_INCREMENT PRIMARY KEY,
          trainer_id INT NOT NULL,
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          reason VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (trainer_id) REFERENCES member(id) ON DELETE CASCADE
        )
      `);
      
      // Create notifications table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(50),
          message VARCHAR(255),
          recipient_role VARCHAR(50),
          \`read\` BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default admin user
      await connection.execute(`
        INSERT INTO member (name, email, password, role) VALUES 
        ('Admin User', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
        ON DUPLICATE KEY UPDATE email = email
      `);
      
      console.log('✅ Tables created successfully!');
      
    } else {
      console.log('✅ Database "trainer_timetable" already exists!');
      await connection.query('USE trainer_timetable');
    }
    
    // Test tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Test users
    const [users] = await connection.execute('SELECT id, name, email, role FROM member');
    console.log('👥 Users in database:', users);
    
    await connection.end();
    console.log('✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testConnection();
