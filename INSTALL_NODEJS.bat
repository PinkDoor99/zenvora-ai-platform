@echo off
title Node.js Installer for Zenvora AI Platform

echo ========================================
echo    Node.js Installer
echo    For Backend Server Functionality
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
    echo 🚀 Backend server is ready to start!
    echo.
    echo 📋 Next steps:
    echo    1. Double-click FULL_SYSTEM.bat
    echo    2. Backend will start automatically
    echo    3. Frontend will connect to real APIs
    echo.
    goto test_backend
)

echo ❌ Node.js not found on your system
echo.
echo 📥 Installing Node.js...
echo.

REM Check if winget is available
winget --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Using Windows Package Manager (winget)...
    echo.
    echo 📦 Installing Node.js LTS...
    winget install OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
    
    if %errorlevel% == 0 (
        echo ✅ Node.js installed successfully!
        echo.
        echo 🔄 Refreshing environment...
        call refreshenv >nul 2>&1
        goto verify_install
    ) else (
        echo ❌ Winget installation failed
        goto manual_install
    )
)

:manual_install
echo.
echo 🔄 Manual installation required...
echo.
echo 📋 Installation Steps:
echo.
echo 1️⃣ Download Node.js:
echo    🌐 Open: https://nodejs.org/
echo    📥 Click "Download Node.js LTS" (recommended version)
echo.
echo 2️⃣ Run Installer:
echo    💾 Double-click the downloaded .msi file
echo    ✅ Follow installation wizard
echo    ⚠️  IMPORTANT: Leave "Add to PATH" checked
echo.
echo 3️⃣ Verify Installation:
echo    🔄 Restart Command Prompt/PowerShell
echo    🧪 Run: node --version
echo.
echo 4️⃣ Start Backend:
echo    🚀 Double-click FULL_SYSTEM.bat
echo.
echo 🌐 Opening download page...
start "" "https://nodejs.org/"

goto final_instructions

:verify_install
echo.
echo 🧪 Verifying Node.js installation...
echo.

REM Wait a moment for installation to complete
timeout /t 5 >nul

node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js installation verified!
    echo.
    echo 🐍 Node.js version:
    node --version
    echo.
    echo 📦 npm version:
    npm --version
    echo.
    echo 🎉 Installation successful!
    echo.
    goto test_backend
) else (
    echo ❌ Node.js not detected after installation
    echo.
    echo 🔄 Please restart your computer and try again
    echo.
    goto manual_install
)

:test_backend
echo 🧪 Testing backend server...
echo.

cd /d "%~dp0\backend"

REM Install backend dependencies
echo 📦 Installing backend packages...
npm install

if %errorlevel% == 0 (
    echo ✅ Backend dependencies installed!
    echo.
    echo 🚀 Starting backend server test...
    echo.
    echo 📡 Backend will start on: http://localhost:3001
    echo 🛑 Press Ctrl+C to stop test
    echo.
    node server.js
) else (
    echo ❌ Backend dependency installation failed
    echo.
    echo 🔄 Try running manually:
    echo    cd backend
    echo    npm install
    echo    node server.js
)

goto end

:final_instructions
echo.
echo 📋 Final Instructions:
echo.
echo 1️⃣ Install Node.js from https://nodejs.org/
echo 2️⃣ Restart your computer
echo 3️⃣ Run this script again to verify
echo 4️⃣ Double-click FULL_SYSTEM.bat to start everything
echo.
echo 🎯 After installation:
echo    • Real AI analysis APIs
echo    • Code generation tools
echo    • Security scanning
echo    • Performance optimization
echo.

:end
echo.
echo 🎉 Node.js setup complete!
echo.
echo 🚀 Ready to start your backend server!
echo.
pause
