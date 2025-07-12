// Test script to verify authentication endpoints
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints...\n');

  // Test 1: Register a new user
  console.log('1. Testing Registration...');
  try {
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'trainer'
      })
    });

    const registerData = await registerResponse.json();
    console.log(`   Status: ${registerResponse.status}`);
    console.log(`   Response:`, registerData);
    if (registerResponse.status === 201 || registerResponse.status === 409) {
      console.log('   ✅ Registration endpoint working (user exists or created)');
    } else {
      console.log('   ❌ Registration endpoint failed');
    }
  } catch (error) {
    console.log(`   ❌ Registration failed:`, error.message);
  }

  console.log('\n2. Testing Login...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Response:`, loginData);

    if (loginData.data && loginData.data.token) {
      console.log('   ✅ Login successful! Token received.');
      
      // Test 3: Test protected route
      console.log('\n3. Testing Protected Route...');
      try {
        const profileResponse = await fetch(`${BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${loginData.data.token}`
          }
        });

        const profileData = await profileResponse.json();
        console.log(`   Status: ${profileResponse.status}`);
        console.log(`   Response:`, profileData);
        if (profileResponse.status === 200) {
          console.log('   ✅ Protected route working!');
        } else {
          console.log('   ❌ Protected route failed');
        }
      } catch (error) {
        console.log(`   ❌ Protected route failed:`, error.message);
      }
    }
  } catch (error) {
    console.log(`   ❌ Login failed:`, error.message);
  }

  console.log('\n✅ Authentication tests completed!');
}

// Run tests if server is running
testAuth().catch(console.error); 