@echo off
title 🚀 Zenvora AI Platform - Local Deployment
color 0A
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║          🚀 LOCAL DEPLOYMENT - SHARE YOUR PLATFORM 🚀           ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo  Choose deployment method:
echo.
echo  1. Python Simple Server (Fastest)
echo  2. Node.js HTTP Server (Professional)
echo  3. PHP Built-in Server (If PHP installed)
echo  4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto python
if "%choice%"=="2" goto nodejs
if "%choice%"=="3" goto php
if "%choice%"=="4" goto end
goto invalid

:python
echo.
echo  🐍 Starting Python Simple Server...
echo  ----------------------------------------
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ Python not found. Please install Python from python.org
    pause
    goto end
)

echo  ✅ Python detected
echo  🌐 Starting server on http://localhost:8000
echo  📂 Serving directory: %CD%
echo.
echo  Your platform will be available at: http://localhost:8000/ZENVORA_WINDSURF.html
echo.
echo  Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
python -m http.server 8000
goto end

:nodejs
echo.
echo  📦 Starting Node.js HTTP Server...
echo  ----------------------------------------
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ Node.js not found. Please install Node.js from nodejs.org
    pause
    goto end
)

echo  ✅ Node.js detected
echo  🌐 Starting server on http://localhost:3000
echo  📂 Serving directory: %CD%
echo.
echo  Your platform will be available at: http://localhost:3000/ZENVORA_WINDSURF.html
echo.
echo  Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
npx http-server -p 3000 -o
goto end

:php
echo.
echo  🐘 Starting PHP Built-in Server...
echo  ----------------------------------------
php --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ PHP not found. Please install PHP from php.net
    pause
    goto end
)

echo  ✅ PHP detected
echo  🌐 Starting server on http://localhost:8000
echo  📂 Serving directory: %CD%
echo.
echo  Your platform will be available at: http://localhost:8000/ZENVORA_WINDSURF.html
echo.
echo  Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"
php -S localhost:8000
goto end

:invalid
echo.
echo  ❌ Invalid choice. Please enter 1-4.
pause
goto end

:end
echo.
echo  Server stopped. Press any key to exit...
pause >nul
