# How to Run the Complete SpaceVerse System

## Prerequisites

1. Node.js v16 or higher
2. Python 3.8 or higher
3. MongoDB (local or cloud instance)
4. Windows, macOS, or Linux operating system

## Quick Start (Single Command)

For the easiest way to start the complete system, use the single-command approach:

```bash
npm run start-all
```

This will automatically start:
- MongoDB (if not already running)
- The AI Service (on port 8001)
- The main Spaceverse application (on port 5002)

## Manual Start (Traditional Method)

### Step 1: Start MongoDB

If you're using a local MongoDB instance:

```bash
# If MongoDB is installed locally
mongod

# Or if using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

If you're using MongoDB Atlas, make sure you have your connection string ready.

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and set your MongoDB connection string:
   ```
   MONGODB_URI=your_mongodb_connection_string_here
   SESSION_SECRET=your_random_session_secret_here
   AI_SERVICE_URL=http://localhost:8001
   ```

## Step 3: Install Node.js Dependencies

```bash
# Navigate to the project root directory
cd Spaceverse_final-main

# Install Node.js dependencies
npm install
```

## Step 4: Start the Main Application

Open a new terminal window/tab and run:

```bash
# From the project root directory
npm start
```

The application will start on port 5001 (or the next available port if 5000 is taken).

## Step 5: Install Python Dependencies for AI Service

Open a new terminal window/tab and navigate to the AI service directory:

```bash
# From the project root directory
cd ai-service

# Install Python dependencies
pip install -r requirements.txt
```

Note: If you encounter issues with scikit-learn installation on Windows, you may need to:
1. Install Microsoft Visual C++ Build Tools
2. Or use conda: `conda install scikit-learn`

## Step 6: Start the AI Service

From the `ai-service` directory:

```bash
# On Windows
python ai_service.py

# On macOS/Linux
python3 ai_service.py
```

The AI service will start on port 8001.

## Alternative: Using Docker (Recommended for Easy Deployment)

If you have Docker installed, you can run the entire system with a single command:

```bash
# From the project root directory
docker-compose up
```

This will start:
- MongoDB on port 27017
- Main application on port 5000
- AI service on port 8001

## Accessing the Application

Once both services are running:

1. Open your web browser
2. Navigate to `http://localhost:5004` (or the port shown in the terminal output)
3. Register for an account or log in with existing credentials
4. Explore the Solar System
5. Access the Space Traffic Simulator from the main navigation
6. Test AI features by creating a scenario in the Space Traffic Simulator

## Troubleshooting

### Port Conflicts
If you see port conflicts, the application will automatically select the next available port. Check the terminal output for the actual port being used.

### MongoDB Connection Issues
Ensure MongoDB is running and the connection string in `.env` is correct.

### AI Service Not Responding
Make sure the AI service is running on port 8001 and the `AI_SERVICE_URL` in `.env` points to the correct address.

### Dependency Installation Issues
If you encounter issues installing Python dependencies:
1. Try using a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Or use conda if available:
   ```bash
   conda create -n spaceverse python=3.9
   conda activate spaceverse
   pip install -r requirements.txt
   ```

## Stopping the Services

To stop the services:

1. For manual start: Press `Ctrl+C` in each terminal window
2. For Docker: Run `docker-compose down` from the project root directory

## Testing the System

Once everything is running, you can test the API endpoints:

1. Main application endpoints:
   - `GET http://localhost:5001/api/user` - Check authentication status
   - `GET http://localhost:5001/api/planets` - Get planet data

2. Simulator endpoints (requires authentication):
   - `GET http://localhost:5001/api/simulator/scores` - Get user scores
   - `GET http://localhost:5001/api/simulator/leaderboard` - Get leaderboard

3. AI service endpoints:
   - `GET http://localhost:8001/health` - Health check
   - `GET http://localhost:8001/` - Service information

## Conclusion

The SpaceVerse system is now ready for use. The main application provides the educational platform for exploring the solar system, while the AI-powered Space Traffic Simulator adds advanced capabilities for analyzing space traffic scenarios.