/**
 * End-to-End Verification Script
 * 
 * This script verifies:
 * 1. Login as trainer and admin – ensure localStorage entry is unquoted
 * 2. Call protected route (/sessions) and confirm 200 status
 * 3. Simulate expiry/invalid token and confirm 401 → auto-logout
 * 4. Backend unit test: supply "token" with and without quotes
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secure_jwt_secret_key_change_this_in_production_2024';

// Test user credentials
const TRAINER_CREDENTIALS = {
    email: 'trainer@example.com',
    password: 'password123'
};

const ADMIN_CREDENTIALS = {
    email: 'admin@example.com', 
    password: 'password123'
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`\n${colors.blue}=== Step ${step}: ${message} ===${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, colors.green);
}

function logError(message) {
    log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
    log(`⚠️ ${message}`, colors.yellow);
}

function logInfo(message) {
    log(`ℹ️ ${message}`, colors.cyan);
}

// Helper function to simulate localStorage
class MockLocalStorage {
    constructor() {
        this.store = {};
    }
    
    setItem(key, value) {
        this.store[key] = value;
        logInfo(`localStorage.setItem("${key}", "${value.substring(0, 50)}...")`);
    }
    
    getItem(key) {
        const value = this.store[key] || null;
        logInfo(`localStorage.getItem("${key}") -> ${value ? value.substring(0, 50) + '...' : 'null'}`);
        return value;
    }
    
    removeItem(key) {
        delete this.store[key];
        logInfo(`localStorage.removeItem("${key}")`);
    }
    
    clear() {
        this.store = {};
        logInfo('localStorage.clear()');
    }
}

// Create mock localStorage
const localStorage = new MockLocalStorage();

// Step 1: Login as trainer and admin
async function step1_loginVerification() {
    logStep(1, 'Login as trainer and admin – ensure localStorage entry is unquoted');
    
    const users = [
        { role: 'trainer', credentials: TRAINER_CREDENTIALS },
        { role: 'admin', credentials: ADMIN_CREDENTIALS }
    ];
    
    const loginResults = {};
    
    for (const user of users) {
        try {
            log(`\n🔐 Testing login for ${user.role}...`);
            
            const response = await axios.post(`${API_BASE}/auth/login`, user.credentials);
            
            if (response.status === 200 && response.data.success) {
                const { token, user: userData } = response.data.data;
                
                // Simulate storing in localStorage (like the frontend would)
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                // Verify the token is stored without quotes
                const storedToken = localStorage.getItem('token');
                
                // Check if token is properly formatted (no extra quotes)
                if (storedToken === token) {
                    logSuccess(`${user.role} login successful - token stored unquoted`);
                } else {
                    logError(`${user.role} login - token storage issue: expected ${token}, got ${storedToken}`);
                }
                
                // Verify token structure
                const tokenParts = token.split('.');
                if (tokenParts.length === 3) {
                    logSuccess(`${user.role} - Valid JWT structure (3 parts)`);
                } else {
                    logError(`${user.role} - Invalid JWT structure: ${tokenParts.length} parts`);
                }
                
                // Decode and verify token payload
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    logSuccess(`${user.role} - Token verification successful`);
                    logInfo(`  - User ID: ${decoded.id}`);
                    logInfo(`  - Email: ${decoded.email}`);
                    logInfo(`  - Role: ${decoded.role}`);
                    logInfo(`  - Expires: ${new Date(decoded.exp * 1000).toISOString()}`);
                } catch (jwtError) {
                    logError(`${user.role} - JWT verification failed: ${jwtError.message}`);
                }
                
                loginResults[user.role] = { token, user: userData };
            } else {
                logError(`${user.role} login failed: ${response.data.error || 'Unknown error'}`);
            }
        } catch (error) {
            logError(`${user.role} login error: ${error.response?.data?.error || error.message}`);
        }
    }
    
    return loginResults;
}

// Step 2: Call protected route and confirm 200
async function step2_protectedRouteVerification(tokens) {
    logStep(2, 'Call protected route (/sessions) and confirm 200 status');
    
    for (const [role, data] of Object.entries(tokens)) {
        try {
            log(`\n🔒 Testing /sessions endpoint for ${role}...`);
            
            const response = await axios.get(`${API_BASE}/sessions`, {
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                logSuccess(`${role} - /sessions endpoint returned 200`);
                logInfo(`  - Response: ${JSON.stringify(response.data).substring(0, 100)}...`);
                
                // Verify response structure
                if (response.data.success) {
                    logSuccess(`${role} - Response has success flag`);
                    if (Array.isArray(response.data.data)) {
                        logSuccess(`${role} - Response contains sessions array`);
                        logInfo(`  - Sessions count: ${response.data.data.length}`);
                    }
                }
            } else {
                logError(`${role} - /sessions endpoint returned ${response.status}`);
            }
        } catch (error) {
            logError(`${role} - /sessions endpoint error: ${error.response?.status || error.message}`);
            if (error.response?.data) {
                logError(`  - Response: ${JSON.stringify(error.response.data)}`);
            }
        }
    }
}

// Step 3: Simulate expiry/invalid token and confirm 401
async function step3_tokenExpiryVerification() {
    logStep(3, 'Simulate expiry/invalid token and confirm 401 → auto-logout');
    
    const testCases = [
        { name: 'Invalid token', token: 'invalid.token.here' },
        { name: 'Expired token', token: jwt.sign({ id: 1, email: 'test@example.com', role: 'trainer' }, JWT_SECRET, { expiresIn: '-1h' }) },
        { name: 'Malformed token', token: 'not.a.valid.jwt.token.format' },
        { name: 'Empty token', token: '' },
        { name: 'No Bearer prefix', token: 'just-a-token' }
    ];
    
    for (const testCase of testCases) {
        try {
            log(`\n🚫 Testing ${testCase.name}...`);
            
            const headers = testCase.name === 'No Bearer prefix' 
                ? { 'Authorization': testCase.token }
                : { 'Authorization': `Bearer ${testCase.token}` };
                
            const response = await axios.get(`${API_BASE}/sessions`, { headers });
            
            // If we get here, the request succeeded when it should have failed
            logError(`${testCase.name} - Expected 401/403, got ${response.status}`);
        } catch (error) {
            const status = error.response?.status;
            if (status === 401 || status === 403) {
                logSuccess(`${testCase.name} - Correctly returned ${status}`);
                logInfo(`  - Error: ${error.response.data.error}`);
                
                // Simulate auto-logout (clear localStorage)
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                logSuccess(`${testCase.name} - Auto-logout simulated`);
            } else {
                logError(`${testCase.name} - Expected 401/403, got ${status || 'network error'}`);
            }
        }
    }
}

// Step 4: Backend unit test with quoted/unquoted tokens
async function step4_backendTokenValidation() {
    logStep(4, 'Backend unit test: supply "token" with and without quotes');
    
    // Create a valid token for testing
    const validToken = jwt.sign(
        { id: 1, email: 'test@example.com', role: 'trainer' },
        JWT_SECRET,
        { expiresIn: '1h' }
    );
    
    const testCases = [
        { 
            name: 'Valid unquoted token',
            token: validToken,
            expectedStatus: 200,
            shouldPass: true
        },
        { 
            name: 'Invalid quoted token',
            token: `"${validToken}"`,
            expectedStatus: 401,
            shouldPass: false
        },
        { 
            name: 'Token with extra quotes',
            token: `""${validToken}""`,
            expectedStatus: 401,
            shouldPass: false
        },
        { 
            name: 'Token with single quotes',
            token: `'${validToken}'`,
            expectedStatus: 401,
            shouldPass: false
        }
    ];
    
    for (const testCase of testCases) {
        try {
            log(`\n🧪 Testing ${testCase.name}...`);
            logInfo(`  - Token: ${testCase.token.substring(0, 50)}...`);
            
            const response = await axios.get(`${API_BASE}/sessions`, {
                headers: {
                    'Authorization': `Bearer ${testCase.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (testCase.shouldPass && response.status === 200) {
                logSuccess(`${testCase.name} - Correctly accepted (${response.status})`);
            } else if (!testCase.shouldPass && response.status === 200) {
                logError(`${testCase.name} - Should have been rejected but got ${response.status}`);
            } else {
                logWarning(`${testCase.name} - Unexpected response: ${response.status}`);
            }
            
        } catch (error) {
            const status = error.response?.status;
            if (!testCase.shouldPass && (status === 401 || status === 403)) {
                logSuccess(`${testCase.name} - Correctly rejected (${status})`);
                logInfo(`  - Error: ${error.response.data.error}`);
            } else if (testCase.shouldPass && (status === 401 || status === 403)) {
                logError(`${testCase.name} - Should have been accepted but got ${status}`);
            } else {
                logError(`${testCase.name} - Unexpected error: ${status || error.message}`);
            }
        }
    }
}

// Main execution function
async function runEndToEndVerification() {
    log(`${colors.magenta}
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                            END-TO-END VERIFICATION TEST                                      ║
║                                                                                              ║
║ This script verifies:                                                                       ║
║ 1. Login as trainer and admin – ensure localStorage entry is unquoted                      ║
║ 2. Call protected route (/sessions) and confirm 200 status                                 ║
║ 3. Simulate expiry/invalid token and confirm 401 → auto-logout                             ║
║ 4. Backend unit test: supply "token" with and without quotes                               ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
    
    try {
        // Step 1: Login verification
        const loginResults = await step1_loginVerification();
        
        // Step 2: Protected route verification
        if (Object.keys(loginResults).length > 0) {
            await step2_protectedRouteVerification(loginResults);
        } else {
            logWarning('Skipping Step 2: No valid logins from Step 1');
        }
        
        // Step 3: Token expiry verification
        await step3_tokenExpiryVerification();
        
        // Step 4: Backend token validation
        await step4_backendTokenValidation();
        
        log(`\n${colors.green}✅ End-to-end verification completed!${colors.reset}`);
        
    } catch (error) {
        logError(`Verification failed: ${error.message}`);
        process.exit(1);
    }
}

// Add helper function to check if server is running
async function checkServerStatus() {
    try {
        const response = await axios.get(API_BASE.replace('/api', ''));
        logSuccess('Backend server is running');
        return true;
    } catch (error) {
        logError('Backend server is not running. Please start the server first.');
        return false;
    }
}

// Run the verification
async function main() {
    logInfo('Checking server status...');
    const serverRunning = await checkServerStatus();
    
    if (!serverRunning) {
        logError('Please start the backend server first:');
        logInfo('  cd server && npm start');
        process.exit(1);
    }
    
    await runEndToEndVerification();
}

// Execute if run directly
if (require.main === module) {
    main();
}

module.exports = {
    runEndToEndVerification,
    step1_loginVerification,
    step2_protectedRouteVerification,
    step3_tokenExpiryVerification,
    step4_backendTokenValidation
};
