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
    await db.query('INSERT INTO notifications (type, message, recipient_role, `read`) VALUES (?, ?, ?, ?)', [
      'info',
      'Test notification for admin',
      'admin',
      0
    ]);
    console.log('Notification inserted successfully.');

    const [results] = await db.query('SELECT * FROM notifications WHERE recipient_role = ?', ['admin']);
    console.log('Notifications for admin:', results);
  } catch (err) {
    console.error('Database error:', err.message);
  } finally {
    await db.end();
  }
})();
