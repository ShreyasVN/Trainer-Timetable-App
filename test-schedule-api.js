// Test script to debug schedule class and busy slots API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testScheduleAPI() {
  console.log('🧪 Testing Schedule Class and Busy Slots API...\n');

  // First, let's try to login and get a token
  console.log('1. Testing Login...');
  try {
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
email: 'admin@example.com',
      password: 'admin123'
    });

    if (loginResponse.data.token) {
      console.log('   ✅ Login successful!');
      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };

      // Test 2: Get sessions
      console.log('\n2. Testing GET sessions...');
      try {
        const sessionsResponse = await axios.get(`${BASE_URL}/sessions`, { headers });
        console.log(`   ✅ Sessions fetched: ${sessionsResponse.data.length} sessions`);
        console.log(`   Data:`, sessionsResponse.data);
      } catch (error) {
        console.log(`   ❌ Sessions failed:`, error.response?.data || error.message);
      }

      // Test 3: Get busy slots
      console.log('\n3. Testing GET busy slots...');
      try {
        const busyResponse = await axios.get(`${BASE_URL}/busy-slots`, { headers });
        console.log(`   ✅ Busy slots fetched: ${busyResponse.data.length} slots`);
        console.log(`   Data:`, busyResponse.data);
      } catch (error) {
        console.log(`   ❌ Busy slots failed:`, error.response?.data || error.message);
      }

      // Test 4: Create a session (Schedule Class)
      console.log('\n4. Testing POST session (Schedule Class)...');
      try {
        const sessionData = {
          trainer_id: 1,
          course_name: 'Test Course',
          date: '2025-07-15',
          time: '10:00',
          location: 'Room 101',
          duration: 60,
          created_by_trainer: true
        };
        const createResponse = await axios.post(`${BASE_URL}/sessions`, sessionData, { headers });
        console.log(`   ✅ Session created:`, createResponse.data);
      } catch (error) {
        console.log(`   ❌ Session creation failed:`, error.response?.data || error.message);
      }

      // Test 5: Create a busy slot
      console.log('\n5. Testing POST busy slot...');
      try {
        const busyData = {
          start_time: '2025-07-15 14:00:00',
          end_time: '2025-07-15 16:00:00',
          reason: 'Personal appointment'
        };
        const busyCreateResponse = await axios.post(`${BASE_URL}/busy-slots`, busyData, { headers });
        console.log(`   ✅ Busy slot created:`, busyCreateResponse.data);
      } catch (error) {
        console.log(`   ❌ Busy slot creation failed:`, error.response?.data || error.message);
      }

    } else {
      console.log('   ❌ No token received');
    }
  } catch (error) {
    console.log(`   ❌ Login failed:`, error.response?.data || error.message);
  }

  console.log('\n✅ API tests completed!');
}

// Run tests if server is running
testScheduleAPI().catch(console.error);
