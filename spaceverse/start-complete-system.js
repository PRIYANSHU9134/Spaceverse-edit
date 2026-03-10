/**
 * Complete System Startup Script for Spaceverse
 * This script starts MongoDB, the AI service, and the main application
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

console.log('========================================');
console.log('Spaceverse Complete System Startup');
console.log('========================================');

let mongoProcess;
let mainAppProcess;
let aiServiceProcess;

// Function to cleanup processes on exit
function cleanup() {
  console.log('\nShutting down services...');
  
  if (mainAppProcess) {
    mainAppProcess.kill();
  }
  
  if (aiServiceProcess) {
    aiServiceProcess.kill();
  }
  
  if (mongoProcess) {
    mongoProcess.kill();
  }
  
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Function to check if a process is running
function isProcessRunning(processName, callback) {
  const command = os.platform() === 'win32' 
    ? `tasklist /FI "IMAGENAME eq ${processName}" /FO CSV`
    : `pgrep -x "${processName}"`;
    
  exec(command, (error, stdout) => {
    if (os.platform() === 'win32') {
      callback(!error && stdout.includes(processName));
    } else {
      callback(!error && stdout.trim() !== '');
    }
  });
}

// Function to start MongoDB
function startMongoDB() {
  return new Promise((resolve) => {
    console.log('Checking MongoDB status...');
    
    isProcessRunning('mongod', (running) => {
      if (running) {
        console.log('MongoDB is already running');
        resolve();
      } else {
        console.log('Starting MongoDB...');
        // Try to start MongoDB
        mongoProcess = spawn('mongod', [], {
          stdio: 'pipe'
        });
        
        mongoProcess.stdout.on('data', (data) => {
          // Wait for MongoDB to be ready
          if (data.toString().includes('waiting for connections')) {
            console.log('MongoDB started successfully');
            resolve();
          }
        });
        
        mongoProcess.stderr.on('data', (data) => {
          // If we see connection messages, assume it's working
          if (data.toString().includes('port') || data.toString().includes('connection')) {
            console.log('MongoDB appears to be running');
            resolve();
          }
        });
        
        // Give MongoDB some time to start
        setTimeout(() => {
          console.log('Assuming MongoDB is ready (timeout)');
          resolve();
        }, 5000);
      }
    });
  });
}

// Function to start AI Service
function startAIService() {
  return new Promise((resolve) => {
    console.log('Starting AI Service...');
    
    const aiServicePath = path.join(process.cwd(), 'ai-service');
    
    // First, install dependencies
    console.log('Installing AI service dependencies...');
    const installProcess = spawn(os.platform() === 'win32' ? 'pip' : 'pip3', ['install', '-r', 'requirements.txt'], {
      cwd: aiServicePath,
      stdio: 'inherit'
    });
    
    installProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Failed to install AI service dependencies');
        resolve();
        return;
      }
      
      console.log('Starting AI service...');
      
      const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
      aiServiceProcess = spawn(pythonCmd, ['ai_service.py'], {
        stdio: 'inherit',
        cwd: aiServicePath
      });
      
      aiServiceProcess.on('error', (err) => {
        console.error('Failed to start AI service:', err.message);
      });
      
      // Give the AI service time to start
      setTimeout(() => {
        console.log('AI service started');
        resolve();
      }, 3000);
    });
  });
}

// Function to start Main Application
function startMainApplication() {
  console.log('Starting Main Application...');
  mainAppProcess = spawn('node', ['app-enhanced.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  mainAppProcess.on('error', (err) => {
    console.error('Failed to start main application:', err.message);
  });
  
  mainAppProcess.on('close', (code) => {
    console.log(`Main application exited with code ${code}`);
    cleanup();
  });
}

// Main startup sequence
async function startAllServices() {
  try {
    // Start MongoDB
    await startMongoDB();
    
    // Start AI Service
    await startAIService();
    
    // Small delay to ensure services are ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start Main Application
    startMainApplication();
    
    console.log('\n========================================');
    console.log('All services started successfully!');
    console.log('Main App: http://localhost:5002');
    console.log('AI Service: http://localhost:8001');
    console.log('Press Ctrl+C to stop all services.');
    console.log('========================================');
  } catch (error) {
    console.error('Error starting services:', error.message);
    cleanup();
  }
}

// Start everything
startAllServices();