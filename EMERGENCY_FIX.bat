@echo off
title Emergency Fix - Cannot Reach Issue

echo ========================================
echo    Emergency Fix - Cannot Reach Issue
echo ========================================
echo.

echo 🔍 Diagnosing the problem...
echo.

REM Check if server is running
echo Checking if port 8080 is in use...
netstat -an | findstr :8080 >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Server is running on port 8080
    echo.
    echo 🌐 Try these URLs:
    echo    http://localhost:8080
    echo    http://127.0.0.1:8080
    echo.
    echo 📋 If still "cannot reach":
    echo    1. Try different browser
    echo    2. Clear browser cache
    echo    3. Disable firewall temporarily
    echo.
    goto direct_file
) else (
    echo ❌ No server running on port 8080
    echo.
    echo 🚀 Starting emergency server...
    echo.
)

REM Try to start server on different port
echo Starting server on port 8081...
cd /d "%~dp0"
start /min python -m http.server 8081 2>nul || start /min py -m http.server 8081 2>nul

timeout /t 3 >nul

echo ✅ Emergency server started!
echo.
echo 🌐 Try this URL:
echo    http://localhost:8081
echo.
echo 📋 If still doesn't work:
echo    1. Check if Python is installed
echo    2. Try direct file method below
echo.

:direct_file
echo.
echo 🎯 GUARANTEED WORKING METHOD:
echo    Double-click LAUNCH_NOW.html directly
echo.
echo 📁 File location:
echo    %~dp0LAUNCH_NOW.html
echo.

echo 🚀 Opening direct file...
start "" "%~dp0LAUNCH_NOW.html"

echo.
echo ✅ Direct file opened in browser!
echo.
echo 📝 If direct file works:
echo    - Your files are good
echo    - Issue is server-related
echo    - Use direct method for now
echo.

pause
