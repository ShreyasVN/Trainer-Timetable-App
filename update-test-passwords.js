/**
 * Update Test User Passwords
 * Updates the passwords for trainer@example.com and admin@example.com
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trainer_timetable',
    port: process.env.DB_PORT || 3306
};

async function updateTestPasswords() {
    let connection;
    
    try {
        console.log('🔗 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        console.log(`🔐 New password hash generated: ${hashedPassword}`);
        
        const testEmails = ['trainer@example.com', 'admin@example.com'];
        
        for (const email of testEmails) {
            try {
                // Update password
                const [result] = await connection.execute(
                    'UPDATE member SET password = ? WHERE email = ?',
                    [hashedPassword, email]
                );
                
                if (result.affectedRows > 0) {
                    console.log(`✅ Updated password for ${email}`);
                } else {
                    console.log(`❌ User ${email} not found`);
                }
                
            } catch (error) {
                console.error(`❌ Error updating password for ${email}:`, error.message);
            }
        }
        
        console.log('\n🎉 Password update completed!');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔐 Database connection closed');
        }
    }
}

// Run if executed directly
if (require.main === module) {
    updateTestPasswords();
}

module.exports = { updateTestPasswords };
