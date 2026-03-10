@echo off
REM Spaceverse Application Shutdown and Cleanup Script
REM Safely stops all Spaceverse-related processes

echo ========================================
echo Spaceverse Application Shutdown Utility
echo ========================================

echo.
echo 🛑 Stopping Spaceverse processes...

REM Kill Node.js processes (be careful - this kills ALL node processes)
echo Killing Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% == 0 (
    echo ✅ Node.js processes stopped
) else (
    echo ℹ️  No Node.js processes found
)

echo.
echo Killing Python processes...
taskkill /f /im python.exe 2>nul
if %errorlevel% == 0 (
    echo ✅ Python processes stopped
) else (
    echo ℹ️  No Python processes found
)

echo.
echo Cleaning up port conflicts...
REM Alternative method to free ports using netsh (Windows 10+)
netsh interface ipv4 show excludedportrange protocol=tcp | findstr "5000\|8000" >nul
if %errorlevel% == 0 (
    echo ⚠️  Ports may be reserved. Restarting Windows networking service might help.
    echo    Run as Administrator: net stop winnat && net start winnat
)

echo.
echo ========================================
echo ✅ Shutdown Complete!
echo You can now safely restart the application
echo ========================================
pause