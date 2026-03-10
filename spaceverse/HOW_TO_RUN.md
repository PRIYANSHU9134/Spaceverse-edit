# How to Run the Space Traffic Simulator

## Overview

This document provides instructions for running the complete What-If Space Traffic Simulator system, including the main SpaceVerse application, the simulation engine, and the AI service.

## Prerequisites

Before running the system, ensure you have the following installed:

1. **Node.js** (v16 or higher)
2. **Python** (3.8 or higher)
3. **MongoDB** (4.4 or higher) - Local installation or MongoDB Atlas account
4. **Git** (for cloning the repository)
5. **npm** (comes with Node.js)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SpaceVerse_final-main
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following content:

```env
# MongoDB Configuration
# For local development:
MONGODB_URI=mongodb://localhost:27017/spaceverse

# For MongoDB Atlas (replace with your actual values):
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/spaceverse?retryWrites=true&w=majority

# Session Configuration
SESSION_SECRET=your_super_secret_session_key_here

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000

# Application Configuration
NODE_ENV=development
PORT=5000
```

### 4. Install Python Dependencies for AI Service

```bash
cd ai-service
pip install -r requirements.txt
cd ..
```

## Running the System

### Option 1: Manual Startup (Development)

#### Step 1: Start MongoDB
If using a local MongoDB installation:

```bash
# On Windows
mongod

# On macOS/Linux
sudo mongod
```

#### Step 2: Start the AI Service

In a new terminal window/tab:

```bash
cd ai-service
python ai_service.py
```

The AI service will start on port 8000.

#### Step 3: Start the Main Application

In another terminal window/tab:

```bash
npm start
```

The main application will start on port 5000 (or another available port).

#### Step 4: Access the Application

Open your web browser and navigate to:
```
http://localhost:5000
```

### Option 2: Docker Startup (Recommended for Production)

#### Step 1: Build and Start All Services

```bash
docker-compose up --build
```

This will start three containers:
1. MongoDB database
2. Main SpaceVerse application
3. AI prediction service

#### Step 2: Access the Application

Open your web browser and navigate to:
```
http://localhost:5000
```

### Option 3: Using Startup Scripts (Windows)

#### Step 1: Start the AI Service

Double-click on `ai-service/start.bat` or run in terminal:

```cmd
cd ai-service
start.bat
```

#### Step 2: Start the Main Application

In another terminal window:

```bash
npm start
```

## System Architecture Overview

When running, the system consists of three main components:

1. **Main Application** (Node.js/Express)
   - Runs on port 5000
   - Serves the web interface
   - Handles user authentication
   - Manages database operations
   - Coordinates with AI service

2. **AI Service** (Python/FastAPI)
   - Runs on port 8000
   - Provides machine learning predictions
   - Analyzes simulation results
   - Generates risk assessments

3. **Database** (MongoDB)
   - Stores user data
   - Stores simulation results
   - Manages gamification scores

## Accessing Different Parts of the Application

### Main SpaceVerse Application
```
http://localhost:5000
```

### 3D Solar System Explorer
```
http://localhost:5000/solar-system
```

### Space Traffic Simulator
```
http://localhost:5000/space-traffic-simulator
```

### Space Traffic Visualization
```
http://localhost:5000/space-traffic-visualization
```

### AI Service API Documentation
```
http://localhost:8000/docs
```

## Testing the System

### 1. User Registration and Login
1. Navigate to the main page
2. Click "Sign Up" and create an account
3. Log in with your credentials

### 2. Running a Simulation
1. Navigate to "Space Traffic Simulator"
2. Create a scenario with desired parameters
3. Click "Run Simulation"
4. View results, AI analysis, and updated scores

### 3. Viewing 3D Visualization
1. Navigate to "Space Traffic Visualization"
2. Explore the 3D space environment
3. Interact with satellites and planets

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Module not found" errors
**Solution**: Ensure all dependencies are installed:
```bash
npm install
cd ai-service
pip install -r requirements.txt
```

#### Issue: MongoDB connection failed
**Solution**: 
1. Ensure MongoDB is running
2. Check the MONGODB_URI in your .env file
3. Verify network connectivity to the database

#### Issue: AI service not responding
**Solution**:
1. Ensure the AI service is running on port 8000
2. Check that the AI_SERVICE_URL in .env is correct
3. Verify that no firewall is blocking the connection

#### Issue: Port already in use
**Solution**: 
1. Change the PORT value in .env
2. Or stop the process using the port:
```bash
# On Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# On macOS/Linux
lsof -i :5000
kill -9 <pid>
```

### Checking Service Status

#### Check if MongoDB is running:
```bash
# Connect to MongoDB
mongo
```

#### Check if AI service is running:
```bash
curl http://localhost:8000/health
```

#### Check if main application is running:
Navigate to `http://localhost:5000` in your browser

## Stopping the System

### Manual Shutdown
1. Press `Ctrl+C` in each terminal window to stop the services
2. If using MongoDB locally, stop the MongoDB service

### Docker Shutdown
```bash
docker-compose down
```

## Development Workflow

### Making Changes to the Main Application
1. Edit files in the root directory
2. Changes will be reflected immediately (nodemon is used for auto-restart)
3. No need to manually restart the server

### Making Changes to the AI Service
1. Edit files in the `ai-service/` directory
2. Restart the AI service for changes to take effect
3. During development, you can run with auto-reload:
```bash
cd ai-service
uvicorn ai_service:app --reload
```

## Monitoring and Logs

### Main Application Logs
Logs are printed to the terminal where the application is running.

### AI Service Logs
Logs are printed to the terminal where the AI service is running.

### Database Logs
If using local MongoDB, logs are typically found in:
- **Windows**: `%PROGRAMFILES%\MongoDB\Server\[version]\log\`
- **macOS**: `/usr/local/var/log/mongodb/`
- **Linux**: `/var/log/mongodb/`

## Performance Considerations

### Recommended Hardware
- **CPU**: 4 cores or more
- **RAM**: 8GB or more
- **Storage**: 10GB free space for database growth

### Scaling for Production
For production deployment, consider:
1. Using a managed MongoDB service (MongoDB Atlas)
2. Deploying the AI service on a separate machine with GPU acceleration
3. Using a load balancer for the main application
4. Implementing caching for frequently accessed data

## Security Considerations

### Production Deployment
1. Use HTTPS in production
2. Rotate session secrets regularly
3. Use strong passwords for database access
4. Implement proper firewall rules
5. Regularly update dependencies

### Environment Variables
Never commit `.env` files to version control. Use `.env.example` as a template.

## Backup and Recovery

### Database Backup
For MongoDB, use:
```bash
mongodump --uri="mongodb://localhost:27017/spaceverse"
```

### Configuration Backup
Backup your `.env` file and any custom configuration files.

## Support and Maintenance

### Updating Dependencies
Regularly update dependencies to get security fixes:
```bash
npm outdated
npm update

cd ai-service
pip list --outdated
pip install -r requirements.txt --upgrade
```

### Monitoring Health
Implement monitoring for:
1. Application uptime
2. Database performance
3. AI service response times
4. Error rates

This concludes the setup and running instructions for the Space Traffic Simulator. Enjoy exploring space traffic scenarios and learning about orbital mechanics!