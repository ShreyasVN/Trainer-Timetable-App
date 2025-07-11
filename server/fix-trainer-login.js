const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixTrainerLogin() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root@123',
      database: process.env.DB_NAME || 'trainer_timetable',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to MySQL database');

    // Check if trainer user exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM member WHERE email = ?', 
      ['trainer@example.com']
    );

    if (existingUsers.length > 0) {
      console.log('📋 Existing trainer user found:');
      console.log('ID:', existingUsers[0].id);
      console.log('Name:', existingUsers[0].name);
      console.log('Email:', existingUsers[0].email);
      console.log('Role:', existingUsers[0].role);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('trainer123', 10);
      await connection.execute(
        'UPDATE member SET password = ? WHERE email = ?',
        [hashedPassword, 'trainer@example.com']
      );
      console.log('✅ Updated trainer password to "trainer123"');
    } else {
      console.log('❌ No trainer user found, creating new one...');
      
      // Create new trainer user
      const hashedPassword = await bcrypt.hash('trainer123', 10);
      const [result] = await connection.execute(
        'INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Test Trainer', 'trainer@example.com', hashedPassword, 'trainer']
      );
      
      console.log('✅ Created new trainer user with ID:', result.insertId);
    }

    // Test the credentials by attempting to verify the password
    const [users] = await connection.execute(
      'SELECT * FROM member WHERE email = ?', 
      ['trainer@example.com']
    );
    
    if (users.length > 0) {
      const isPasswordCorrect = await bcrypt.compare('trainer123', users[0].password);
      console.log('🔐 Password verification:', isPasswordCorrect ? 'PASSED' : 'FAILED');
      
      if (isPasswordCorrect) {
        console.log('✅ Trainer login should now work with:');
        console.log('   Email: trainer@example.com');
        console.log('   Password: trainer123');
      }
    }

    // Also check admin user
    const [adminUsers] = await connection.execute(
      'SELECT * FROM member WHERE email = ?', 
      ['admin@example.com']
    );
    
    if (adminUsers.length > 0) {
      console.log('✅ Admin user exists:');
      console.log('   Email: admin@example.com');
      console.log('   Password: admin123');
    } else {
      console.log('❌ Admin user not found, creating...');
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@example.com', hashedAdminPassword, 'admin']
      );
      console.log('✅ Created admin user');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

fixTrainerLogin();
