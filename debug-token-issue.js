const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function debugTokenIssue() {
  console.log('🔍 Debugging JWT Token Issue...\n');

  try {
    // Step 1: Login and get token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'shreyas293200@gmail.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log('Token received:', loginData.data.token);
    
    const token = loginData.data.token;
    
    // Step 2: Verify token works immediately
    console.log('\n2. Verifying token immediately...');
    const verifyResponse = await fetch(`${BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (verifyResponse.ok) {
      console.log('✅ Token verification successful');
    } else {
      console.log('❌ Token verification failed:', verifyResponse.status);
      const errorData = await verifyResponse.json();
      console.log('Error:', errorData);
    }

    // Step 3: Test sessions endpoint
    console.log('\n3. Testing sessions endpoint...');
    const sessionsResponse = await fetch(`${BASE_URL}/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (sessionsResponse.ok) {
      console.log('✅ Sessions endpoint successful');
    } else {
      console.log('❌ Sessions endpoint failed:', sessionsResponse.status);
      const errorData = await sessionsResponse.json();
      console.log('Error:', errorData);
    }

    // Step 4: Test busy-slots endpoint
    console.log('\n4. Testing busy-slots endpoint...');
    const busySlotsResponse = await fetch(`${BASE_URL}/busy-slots`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (busySlotsResponse.ok) {
      console.log('✅ Busy-slots endpoint successful');
    } else {
      console.log('❌ Busy-slots endpoint failed:', busySlotsResponse.status);
      const errorData = await busySlotsResponse.json();
      console.log('Error:', errorData);
    }

    // Step 5: Debug token contents
    console.log('\n5. Token analysis:');
    console.log('Raw token:', token);
    console.log('Token length:', token.length);
    console.log('Token parts:', token.split('.').length);
    
    // Decode payload
    try {
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('Decoded payload:', payload);
      
      const currentTime = Math.floor(Date.now() / 1000);
      console.log('Current time:', currentTime);
      console.log('Token expires at:', payload.exp);
      console.log('Token expired:', payload.exp < currentTime);
    } catch (decodeError) {
      console.error('❌ Failed to decode token:', decodeError.message);
    }

  } catch (error) {
    console.error('❌ Error during debug:', error.message);
  }
}

debugTokenIssue().catch(console.error);
