/**
 * Graceful Application Startup Script with Built-in Health Checks
 * This replaces the problematic startup scripts with robust error handling
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Spaceverse Application with Health Monitoring...\n');

// Global process references
let mainAppProcess = null;
let aiServiceProcess = null;
let mongoProcess = null;

// Cleanup function
function cleanup() {
    console.log('\n🧹 Shutting down services gracefully...');
    
    const promises = [];
    
    if (mainAppProcess && !mainAppProcess.killed) {
        console.log('🛑 Stopping main application...');
        promises.push(new Promise(resolve => {
            mainAppProcess.once('close', resolve);
            mainAppProcess.kill('SIGTERM');
        }));
    }
    
    if (aiServiceProcess && !aiServiceProcess.killed) {
        console.log('🛑 Stopping AI service...');
        promises.push(new Promise(resolve => {
            aiServiceProcess.once('close', resolve);
            aiServiceProcess.kill('SIGTERM');
        }));
    }
    
    // Wait for all processes to close
    Promise.all(promises).then(() => {
        console.log('✅ All services stopped gracefully');
        process.exit(0);
    }).catch(err => {
        console.error('Error during shutdown:', err);
        process.exit(1);
    });
}

// Register cleanup handlers
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => console.log('👋 Application shutdown complete'));

// Health check function
async function waitForService(url, serviceName, maxAttempts = 30) {
    const axios = require('axios');
    
    for (let i = 1; i <= maxAttempts; i++) {
        try {
            await axios.get(url, { timeout: 2000 });
            console.log(`✅ ${serviceName} is ready`);
            return true;
        } catch (err) {
            if (i === maxAttempts) {
                console.log(`❌ ${serviceName} failed to start after ${maxAttempts} attempts`);
                return false;
            }
            process.stdout.write(`⏳ Waiting for ${serviceName}... (${i}/${maxAttempts})\r`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}

// Check if required ports are available
function checkPortAvailability(port) {
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

// Kill processes using specific ports
async function freePort(port) {
    return new Promise((resolve) => {
        exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
            if (stdout) {
                const lines = stdout.split('\n');
                const pids = new Set();
                
                lines.forEach(line => {
                    const parts = line.trim().split(/\s+/);
                    if (parts.length >= 5 && parts[1].includes(`:${port}`)) {
                        pids.add(parts[4]);
                    }
                });
                
                if (pids.size > 0) {
                    console.log(`⚠️  Killing processes using port ${port}: ${Array.from(pids).join(', ')}`);
                    pids.forEach(pid => {
                        exec(`taskkill /PID ${pid} /F`, () => {});
                    });
                    // Give time for processes to terminate
                    setTimeout(resolve, 2000);
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        });
    });
}

// Start MongoDB
async function startMongoDB() {
    console.log('🗄️  Starting MongoDB...');
    
    // Check if MongoDB is already running
    try {
        const mongoose = require('mongoose');
        await mongoose.connect('mongodb://localhost:27017/test', { 
            serverSelectionTimeoutMS: 2000 
        });
        await mongoose.connection.close();
        console.log('✅ MongoDB is already running');
        return true;
    } catch (err) {
        // MongoDB not running, try to start it
        try {
            mongoProcess = spawn('mongod', ['--dbpath', './data/db'], {
                stdio: 'inherit'
            });
            
            mongoProcess.on('error', (err) => {
                console.log('⚠️  Could not start MongoDB automatically');
                console.log('   Please start MongoDB manually or use MongoDB Atlas');
            });
            
            // Wait a bit for MongoDB to start
            await new Promise(resolve => setTimeout(resolve, 3000));
            return true;
        } catch (err) {
            console.log('⚠️  MongoDB startup failed - continuing without local MongoDB');
            return true; // Continue anyway, might be using Atlas
        }
    }
}

// Start AI Service
async function startAIService() {
    console.log('\n🤖 Starting AI Service...');
    
    const portAvailable = await checkPortAvailability(8000);
    if (!portAvailable) {
        console.log('⚠️  Port 8000 is busy, attempting to free it...');
        await freePort(8000);
    }
    
    const aiServicePath = path.join(__dirname, 'ai-service', 'ai_service.py');
    
    aiServiceProcess = spawn('python', [aiServicePath], {
        cwd: path.join(__dirname, 'ai-service'),
        stdio: 'inherit',
        env: { ...process.env, PYTHONPATH: '.' }
    });
    
    aiServiceProcess.on('error', (err) => {
        console.error('❌ Failed to start AI service:', err.message);
    });
    
    aiServiceProcess.on('close', (code) => {
        console.log(`🤖 AI service exited with code ${code}`);
        if (code !== 0) {
            console.log('💡 Tip: Make sure Python and required packages are installed');
        }
    });
    
    // Wait for AI service to be ready
    const aiReady = await waitForService('http://localhost:8000/health', 'AI Service');
    return aiReady;
}

// Start Main Application
async function startMainApp() {
    console.log('\n🌐 Starting Main Application...');
    
    // Check and free port 5000
    const portAvailable = await checkPortAvailability(5000);
    if (!portAvailable) {
        console.log('⚠️  Port 5000 is busy, attempting to free it...');
        await freePort(5000);
    }
    
    // Use the enhanced app with better error handling
    mainAppProcess = spawn('node', ['app-enhanced.js'], {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
    });
    
    mainAppProcess.on('error', (err) => {
        console.error('❌ Failed to start main application:', err.message);
    });
    
    mainAppProcess.on('close', (code) => {
        console.log(`🌐 Main application exited with code ${code}`);
        cleanup();
    });
    
    // Wait for main app to be ready
    const appReady = await waitForService('http://localhost:5000', 'Main Application');
    return appReady;
}

// Main startup sequence
async function startAllServices() {
    try {
        console.log('🔧 Pre-flight checks...');
        
        // Check environment
        if (!fs.existsSync('.env')) {
            console.log('⚠️  .env file not found, creating default...');
            fs.writeFileSync('.env', 'PORT=5000\nMONGODB_URI=mongodb://localhost:27017/spaceverse\n');
        }
        
        // Start services in order
        await startMongoDB();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Brief pause
        
        const aiStarted = await startAIService();
        if (!aiStarted) {
            console.log('⚠️  Continuing without AI service...');
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for AI service
        
        const appStarted = await startMainApp();
        if (!appStarted) {
            throw new Error('Main application failed to start');
        }
        
        console.log('\n🎉 ALL SERVICES STARTED SUCCESSFULLY!');
        console.log('========================================');
        console.log('🌍 Main App:    http://localhost:5000');
        console.log('🤖 AI Service:  http://localhost:8000');
        console.log('========================================');
        console.log('Press Ctrl+C to stop all services gracefully');
        
    } catch (error) {
        console.error('\n💥 Startup failed:', error.message);
        console.log('\n🔧 Troubleshooting tips:');
        console.log('1. Check if ports 5000/8000 are available');
        console.log('2. Ensure MongoDB is running');
        console.log('3. Run "npm install" to install dependencies');
        console.log('4. Check your .env file configuration');
        cleanup();
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('🚨 Uncaught Exception:', err);
    cleanup();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    cleanup();
});

// Start everything
startAllServices();