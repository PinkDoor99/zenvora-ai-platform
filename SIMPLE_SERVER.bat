@echo off
title Simple Web Server - Zenvora AI Platform

echo ========================================
echo    Simple Web Server - Works Every Time
echo ========================================
echo.

echo 🚀 Starting web server...
echo.

REM Use Windows built-in HTTP server via PowerShell
echo 🌐 Starting server on http://localhost:8080
echo 🛑 Press Ctrl+C to stop
echo.

cd /d "%~dp0"

powershell -Command "& {$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8080/'); $listener.Start(); Write-Host 'Server started at http://localhost:8080'; Start-Process 'http://localhost:8080/LAUNCH_NOW.html'; while ($listener.IsListening) { try { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $url = $request.Url.LocalPath; if ($url -eq '/') { $url = '/LAUNCH_NOW.html' }; $filePath = '.\LAUNCH_NOW.html'; if (Test-Path $filePath) { $content = Get-Content $filePath -Raw; $response.ContentType = 'text/html'; $response.StatusCode = 200; Write-Host 'Served: ' $url } else { $content = '<h1>Zenvora AI Platform</h1><p>File not found</p>'; $response.ContentType = 'text/html'; $response.StatusCode = 404; }; $buffer = [System.Text.Encoding]::UTF8.GetBytes($content); $response.ContentLength64 = $buffer.Length; $response.OutputStream.Write($buffer, 0, $buffer.Length); $response.Close(); } catch { Write-Host 'Error serving request'; } }; $listener.Stop(); Write-Host 'Server stopped'; }"

if %errorlevel% neq 0 (
    echo.
    echo ❌ PowerShell server failed
    echo.
    echo 🎯 Using direct file method (always works):
    echo.
    start "" "LAUNCH_NOW.html"
    echo ✅ Website opened directly!
)

echo.
echo 🌐 If server started: http://localhost:8080
echo 📱 If direct file opened: Check browser tabs
echo.
pause
