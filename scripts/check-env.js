#!/usr/bin/env node

/**
 * Pre-flight Environment Validation Script
 * Checks for required environment variables and fails fast if any are missing
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

// Required environment variables for server
const SERVER_REQUIRED_VARS = [
    'PORT',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD', 
    'DB_NAME',
    'DB_PORT',
    'JWT_SECRET'
];

// Required environment variables for client
const CLIENT_REQUIRED_VARS = [
    'PORT',
    'REACT_APP_API_URL'
];

// Optional but recommended variables
const SERVER_OPTIONAL_VARS = [
    'CORS_ORIGIN',
    'NODE_ENV'
];

const CLIENT_OPTIONAL_VARS = [
    'REACT_APP_API_TIMEOUT',
    'REACT_APP_APP_NAME',
    'REACT_APP_DEBUG'
];

/**
 * Load environment variables from .env file
 */
function loadEnvFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const env = {};
        
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    env[key.trim()] = valueParts.join('=').trim();
                }
            }
        });
        
        return env;
    } catch (error) {
        return null;
    }
}

/**
 * Check if environment variables are set and valid
 */
function checkEnvironmentVariables(env, requiredVars, optionalVars, context) {
    console.log(`${colors.blue}${colors.bold}=== ${context} Environment Check ===${colors.reset}`);
    
    let hasErrors = false;
    const missing = [];
    const empty = [];
    const warnings = [];
    
    // Check required variables
    requiredVars.forEach(varName => {
        if (!env[varName]) {
            missing.push(varName);
            hasErrors = true;
        } else if (env[varName].trim() === '') {
            empty.push(varName);
            hasErrors = true;
        }
    });
    
    // Check optional variables
    optionalVars.forEach(varName => {
        if (!env[varName]) {
            warnings.push(varName);
        }
    });
    
    // Report missing variables
    if (missing.length > 0) {
        console.log(`${colors.red}✗ Missing required variables:${colors.reset}`);
        missing.forEach(varName => {
            console.log(`  - ${varName}`);
        });
    }
    
    // Report empty variables
    if (empty.length > 0) {
        console.log(`${colors.red}✗ Empty required variables:${colors.reset}`);
        empty.forEach(varName => {
            console.log(`  - ${varName}`);
        });
    }
    
    // Report warnings
    if (warnings.length > 0) {
        console.log(`${colors.yellow}⚠ Missing optional variables:${colors.reset}`);
        warnings.forEach(varName => {
            console.log(`  - ${varName}`);
        });
    }
    
    // Success message
    if (!hasErrors) {
        console.log(`${colors.green}✓ All required variables are set${colors.reset}`);
    }
    
    return hasErrors;
}

/**
 * Validate specific environment values
 */
function validateEnvironmentValues(env, context) {
    let hasErrors = false;
    
    if (context === 'Server') {
        // Check JWT_SECRET strength
        if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
            console.log(`${colors.yellow}⚠ JWT_SECRET should be at least 32 characters long${colors.reset}`);
        }
        
        // Check if JWT_SECRET is the default value
        if (env.JWT_SECRET && (env.JWT_SECRET.includes('change_this') || env.JWT_SECRET === 'very_secret_key')) {
            console.log(`${colors.red}✗ JWT_SECRET appears to be using a default value. Please change it!${colors.reset}`);
            hasErrors = true;
        }
        
        // Check PORT
        if (env.PORT && isNaN(env.PORT)) {
            console.log(`${colors.red}✗ PORT must be a number${colors.reset}`);
            hasErrors = true;
        }
        
        // Check DB_PORT
        if (env.DB_PORT && isNaN(env.DB_PORT)) {
            console.log(`${colors.red}✗ DB_PORT must be a number${colors.reset}`);
            hasErrors = true;
        }
    }
    
    if (context === 'Client') {
        // Check PORT
        if (env.PORT && isNaN(env.PORT)) {
            console.log(`${colors.red}✗ PORT must be a number${colors.reset}`);
            hasErrors = true;
        }
        
        // Check API URL format
        if (env.REACT_APP_API_URL && !env.REACT_APP_API_URL.startsWith('http')) {
            console.log(`${colors.red}✗ REACT_APP_API_URL must start with http:// or https://${colors.reset}`);
            hasErrors = true;
        }
    }
    
    return hasErrors;
}

/**
 * Main execution function
 */
function main() {
    console.log(`${colors.bold}Environment Pre-flight Check${colors.reset}\n`);
    
    let totalErrors = false;
    
    // Check server environment
    const serverEnvPath = path.join(__dirname, '../server/.env');
    const serverEnv = loadEnvFile(serverEnvPath);
    
    if (!serverEnv) {
        console.log(`${colors.red}✗ Server .env file not found at: ${serverEnvPath}${colors.reset}`);
        totalErrors = true;
    } else {
        const serverErrors = checkEnvironmentVariables(serverEnv, SERVER_REQUIRED_VARS, SERVER_OPTIONAL_VARS, 'Server');
        const serverValidationErrors = validateEnvironmentValues(serverEnv, 'Server');
        totalErrors = totalErrors || serverErrors || serverValidationErrors;
    }
    
    console.log(''); // Empty line for spacing
    
    // Check client environment
    const clientEnvPath = path.join(__dirname, '../client/.env');
    const clientEnv = loadEnvFile(clientEnvPath);
    
    if (!clientEnv) {
        console.log(`${colors.red}✗ Client .env file not found at: ${clientEnvPath}${colors.reset}`);
        totalErrors = true;
    } else {
        const clientErrors = checkEnvironmentVariables(clientEnv, CLIENT_REQUIRED_VARS, CLIENT_OPTIONAL_VARS, 'Client');
        const clientValidationErrors = validateEnvironmentValues(clientEnv, 'Client');
        totalErrors = totalErrors || clientErrors || clientValidationErrors;
    }
    
    console.log(''); // Empty line for spacing
    
    // Final result
    if (totalErrors) {
        console.log(`${colors.red}${colors.bold}❌ Environment check failed! Please fix the errors above.${colors.reset}`);
        process.exit(1);
    } else {
        console.log(`${colors.green}${colors.bold}✅ Environment check passed! All required variables are properly configured.${colors.reset}`);
        process.exit(0);
    }
}

// Run the check
main();
