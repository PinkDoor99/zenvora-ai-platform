@echo off
title Universal Web Server - Zenvora AI Platform

echo ========================================
echo    Universal Web Server Launcher
echo ========================================
echo.

echo 🔍 Checking available server options...
echo.

REM Method 1: PowerShell (Built into Windows)
echo Method 1: PowerShell Server
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ PowerShell available - Starting server...
    echo.
    echo 🌐 Server will be at: http://localhost:8080
    echo 🛑 Press Ctrl+C to stop
    echo.
    cd /d "%~dp0"
    powershell -ExecutionPolicy Bypass -File "POWERSHELL_SERVER.ps1"
    goto end
)

REM Method 2: IIS Express
echo Method 2: IIS Express
where iisexpress >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ IIS Express available - Starting server...
    echo.
    cd /d "%~dp0"
    call "IIS_SERVER.bat"
    goto end
)

REM Method 3: Python
echo Method 3: Python Server
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python available - Starting server...
    echo.
    cd /d "%~dp0"
    python -m http.server 8080
    goto end
)

REM Method 4: VBScript Server
echo Method 4: VBScript Server
echo ✅ Creating VBScript server...
echo.
cscript //nologo "web_server.vbs"
goto end

REM Fallback: Direct file
echo ❌ No server runtime found
echo.
echo 🎯 Using direct file method (always works):
echo.
start "" "LAUNCH_NOW.html"
echo ✅ Website opened directly in browser!
echo.
echo 📝 To get web server URLs:
echo    1. Install PowerShell (built into Windows)
echo    2. Install Python from python.org
echo    3. Install IIS Express
echo.

:end
echo.
echo 🌐 If server started, visit: http://localhost:8080
echo 📱 If direct file opened, use browser tabs
echo.
pause
