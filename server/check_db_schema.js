const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  let connection;
  
  try {
    // Connect to both dev and test databases
    const databases = [
      { name: 'Development', db: process.env.DB_NAME || 'trainer_timetable' },
      { name: 'Test', db: process.env.DB_NAME_TEST || 'trainer_timetable_test' }
    ];

    for (const dbInfo of databases) {
      console.log(`\n🔍 Checking ${dbInfo.name} Database: ${dbInfo.db}`);
      console.log('=' .repeat(50));

      try {
        connection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || process.env.DB_PASS || 'root@123',
          database: dbInfo.db,
          port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected successfully');

        // Show tables
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Tables in database:');
        if (tables.length === 0) {
          console.log('❌ No tables found - database schema needs to be created');
        } else {
          tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`${index + 1}. ${tableName}`);
          });
        }

        // Check member table specifically
        try {
          const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM member');
          console.log(`\n👥 Users in member table: ${userCount[0].count}`);

          if (userCount[0].count > 0) {
            const [users] = await connection.execute('SELECT id, name, email, role FROM member LIMIT 5');
            console.log('\n📝 Sample users:');
            users.forEach(user => {
              console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
            });
          }
        } catch (err) {
          console.log('❌ member table does not exist or has issues:', err.message);
        }

        // Check other tables
        try {
          const [sessionCount] = await connection.execute('SELECT COUNT(*) as count FROM sessions');
          console.log(`\n📅 Sessions: ${sessionCount[0].count}`);
        } catch (err) {
          console.log('❌ sessions table does not exist');
        }

        try {
          const [busyCount] = await connection.execute('SELECT COUNT(*) as count FROM busy_slots');
          console.log(`⏰ Busy slots: ${busyCount[0].count}`);
        } catch (err) {
          console.log('❌ busy_slots table does not exist');
        }

        try {
          const [notificationCount] = await connection.execute('SELECT COUNT(*) as count FROM notifications');
          console.log(`🔔 Notifications: ${notificationCount[0].count}`);
        } catch (err) {
          console.log('❌ notifications table does not exist');
        }

      } catch (error) {
        console.log(`❌ Could not connect to ${dbInfo.name} database:`, error.message);
      } finally {
        if (connection) {
          await connection.end();
        }
      }
    }

  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

checkDatabase();
