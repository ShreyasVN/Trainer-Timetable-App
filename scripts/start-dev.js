#!/usr/bin/env node

/**
 * Development Startup Script
 * Starts both client and server with proper environment validation
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

function checkNodeModules(dir) {
    const nodeModulesPath = path.join(dir, 'node_modules');
    return checkFileExists(nodeModulesPath);
}

async function runCommand(command, args, cwd, label) {
    return new Promise((resolve, reject) => {
        log(`🚀 Starting ${label}...`, 'cyan');
        
        const process = spawn(command, args, {
            cwd,
            stdio: 'inherit',
            shell: true
        });

        process.on('error', (error) => {
            log(`❌ Failed to start ${label}: ${error.message}`, 'red');
            reject(error);
        });

        process.on('exit', (code) => {
            if (code !== 0) {
                log(`❌ ${label} exited with code ${code}`, 'red');
                reject(new Error(`${label} failed with exit code ${code}`));
            } else {
                log(`✅ ${label} started successfully`, 'green');
                resolve();
            }
        });
    });
}

async function main() {
    const rootDir = path.join(__dirname, '..');
    const serverDir = path.join(rootDir, 'server');
    const clientDir = path.join(rootDir, 'client');

    log('🔧 Development Environment Startup', 'bold');
    log('================================', 'bold');

    // Step 1: Run environment check
    log('\n1. Running environment pre-flight check...', 'yellow');
    try {
        const envCheck = spawn('node', ['scripts/check-env.js'], {
            cwd: rootDir,
            stdio: 'inherit'
        });

        await new Promise((resolve, reject) => {
            envCheck.on('exit', (code) => {
                if (code !== 0) {
                    log('❌ Environment check failed! Please fix the errors above.', 'red');
                    reject(new Error('Environment check failed'));
                } else {
                    log('✅ Environment check passed!', 'green');
                    resolve();
                }
            });
        });
    } catch (error) {
        log('❌ Pre-flight check failed. Exiting...', 'red');
        process.exit(1);
    }

    // Step 2: Check dependencies
    log('\n2. Checking dependencies...', 'yellow');
    
    if (!checkNodeModules(serverDir)) {
        log('❌ Server dependencies not installed. Please run: npm install', 'red');
        process.exit(1);
    }
    log('✅ Server dependencies found', 'green');

    if (!checkNodeModules(clientDir)) {
        log('❌ Client dependencies not installed. Please run: npm install', 'red');
        process.exit(1);
    }
    log('✅ Client dependencies found', 'green');

    // Step 3: Check critical files
    log('\n3. Checking critical files...', 'yellow');
    
    const criticalFiles = [
        path.join(serverDir, 'index.js'),
        path.join(serverDir, '.env'),
        path.join(clientDir, 'package.json'),
        path.join(clientDir, '.env')
    ];

    for (const file of criticalFiles) {
        if (!checkFileExists(file)) {
            log(`❌ Critical file missing: ${file}`, 'red');
            process.exit(1);
        }
    }
    log('✅ All critical files found', 'green');

    // Step 4: Start services
    log('\n4. Starting services...', 'yellow');
    
    // Start server
    log('\n🚀 Starting server on port 5000...', 'cyan');
    const serverProcess = spawn('node', ['index.js'], {
        cwd: serverDir,
        stdio: 'inherit'
    });

    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start client
    log('\n🚀 Starting client on port 3001...', 'cyan');
    const clientProcess = spawn('npm', ['start'], {
        cwd: clientDir,
        stdio: 'inherit'
    });

    // Handle process cleanup
    process.on('SIGINT', () => {
        log('\n🛑 Shutting down services...', 'yellow');
        serverProcess.kill();
        clientProcess.kill();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        log('\n🛑 Shutting down services...', 'yellow');
        serverProcess.kill();
        clientProcess.kill();
        process.exit(0);
    });

    log('\n✅ Development environment started successfully!', 'green');
    log('🌐 Server: http://localhost:5000', 'cyan');
    log('🌐 Client: http://localhost:3001', 'cyan');
    log('\nPress Ctrl+C to stop all services', 'yellow');
}

main().catch((error) => {
    log(`❌ Startup failed: ${error.message}`, 'red');
    process.exit(1);
});
