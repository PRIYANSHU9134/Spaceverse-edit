/**
 * Start Script for Spaceverse Complete System
 * This script starts both the main Node.js application and the AI service
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

console.log('========================================');
console.log('Starting Spaceverse Complete System');
console.log('========================================');

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
  
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Start Main Application
console.log('Starting Main Application...');
mainAppProcess = spawn('node', ['app-enhanced.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

mainAppProcess.on('error', (err) => {
  console.error('Failed to start main application:', err);
});

mainAppProcess.on('close', (code) => {
  console.log(`Main application exited with code ${code}`);
  cleanup();
});

// Wait a bit before starting AI service
setTimeout(() => {
  // Start AI Service
  console.log('Starting AI Service...');
  
  const aiServicePath = path.join(process.cwd(), 'ai-service');
  
  if (os.platform() === 'win32') {
    // Windows
    aiServiceProcess = spawn('python', ['ai_service.py'], {
      stdio: 'inherit',
      cwd: aiServicePath
    });
  } else {
    // Unix/Linux/Mac
    aiServiceProcess = spawn('python3', ['ai_service.py'], {
      stdio: 'inherit',
      cwd: aiServicePath
    });
  }
  
  aiServiceProcess.on('error', (err) => {
    console.error('Failed to start AI service:', err);
  });
  
  aiServiceProcess.on('close', (code) => {
    console.log(`AI service exited with code ${code}`);
  });
}, 3000);

console.log('\nServices started successfully!');
console.log('Press Ctrl+C to stop all services.');