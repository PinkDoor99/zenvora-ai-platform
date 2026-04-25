@echo off
echo Creating GitHub repository...
echo.

REM Create repository using GitHub CLI (if available)
gh repo create zenvora-ai-platform --public --description "Zenvora AI Integration Platform - Advanced GitHub-based AI code analysis and integration platform" --source=. --push

if %errorlevel% neq 0 (
    echo GitHub CLI not available or failed. Please create repository manually:
    echo.
    echo 1. Go to https://github.com/new
    echo 2. Repository name: zenvora-ai-platform
    echo 3. Description: Zenvora AI Integration Platform
    echo 4. Make it Public
    echo 5. Click "Create repository"
    echo.
    echo Then run these commands:
    echo git remote add origin https://github.com/ott/zenvora-ai-platform.git
    echo git branch -M main
    echo git push -u origin main
)

pause
