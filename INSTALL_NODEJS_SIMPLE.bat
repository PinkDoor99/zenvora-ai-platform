@echo off
title Install Node.js for Zenvora AI Platform

echo ========================================
echo    📥 INSTALL NODE.JS FOR ZENVORA AI 📥
echo    Simple Installation Guide
echo ========================================
echo.

echo 🔍 Checking Node.js installation...
echo.

node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js is already installed!
    echo.
    echo 🐍 Node.js version:
    node --version
    echo.
    echo 📦 npm version:
    npm --version
    echo.
    echo 🚀 Ready for full deployment!
    echo.
    echo 📋 Next steps:
    echo    1. Run START_DEPLOYMENT.bat for production deployment
    echo    2. Run QUICK_DEPLOY.bat for quick testing
    echo.
    pause
    exit /b 0
)

echo ❌ Node.js not found on your system
echo.
echo 📥 Opening Node.js download page...
echo.

REM Open Node.js download page
start https://nodejs.org/en/download/

echo.
echo 📋 INSTALLATION INSTRUCTIONS:
echo.
echo 1️⃣ Download the LTS version (Recommended for Most Users)
echo 2️⃣ Run the installer (.msi file)
echo 3️⃣ IMPORTANT: Check "Add to PATH" option during installation
echo 4️⃣ Complete the installation wizard
echo 5️⃣ Restart this script to verify installation
echo.
echo ⚠️  Make sure to check "Add to PATH" during installation!
echo    This allows running Node.js from command line.
echo.
echo 🔄 After installation:
echo    • Close this window
echo    • Run this script again to verify
echo    • Then run START_DEPLOYMENT.bat
echo.

echo 🌐 Download page opened in your browser
echo    Please download and install Node.js LTS version
echo.

pause
