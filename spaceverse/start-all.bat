@echo off
REM Start both Spaceverse Server and AI Service

echo ========================================
echo Starting Spaceverse Complete System
echo ========================================

REM Start MongoDB (if not already running)
echo Checking if MongoDB is running...
netstat -an | findstr ":27017" >nul
if %errorlevel% == 0 (
    echo MongoDB is already running
) else (
    echo Starting MongoDB...
    start mongod
    timeout /t 5 /nobreak >nul
)

REM Start AI Service in background
echo Starting AI Service...
cd ai-service
start "AI Service" /min cmd /c "python ai_service.py"
cd ..

REM Wait a moment for AI service to start
timeout /t 3 /nobreak >nul

REM Start Main Application
echo Starting Main Application...
npm start

echo ========================================
echo System Shutdown
echo ========================================