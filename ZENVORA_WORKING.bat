@echo off
title Zenvora AI Platform - Working Deployment

echo ========================================
echo    🚀 ZENVORA AI PLATFORM WORKING DEPLOY 🚀
echo    No Dependencies Required
echo ========================================
echo.

echo 🔧 Starting Working Deployment...
echo.

cd /d "%~dp0"

echo 1️⃣ Creating PowerShell Web Server...
echo.

REM Create a simple PowerShell web server
powershell -Command "& {
    `$listener = New-Object System.Net.HttpListener
    `$listener.Prefixes.Add('http://localhost:8080/')
    `$listener.Start()
    Write-Host '🚀 Zenvora AI Platform Started!' -ForegroundColor Green
    Write-Host '🌐 Open: http://localhost:8080' -ForegroundColor Cyan
    Write-Host ''
    
    while (`$listener.IsListening) {
        try {
            `$context = `$listener.GetContext()
            `$request = `$context.Request
            `$response = `$context.Response
            `$url = `$request.Url.LocalPath
            
            # Serve the main application
            if (`$url -eq '/' -or `$url -eq '') {
                `$filePath = 'ZENVORA_REVOLUTION.html'
            } else {
                `$filePath = `$url.TrimStart('/')
            }
            
            if (Test-Path `$filePath) {
                `$response.StatusCode = 200
                `$content = Get-Content `$filePath -Raw -Encoding UTF8
                `$buffer = [System.Text.Encoding]::UTF8.GetBytes(`$content)
                `$response.ContentLength64 = `$buffer.Length
                `$response.OutputStream.Write(`$buffer, 0, `$buffer.Length)
            } else {
                `$response.StatusCode = 404
                `$buffer = [System.Text.Encoding]::UTF8.GetBytes('404 - Not Found')
                `$response.ContentLength64 = `$buffer.Length
                `$response.OutputStream.Write(`$buffer, 0, `$buffer.Length)
            }
            
            `$response.Close()
        } catch {
            # Continue on errors
        }
    }
}" &

echo 2️⃣ Waiting for server to start...
echo.

timeout /t 3 >nul

echo 3️⃣ Opening Zenvora AI Platform...
echo.

start http://localhost:8080

echo.
echo ✅ ZENVORA AI PLATFORM IS RUNNING!
echo.
echo 🌐 Access URL: http://localhost:8080
echo 🎯 Features Available:
echo    • User Authentication (simulated)
echo    • AI Code Analysis (simulated)
echo    • Code Generation (simulated)
echo    • Interactive Lessons (fully functional)
echo    • Professional UI (fully functional)
echo.
echo 📝 Note: This is a working deployment without backend dependencies.
echo    All features are simulated for demonstration purposes.
echo.
echo 🛑 To stop: Close this PowerShell window
echo.

pause
