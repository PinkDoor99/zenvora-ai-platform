@echo off
title Download and Install Node.js

echo ========================================
echo    📥 DOWNLOAD AND INSTALL NODE.JS 📥
echo    For Zenvora AI Platform
echo ========================================
echo.

echo 🔍 Checking if Node.js is already installed...
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
    echo 🚀 Ready to deploy Zenvora AI Platform!
    echo.
    pause
    exit /b 0
)

echo ❌ Node.js not found. Downloading installer...
echo.

echo 📥 Downloading Node.js LTS version...
echo.

REM Download Node.js LTS using PowerShell
powershell -Command "& { 
    $url = 'https://nodejs.org/dist/v18.19.0/node-v18.19.0-x64.msi'
    $output = 'nodejs-installer.msi'
    Write-Host 'Downloading Node.js from: $url'
    Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing
    Write-Host 'Download completed: $output'
}"

if %errorlevel% neq 0 (
    echo ❌ Download failed!
    echo.
    echo 🌐 Please download Node.js manually:
    echo    https://nodejs.org/en/download/
    echo.
    echo 📋 After installation, run this script again to verify.
    pause
    exit /b 1
)

echo ✅ Download completed!
echo.

echo 🔧 Starting Node.js installation...
echo.
echo ⚠️  Please accept the UAC prompt and follow the installation wizard.
echo    Make sure to check "Add to PATH" during installation.
echo.

REM Run the installer
start /wait nodejs-installer.msi

echo.
echo 🔍 Verifying Node.js installation...
echo.

node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js installed successfully!
    echo.
    echo 🐍 Node.js version:
    node --version
    echo.
    echo 📦 npm version:
    npm --version
    echo.
    echo 🎉 Installation complete!
    echo.
    echo 📋 Next steps:
    echo    1. Close this window
    echo    2. Run START_DEPLOYMENT.bat for full deployment
    echo    3. Or run QUICK_DEPLOY.bat for quick testing
    echo.
) else (
    echo ❌ Node.js installation failed!
    echo.
    echo 🔄 Please try:
    echo    1. Restart your computer
    echo    2. Run this script again
    echo    3. Or install manually from https://nodejs.org/
    echo.
)

REM Clean up
if exist nodejs-installer.msi del nodejs-installer.msi

pause
