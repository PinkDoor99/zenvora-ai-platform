@echo off
title Zenvora AI Platform Web Server

echo ========================================
echo    Zenvora AI Platform Web Server
echo ========================================
echo.

REM Try Python first
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python found! Starting web server...
    echo.
    echo 🌐 Your website will be available at:
    echo    http://localhost:8080
    echo.
    echo 📋 Quick Links:
    echo    • Main Page: http://localhost:8080/LAUNCH_NOW.html
    echo    • AI Editor: http://localhost:8080/app_enhanced.html
    echo    • AI Tools:  http://localhost:8080/ai_tools.html
    echo.
    echo 🛑 Press Ctrl+C to stop the server
    echo ========================================
    echo.
    cd /d "%~dp0"
    python -m http.server 8080 --bind 0.0.0.0
    goto end
)

REM Try Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js found! Starting web server...
    echo.
    echo 🌐 Your website will be available at:
    echo    http://localhost:8080
    echo.
    echo 📋 Quick Links:
    echo    • Main Page: http://localhost:8080/LAUNCH_NOW.html
    echo    • AI Editor: http://localhost:8080/app_enhanced.html
    echo    • AI Tools:  http://localhost:8080/ai_tools.html
    echo.
    echo 🛑 Press Ctrl+C to stop the server
    echo ========================================
    echo.
    cd /d "%~dp0"
    node server.js
    goto end
)

REM No runtime found
echo ❌ No web server runtime found!
echo.
echo Please install one of the following:
echo   • Python 3 (recommended)
echo   • Node.js
echo.
echo 📱 Alternative: Open LAUNCH_NOW.html directly in your browser
echo    File location: %~dp0LAUNCH_NOW.html
echo.

:end
pause
