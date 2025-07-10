const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root@123',
    database: process.env.DB_NAME || 'trainer_timetable',
  });

  try {
await db.query("CREATE TABLE IF NOT EXISTS notifications (\n" +
      "id INT AUTO_INCREMENT PRIMARY KEY,\n" +
      "type VARCHAR(50),\n" +
      "message VARCHAR(255),\n" +
      "recipient_role VARCHAR(50),\n" +
      "`read` BOOLEAN DEFAULT FALSE,\n" +
      "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n" +
    ");");
    console.log('Notifications table created successfully.');
  } catch (err) {
    console.error('Failed to create notifications table:', err.message);
  } finally {
    await db.end();
  }
})();
