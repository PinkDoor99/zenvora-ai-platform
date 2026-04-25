@echo off
title Python Setup for Zenvora AI Platform

echo ========================================
echo    Python Setup for Web Server
echo ========================================
echo.

REM Check if Python is already installed
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python is already installed!
    echo.
    echo 🐍 Python version:
    python --version
    echo.
    echo 🌐 You can now start your web server:
    echo    1. Double-click START_WEBSITE.bat
    echo    2. Or run: python -m http.server 8080
    echo.
    goto test_server
)

REM Check for py launcher
py --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python launcher found!
    echo.
    echo 🐍 Python version:
    py --version
    echo.
    echo 🌐 You can now start your web server:
    echo    1. Double-click START_WEBSITE.bat
    echo    2. Or run: py -m http.server 8080
    echo.
    goto test_server
)

echo ❌ Python not found on your system
echo.
echo 📥 Please install Python:
echo.
echo Option 1: Microsoft Store (Easiest)
echo   - Click Start button
echo   - Type "Python" 
echo   - Click "Python 3.x" from Microsoft Store
echo   - Click "Install"
echo.
echo Option 2: Official Download (Recommended)
echo   - Go to: https://python.org/downloads/
echo   - Download Python 3.x
echo   - Run installer
echo   - ⚠️  IMPORTANT: Check "Add Python to PATH"
echo.
echo After installing Python:
echo   1. Restart your computer
echo   2. Run this script again
echo   3. Double-click START_WEBSITE.bat
echo.
goto end

:test_server
echo 🧪 Testing Python web server...
echo.
echo Starting server on port 8080...
echo 🌐 Visit: http://localhost:8080
echo 🛑 Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

cd /d "%~dp0"

REM Try python first, then py
python -m http.server 8080 2>nul || py -m http.server 8080

:end
echo.
echo Press any key to exit...
pause >nul
