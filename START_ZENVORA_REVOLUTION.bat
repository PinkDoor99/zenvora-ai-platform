@echo off
title Zenvora AI Platform - Complete Revolution

echo ========================================
echo    🚀 ZENVORA AI PLATFORM REVOLUTION 🚀
echo    Complete System with Real Database
echo ========================================
echo.

echo 🔧 Starting Complete System...
echo.

cd /d "%~dp0"

REM Start enhanced backend with database
echo 1️⃣ Starting Enhanced Backend with Database...
echo.
start /min "Backend Server" cmd /c "node database_setup.js"

timeout /t 3 >nul

REM Start revolutionary frontend
echo 2️⃣ Starting Revolutionary Frontend...
echo.
start "" "ZENVORA_REVOLUTION.html"

echo.
echo ✅ ZENVORA AI PLATFORM REVOLUTION STARTED!
echo.
echo 🎯 COMPLETE SYSTEM FEATURES:
echo    • User Authentication & Profiles
echo    • Real SQLite Database Storage
echo    • Advanced AI Analysis with OWASP Security
echo    • Revolutionary Unified Interface
echo    • AI-Powered Coding Tutorials
echo    • Professional Dark Theme Design
echo    • Real-time Collaboration Features
echo    • Performance Metrics & Technical Debt
echo    • Enhanced Code Generation
echo.
echo 🌐 System Status:
echo    • Backend: Running on http://localhost:3001
echo    • Frontend: Opening in browser
echo    • Database: SQLite with persistent storage
echo.
echo 🎉 YOUR REVOLUTION IS NOW LIVE!
echo.

pause
