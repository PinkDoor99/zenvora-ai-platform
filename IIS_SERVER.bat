@echo off
title IIS Express Server for Zenvora AI Platform

echo ========================================
echo    IIS Express Web Server
echo ========================================
echo.

REM Check if IIS Express is available
where iisexpress >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ IIS Express found! Starting server...
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
    iisexpress /port:8080 /path:"%cd%"
    
) else (
    echo ❌ IIS Express not found
    echo.
    echo 📥 Installing IIS Express...
    echo.
    echo Download from: https://www.microsoft.com/en-us/download/details.aspx?id=48264
    echo.
    echo 🔄 Alternative methods:
    echo    1. Use PowerShell server (web_server.vbs)
    echo    2. Use Python server (START_WEBSITE.bat)
    echo    3. Use direct file (LAUNCH_NOW.html)
    echo.
    
    REM Try PowerShell server as backup
    echo 🚀 Trying PowerShell server...
    echo.
    powershell -Command "& { $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8080/'); $listener.Start(); Write-Host 'Server started at http://localhost:8080 - Press Ctrl+C to stop'; while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $response.ContentType = 'text/html'; $filePath = '.\LAUNCH_NOW.html'; if (Test-Path $filePath) { $content = Get-Content $filePath -Raw; $response.StatusCode = 200; } else { $content = '<h1>Zenvora AI Platform</h1><p>File not found</p>'; $response.StatusCode = 404; } $buffer = [System.Text.Encoding]::UTF8.GetBytes($content); $response.ContentLength64 = $buffer.Length; $response.OutputStream.Write($buffer, 0, $buffer.Length); $response.Close(); Write-Host 'Request served'; } $listener.Stop(); }"
)

echo.
echo If server started successfully, visit: http://localhost:8080
echo If not, double-click LAUNCH_NOW.html directly
pause
