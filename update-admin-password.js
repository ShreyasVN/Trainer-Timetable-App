const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trainer_timetable',
  });

  const [result] = await db.query(
    'UPDATE member SET password = ? WHERE email = ?',
    ['$2b$10$l6o8lwiTham1LrUZyJf86ecryXM6tmRRIep6UwRzZ9JTw77Zp50US', 'admin@example.com']
  );

  console.log('Admin password hash updated:', result);
  await db.end();
})();
