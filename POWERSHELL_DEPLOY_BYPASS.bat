@echo off
title Zenvora AI Platform - PowerShell Deployment

echo ========================================
echo    🚀 ZENVORA AI PLATFORM POWERSHELL DEPLOY 🚀
echo    Bypass Execution Policy
echo ========================================
echo.

echo 🔧 Starting PowerShell Deployment with Bypass...
echo.

cd /d "%~dp0"

echo 1️⃣ Starting PowerShell with execution policy bypass...
echo.

powershell -ExecutionPolicy Bypass -NoProfile -WindowStyle Normal -File POWERSHELL_DEPLOY.ps1

echo.
echo ✅ PowerShell deployment completed!
echo.

pause
