/**
 * Diagnostic Script for Application Shutdown Issues
 * This script will help identify what's causing the shutdown problems
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

console.log('🔍 Diagnosing Spaceverse Application Shutdown Issues...\n');

// Check 1: Environment Variables
console.log('📋 CHECK 1: Environment Configuration');
try {
    require('dotenv').config();
    const requiredVars = ['MONGODB_URI', 'PORT'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
        console.log('   Solution: Check your .env file');
    } else {
        console.log('✅ Environment variables are configured');
        console.log(`   PORT: ${process.env.PORT || 5000}`);
        console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '[CONFIGURED]' : 'NOT SET'}`);
    }
} catch (err) {
    console.log('❌ Error reading .env file:', err.message);
}
console.log('');

// Check 2: Port Availability
console.log('📋 CHECK 2: Port Availability');
function checkPort(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        server.on('error', () => resolve(false));
    });
}

async function checkPorts() {
    const ports = [5000, 8000, 27017];
    for (const port of ports) {
        const available = await checkPort(port);
        if (available) {
            console.log(`✅ Port ${port} is available`);
        } else {
            console.log(`⚠️  Port ${port} is in use`);
            // Try to identify what's using the port
            exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                if (stdout) {
                    const lines = stdout.trim().split('\n');
                    lines.forEach(line => {
                        const parts = line.trim().split(/\s+/);
                        if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
                            const pid = parts[4];
                            console.log(`   Process PID ${pid} is using port ${port}`);
                        }
                    });
                }
            });
        }
    }
}

// Check 3: MongoDB Connection
console.log('📋 CHECK 3: MongoDB Connection');
async function checkMongoDB() {
    try {
        const mongoose = require('mongoose');
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaceverse';
        
        console.log(`   Attempting connection to: ${uri}`);
        
        // Set shorter timeout for diagnosis
        mongoose.set('bufferCommands', false);
        
        const connection = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 5000
        });
        
        console.log('✅ MongoDB connected successfully');
        await mongoose.connection.close();
    } catch (err) {
        console.log('❌ MongoDB connection failed:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.log('   Solution: Make sure MongoDB is running');
            console.log('   Try: mongod --dbpath ./data/db');
        } else if (err.message.includes('authentication')) {
            console.log('   Solution: Check MongoDB credentials in .env');
        }
    }
}

// Check 4: Dependency Health
console.log('📋 CHECK 4: Node.js Dependencies');
try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    console.log(`✅ Found ${dependencies.length} dependencies`);
    
    // Check for critical dependencies
    const criticalDeps = ['express', 'mongoose', 'cors'];
    const missingCritical = criticalDeps.filter(dep => !dependencies.includes(dep));
    
    if (missingCritical.length > 0) {
        console.log(`❌ Missing critical dependencies: ${missingCritical.join(', ')}`);
    } else {
        console.log('✅ All critical dependencies present');
    }
} catch (err) {
    console.log('❌ Error reading package.json:', err.message);
}

console.log('');

// Check 5: File Structure
console.log('📋 CHECK 5: Required Files');
const requiredFiles = [
    './app.js',
    './app-enhanced.js',
    './.env',
    './package.json',
    './ai-service/ai_service.py'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

console.log('');

// Check 6: Process Management
console.log('📋 CHECK 6: Running Processes');
exec('tasklist | findstr "node.exe"', (error, stdout) => {
    if (stdout) {
        console.log('Node.js processes currently running:');
        console.log(stdout);
    } else {
        console.log('No Node.js processes found');
    }
    
    exec('tasklist | findstr "python.exe"', (error, stdout) => {
        if (stdout) {
            console.log('Python processes currently running:');
            console.log(stdout);
        } else {
            console.log('No Python processes found');
        }
        
        // Run the port checks after process info is displayed
        checkPorts().then(() => {
            checkMongoDB().then(() => {
                console.log('\n✨ Diagnosis Complete!');
                console.log('\n🔧 Recommended Actions:');
                console.log('1. If MongoDB connection fails: Start MongoDB service');
                console.log('2. If ports are in use: Kill conflicting processes or change ports');
                console.log('3. If dependencies missing: Run "npm install"');
                console.log('4. If environment vars missing: Check .env file');
            });
        });
    });
});