@echo off
title Working Backend Server - Zenvora AI Platform

echo ========================================
echo    Working Backend Server
echo    Real API Functionality
echo ========================================
echo.

echo 🔧 Starting working backend server...
echo.

REM Check for Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python found - Starting backend...
    echo.
    echo 📡 Backend API will be at: http://localhost:3001
    echo 🏥 Health check: http://localhost:3001/api/health
    echo.
    echo 🛑 Press Ctrl+C to stop backend
    echo ========================================
    echo.
    cd /d "%~dp0"
    python WORKING_BACKEND.py
    goto end
)

REM Check for py launcher
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python launcher found - Starting backend...
    echo.
    echo 📡 Backend API will be at: http://localhost:3001
    echo 🏥 Health check: http://localhost:3001/api/health
    echo.
    echo 🛑 Press Ctrl+C to stop backend
    echo ========================================
    echo.
    cd /d "%~dp0"
    py WORKING_BACKEND.py
    goto end
)

REM No Python found
echo ❌ Python not found
echo.
echo 📥 To use the working backend:
echo.
echo 1️⃣ Install Python 3:
echo    🌐 Go to: https://python.org/downloads/
echo    📥 Download Python 3.x
echo    ✅ Check "Add Python to PATH"
echo    🔄 Restart computer
echo.
echo 2️⃣ Run this script again
echo.
echo 🎯 For now, opening frontend with simulated responses...
echo.
start "" "LAUNCH_NOW.html"
echo ✅ Frontend opened with simulated backend

:end
echo.
echo 📡 Backend Status:
echo    • If Python installed: Real APIs at http://localhost:3001
echo    • If no Python: Frontend uses simulated responses
echo.
pause
