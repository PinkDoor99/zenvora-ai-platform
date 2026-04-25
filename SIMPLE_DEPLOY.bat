@echo off
title Zenvora AI Platform - Simple Deployment

echo ========================================
echo    🚀 ZENVORA AI PLATFORM SIMPLE DEPLOY 🚀
echo    Python-Based Deployment (No Docker/Node)
echo ========================================
echo.

echo 🔧 Starting Simple Deployment...
echo.

cd /d "%~dp0"

echo 1️⃣ Checking Python availability...
echo.

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python first.
    echo    Download from: https://python.org/
    pause
    exit /b 1
)

echo ✅ Python found!
echo.

echo 2️⃣ Starting web server...
echo.

start /min python -m http.server 8080

echo 3️⃣ Starting simple backend simulation...
echo.

start /min python simple_backend.py

echo ⏳ Waiting for services to start...
timeout /t 5 >nul

echo 4️⃣ Opening Zenvora AI Platform...
echo.

start http://localhost:8080/ZENVORA_REVOLUTION.html

echo.
echo ✅ SIMPLE DEPLOYMENT COMPLETE!
echo.
echo 🌐 Services Running:
echo    • Frontend: http://localhost:8080/ZENVORA_REVOLUTION.html
echo    • Backend API: http://localhost:8081
echo    • Health Check: http://localhost:8081/health
echo.
echo 🎉 Zenvora AI Platform is now running!
echo    Note: This is a simplified deployment for testing.
echo    For full production, install Docker and Node.js.
echo.

pause
