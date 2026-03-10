#!/bin/bash

# Start both Spaceverse Server and AI Service

echo "========================================"
echo "Starting Spaceverse Complete System"
echo "========================================"

# Start MongoDB (if not already running)
if ! pgrep -x "mongod" > /dev/null
then
    echo "Starting MongoDB..."
    mongod --fork --logpath /var/log/mongodb/mongod.log
    sleep 5
else
    echo "MongoDB is already running"
fi

# Start AI Service in background
echo "Starting AI Service..."
cd ai-service
python ai_service.py &
AI_SERVICE_PID=$!
cd ..

# Wait a moment for AI service to start
sleep 3

# Start Main Application
echo "Starting Main Application..."
npm start

# Cleanup on exit
trap "kill $AI_SERVICE_PID 2>/dev/null; exit" EXIT

echo "========================================"
echo "System Shutdown"
echo "========================================"