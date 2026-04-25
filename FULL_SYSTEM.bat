@echo off
title Full System - Frontend + Backend

echo ========================================
echo    Full System Launcher
echo    Frontend + Backend Real APIs
echo ========================================
echo.

echo 🚀 Starting complete Zenvora AI Platform...
echo.

REM Start backend first
echo 1️⃣ Starting Backend Server...
echo.

cd /d "%~dp0"

REM Try Node.js backend
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js found - Starting Node.js backend...
    cd backend
    start /min "Backend Server" cmd /c "npm install && node server.js"
    timeout /t 3 >nul
    cd ..
    goto frontend
)

REM Try Python backend
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python found - Starting Python backend...
    start /min "Backend Server" cmd /c "python backend_python_server.py"
    timeout /t 3 >nul
    goto frontend
)

echo ❌ No backend runtime found
echo 🎯 Frontend will use simulated responses
echo.

:frontend
echo 2️⃣ Starting Frontend...
echo.

REM Open frontend
start "" "LAUNCH_NOW.html"

echo.
echo ✅ System Started!
echo.
echo 📋 Status:
echo    • Frontend: Open in browser
echo    • Backend: Check for "Backend Server" window
echo.
echo 🌐 Available:
echo    • Frontend: Check browser tabs
echo    • Backend API: http://localhost:3001 (if running)
echo.
echo 🎯 Features:
echo    • Real AI analysis (if backend running)
echo    • Simulated responses (if no backend)
echo    • All UI buttons functional
echo.
echo 💡 To check backend status:
echo    • Look for "Backend Server" window
echo    • Or visit: http://localhost:3001/api/health
echo.

echo 🎉 Your Zenvora AI Platform is ready!
echo.

pause
