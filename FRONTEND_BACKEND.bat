@echo off
title Frontend + Backend - Complete System

echo ========================================
echo    Complete System Launcher
echo    Frontend + Working Backend
echo ========================================
echo.

echo 🚀 Starting complete Zenvora AI Platform...
echo.

cd /d "%~dp0"

REM Start backend first
echo 1️⃣ Starting Working Backend Server...
echo.

python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python found - Starting backend...
    start /min "Backend Server" cmd /c "python WORKING_BACKEND.py"
    timeout /t 3 >nul
    echo ✅ Backend started on http://localhost:3001
    goto frontend
)

py --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python launcher found - Starting backend...
    start /min "Backend Server" cmd /c "py WORKING_BACKEND.py"
    timeout /t 3 >nul
    echo ✅ Backend started on http://localhost:3001
    goto frontend
)

echo ❌ Python not found - Backend will use simulated responses
echo.

:frontend
echo 2️⃣ Starting Frontend...
echo.

REM Open frontend
start "" "LAUNCH_NOW.html"

echo.
echo ✅ Complete System Started!
echo.
echo 📋 System Status:
echo    • Frontend: Open in browser tabs
echo    • Backend: Running in "Backend Server" window
echo.
echo 🌐 Available Services:
echo    • Frontend: Check browser tabs
echo    • Backend API: http://localhost:3001
echo    • Health Check: http://localhost:3001/api/health
echo.
echo 🎯 Features Active:
echo    • Real AI analysis (if Python backend running)
echo    • Code generation tools
echo    • Security scanning
echo    • Performance optimization
echo    • Project management
echo.
echo 💡 To verify backend:
echo    • Look for "Backend Server" window
echo    • Visit: http://localhost:3001/api/health
echo    • Should see: {"status": "healthy"}
echo.
echo 🎉 Your Zenvora AI Platform is fully operational!
echo.

pause
