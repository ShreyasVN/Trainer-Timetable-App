const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestUser() {
  let connection;
  
  try {
    // Connect to database as root user
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Connected to database as root');

    // Create test user with reduced permissions
    const testUser = 'trainer_test_user';
    const testPassword = 'test123';
    const testHost = 'localhost';
    
    // Drop user if exists
    try {
      await connection.query(`DROP USER IF EXISTS '${testUser}'@'${testHost}'`);
      console.log('✅ Dropped existing test user if present');
    } catch (error) {
      console.log('Info: No existing test user to drop');
    }

    // Create the test user
    await connection.query(`CREATE USER '${testUser}'@'${testHost}' IDENTIFIED BY '${testPassword}'`);
    console.log('✅ Created test user');

    // Grant only SELECT, INSERT, UPDATE, DELETE permissions on the trainer_timetable database
    const dbName = process.env.DB_NAME || 'trainer_timetable';
    await connection.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ${dbName}.* TO '${testUser}'@'${testHost}'`);
    console.log('✅ Granted database permissions');

    // Flush privileges to apply changes
    await connection.query('FLUSH PRIVILEGES');
    console.log('✅ Privileges flushed');

    console.log('\n🎉 Test user created successfully!');
    console.log(`Username: ${testUser}`);
    console.log(`Password: ${testPassword}`);
    console.log(`Host: ${testHost}`);
    console.log(`Database: ${dbName}`);
    console.log('Permissions: SELECT, INSERT, UPDATE, DELETE (no DDL/admin privileges)');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestUser();
