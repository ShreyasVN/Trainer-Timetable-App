require('dotenv').config();
const mysql = require('mysql2/promise');

// Use default MySQL settings if no .env file
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Empty password for default MySQL setup
  database: process.env.DB_NAME || 'trainer_timetable',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Connected to MySQL database successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.log('\n📋 To fix this, you need to:');
    console.log('1. Make sure MySQL is installed and running');
    console.log('2. Create a database named "trainer_timetable"');
    console.log('3. Create a .env file in the server directory with your MySQL credentials');
    console.log('\nExample .env file content:');
    console.log('DB_HOST=localhost');
    console.log('DB_USER=root');
    console.log('DB_PASSWORD=your_password');
    console.log('DB_NAME=trainer_timetable');
    console.log('DB_PORT=3306');
  });

pool.query('SELECT DATABASE() as db').then(([rows]) => {
  console.log('Connected to DB:', rows[0].db);
});

module.exports = pool;
