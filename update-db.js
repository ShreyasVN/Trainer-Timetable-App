// Script to update database schema
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function updateDatabase() {
  console.log('🔄 Updating database schema...\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trainer_timetable',
    port: process.env.DB_PORT || 3306
  });

  try {
    // Add name column if it doesn't exist
    console.log('1. Adding name column to member table...');
    try {
      await connection.execute('ALTER TABLE member ADD COLUMN name VARCHAR(255)');
      console.log('   ✅ Name column added');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('   ✅ Name column already exists');
      } else {
        throw err;
      }
    }

    // Delete and recreate admin user
    console.log('2. Updating admin user...');
    await connection.execute('DELETE FROM member WHERE email = ?', ['admin@example.com']);
    await connection.execute(
      'INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin']
    );
    console.log('   ✅ Admin user updated');

    // Add test trainer
    console.log('3. Adding test trainer...');
    try {
      await connection.execute(
        'INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Test Trainer', 'trainer@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'trainer']
      );
      console.log('   ✅ Test trainer added');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('   ✅ Test trainer already exists');
      } else {
        throw err;
      }
    }

    // Show current users
    console.log('4. Current users in database:');
    const [users] = await connection.execute('SELECT id, name, email, role FROM member');
    console.table(users);

    console.log('\n✅ Database update completed successfully!');
    console.log('\nYou can now login with:');
    console.log('- Admin: admin@example.com / admin123');
    console.log('- Trainer: trainer@example.com / admin123');

  } catch (error) {
    console.error('❌ Database update failed:', error.message);
  } finally {
    await connection.end();
  }
}

updateDatabase();
