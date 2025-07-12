/**
 * Create Test Users Script
 * Creates trainer and admin users for end-to-end verification
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

console.log('Environment variables loaded:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');
console.log('DB_NAME:', process.env.DB_NAME);

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trainer_timetable',
    port: process.env.DB_PORT || 3306
};

async function createTestUsers() {
    let connection;
    
    try {
        console.log('🔗 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        const testUsers = [
            {
                name: 'Test Trainer',
                email: 'trainer@example.com',
                password: 'password123',
                role: 'trainer'
            },
            {
                name: 'Test Admin',
                email: 'admin@example.com',
                password: 'password123',
                role: 'admin'
            }
        ];
        
        for (const user of testUsers) {
            try {
                // Check if user already exists
                const [existingUsers] = await connection.execute(
                    'SELECT id FROM member WHERE email = ?',
                    [user.email]
                );
                
                if (existingUsers.length > 0) {
                    console.log(`⚠️ User ${user.email} already exists, skipping...`);
                    continue;
                }
                
                // Hash password
                const hashedPassword = await bcrypt.hash(user.password, 10);
                
                // Insert user
                const [result] = await connection.execute(
                    'INSERT INTO member (name, email, password, role) VALUES (?, ?, ?, ?)',
                    [user.name, user.email, hashedPassword, user.role]
                );
                
                console.log(`✅ Created ${user.role}: ${user.email} (ID: ${result.insertId})`);
                
            } catch (error) {
                console.error(`❌ Error creating user ${user.email}:`, error.message);
            }
        }
        
        console.log('\n🎉 Test users setup completed!');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\n📋 Make sure:');
        console.log('1. MySQL is running');
        console.log('2. Database "trainer_timetable" exists');
        console.log('3. Connection credentials are correct');
        
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔐 Database connection closed');
        }
    }
}

// Run if executed directly
if (require.main === module) {
    createTestUsers();
}

module.exports = { createTestUsers };
