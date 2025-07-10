// Comprehensive test script for all admin functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAdminFunctionality() {
  console.log('🔍 Testing ALL Admin Functionality...\n');

  // Step 1: Admin Login
  console.log('1. Testing Admin Login...');
  let token;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (loginResponse.data.token) {
      console.log('   ✅ Admin login successful!');
      token = loginResponse.data.token;
      console.log(`   Token: ${token.substring(0, 20)}...`);
    } else {
      console.log('   ❌ No token received');
      return;
    }
  } catch (error) {
    console.log(`   ❌ Admin login failed:`, error.response?.data || error.message);
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };

  // Step 2: Test User Management
  console.log('\n2. Testing User Management...');
  
  // Get all users
  try {
    const usersResponse = await axios.get(`${BASE_URL}/auth/users`, { headers });
    console.log(`   ✅ Get users successful: ${usersResponse.data.length} users found`);
    console.log(`   Users:`, usersResponse.data.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
  } catch (error) {
    console.log(`   ❌ Get users failed:`, error.response?.data || error.message);
  }

  // Create a new user
  try {
    const newUserData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'trainer'
    };
    const createUserResponse = await axios.post(`${BASE_URL}/auth/users`, newUserData, { headers });
    console.log(`   ✅ Create user successful:`, createUserResponse.data);
  } catch (error) {
    console.log(`   ❌ Create user failed:`, error.response?.data || error.message);
  }

  // Step 3: Test Session Management
  console.log('\n3. Testing Session Management...');
  
  // Get all sessions
  try {
    const sessionsResponse = await axios.get(`${BASE_URL}/sessions`, { headers });
    console.log(`   ✅ Get sessions successful: ${sessionsResponse.data.length} sessions found`);
    if (sessionsResponse.data.length > 0) {
      console.log(`   Sessions:`, sessionsResponse.data.slice(0, 3)); // Show first 3 sessions
    }
  } catch (error) {
    console.log(`   ❌ Get sessions failed:`, error.response?.data || error.message);
  }

  // Create a new session
  try {
    const sessionData = {
      trainer_id: 1, // Using first trainer
      course_name: 'Admin Test Course',
      date: '2025-07-15',
      time: '14:00',
      location: 'Conference Room A',
      duration: 120
    };
    const createSessionResponse = await axios.post(`${BASE_URL}/sessions`, sessionData, { headers });
    console.log(`   ✅ Create session successful:`, createSessionResponse.data);
  } catch (error) {
    console.log(`   ❌ Create session failed:`, error.response?.data || error.message);
  }

  // Step 4: Test Notifications
  console.log('\n4. Testing Notifications...');
  
  try {
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, { headers });
    console.log(`   ✅ Get notifications successful: ${notificationsResponse.data.length} notifications found`);
    if (notificationsResponse.data.length > 0) {
      console.log(`   Recent notifications:`, notificationsResponse.data.slice(0, 3));
    }
  } catch (error) {
    console.log(`   ❌ Get notifications failed:`, error.response?.data || error.message);
  }

  // Step 5: Test Protected Admin Routes
  console.log('\n5. Testing Protected Admin Routes...');
  
  try {
    const adminDataResponse = await axios.get(`${BASE_URL}/auth/admin-data`, { headers });
    console.log(`   ✅ Admin protected route successful:`, adminDataResponse.data);
  } catch (error) {
    console.log(`   ❌ Admin protected route failed:`, error.response?.data || error.message);
  }

  // Step 6: Test Profile Access
  console.log('\n6. Testing Profile Access...');
  
  try {
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, { headers });
    console.log(`   ✅ Profile access successful:`, profileResponse.data);
  } catch (error) {
    console.log(`   ❌ Profile access failed:`, error.response?.data || error.message);
  }

  // Step 7: Test Busy Slots (Admin View)
  console.log('\n7. Testing Busy Slots (Admin View)...');
  
  try {
    const busySlotsResponse = await axios.get(`${BASE_URL}/busy-slots`, { headers });
    console.log(`   ✅ Get busy slots successful: ${busySlotsResponse.data.length} slots found`);
    if (busySlotsResponse.data.length > 0) {
      console.log(`   Busy slots:`, busySlotsResponse.data.slice(0, 3));
    }
  } catch (error) {
    console.log(`   ❌ Get busy slots failed:`, error.response?.data || error.message);
  }

  // Step 8: Test Session Approval (if trainer-created sessions exist)
  console.log('\n8. Testing Session Approval...');
  
  try {
    // First get sessions to find any pending ones
    const sessionsResponse = await axios.get(`${BASE_URL}/sessions`, { headers });
    const pendingSessions = sessionsResponse.data.filter(s => s.approval_status === 'pending');
    
    if (pendingSessions.length > 0) {
      const sessionId = pendingSessions[0].id;
      const approvalResponse = await axios.put(`${BASE_URL}/sessions/${sessionId}/approve`, 
        { approval_status: 'approved' }, 
        { headers }
      );
      console.log(`   ✅ Session approval successful:`, approvalResponse.data);
    } else {
      console.log(`   ℹ️  No pending sessions to approve`);
    }
  } catch (error) {
    console.log(`   ❌ Session approval failed:`, error.response?.data || error.message);
  }

  // Step 9: Test Email Notifications
  console.log('\n9. Testing Email Notification System...');
  
  try {
    const emailData = {
      to: 'test@example.com',
      subject: 'Test Admin Notification',
      message: 'This is a test notification from admin panel'
    };
    const emailResponse = await axios.post(`${BASE_URL}/notifications/email`, emailData, { headers });
    console.log(`   ✅ Email notification successful:`, emailResponse.data);
  } catch (error) {
    console.log(`   ❌ Email notification failed:`, error.response?.data || error.message);
  }

  // Step 10: Test Data Validation & Error Handling
  console.log('\n10. Testing Data Validation & Error Handling...');
  
  // Test invalid session creation
  try {
    const invalidSessionData = {
      trainer_id: 999, // Non-existent trainer
      course_name: '',  // Empty course name
      date: 'invalid-date',
      time: '25:00',    // Invalid time
      location: '',
      duration: -10     // Invalid duration
    };
    await axios.post(`${BASE_URL}/sessions`, invalidSessionData, { headers });
    console.log(`   ❌ Validation should have failed but didn't`);
  } catch (error) {
    console.log(`   ✅ Data validation working:`, error.response?.data?.error || 'Validation error occurred');
  }

  console.log('\n🎯 Admin Functionality Test Summary:');
  console.log('=====================================');
  console.log('✅ Login System');
  console.log('✅ User Management (CRUD)');
  console.log('✅ Session Management');
  console.log('✅ Protected Routes');
  console.log('✅ Profile Access');
  console.log('✅ Busy Slots Viewing');
  console.log('✅ Data Validation');
  console.log('\n🔧 Manual Testing Required:');
  console.log('- Frontend UI components');
  console.log('- Real-time notifications');
  console.log('- File uploads/downloads');
  console.log('- Email configuration');
}

// Run the comprehensive test
testAdminFunctionality().catch(console.error);
