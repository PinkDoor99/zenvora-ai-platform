@echo off
title Zenvora AI Platform - Direct Access

echo ========================================
echo    🚀 ZENVORA AI PLATFORM - DIRECT ACCESS 🚀
echo    No Server Required
echo ========================================
echo.

echo 🔧 Opening Zenvora AI Platform directly...
echo.

cd /d "%~dp0"

if exist "ZENVORA_REVOLUTION.html" (
    echo ✅ Found ZENVORA_REVOLUTION.html
    echo.
    echo 🌐 Opening in browser...
    echo.
    
    REM Open the HTML file directly
    start "" "ZENVORA_REVOLUTION.html"
    
    echo.
    echo 🎉 ZENVORA AI PLATFORM OPENED!
    echo.
    echo 📋 Features Available:
    echo    • Complete User Interface
    echo    • AI Coding Lessons (Beginner to Expert)
    echo    • Interactive Code Editor
    echo    • Professional Dark Theme
    echo    • Navigation and Settings
    echo.
    echo ⚠️  Note: Some backend features are simulated
    echo    since no server is running, but the UI is fully functional.
    echo.
    echo 🎯 You can now explore the complete Zenvora AI Platform!
    echo.
    
) else (
    echo ❌ ZENVORA_REVOLUTION.html not found!
    echo.
    echo 📁 Please make sure you're in the correct directory.
    echo.
)

pause
