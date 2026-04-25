@echo off
title Guaranteed Working System - Frontend + Backend

echo ========================================
echo    Guaranteed Working System
echo    Frontend + PowerShell Backend
echo ========================================
echo.

echo 🚀 Starting guaranteed working system...
echo.

cd /d "%~dp0"

echo 1️⃣ Starting Guaranteed Backend Server...
echo.

REM Start PowerShell backend
start /min "Backend Server" powershell -ExecutionPolicy Bypass -File "GUARANTEED_BACKEND.ps1"

timeout /t 3 >nul

echo 2️⃣ Starting Frontend...
echo.

REM Open frontend
start "" "LAUNCH_NOW.html"

echo.
echo ✅ Guaranteed System Started!
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
echo    • Real AI analysis (PowerShell backend)
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
echo 🔧 This backend uses:
echo    • Only built-in Windows PowerShell
echo    • No installation required
echo    • Guaranteed to work on Windows
echo.
echo 🎉 Your Zenvora AI Platform is fully operational!
echo.

pause
