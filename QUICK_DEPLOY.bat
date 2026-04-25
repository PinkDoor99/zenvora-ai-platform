@echo off
title Zenvora AI Platform - Quick Deploy

echo ========================================
echo    🚀 ZENVORA AI PLATFORM QUICK DEPLOY 🚀
echo    Fast Production Deployment
echo ========================================
echo.

cd /d "%~dp0"

echo 🚀 Quick Deploy - Starting Production Services...
echo.

REM Quick environment setup
if not exist ".env" (
    echo Creating quick .env file...
    echo NODE_ENV=production > .env
    echo PORT=3001 >> .env
    echo DB_HOST=postgres >> .env
    echo DB_PASSWORD=zenvora123 >> .env
    echo REDIS_PASSWORD=redis123 >> .env
    echo JWT_SECRET=quick_jwt_secret_2024 >> .env
    echo SESSION_SECRET=quick_session_secret_2024 >> .env
    echo CORS_ORIGIN=http://localhost >> .env
    echo GRAFANA_PASSWORD=admin123 >> .env
)

echo 🐳 Building and starting containers...
echo.

docker-compose -f docker-compose.prod.yml up -d --build

echo ⏳ Waiting for services to start...
timeout /t 45 >nul

echo 🏥 Checking service health...
echo.

REM Quick health checks
curl -f http://localhost:3001/api/health >nul 2>&1 && (
    echo ✅ Main App: HEALTHY
) || (
    echo ❌ Main App: FAILED
)

curl -f http://localhost:3003 >nul 2>&1 && (
    echo ✅ Collaboration: HEALTHY
) || (
    echo ❌ Collaboration: FAILED
)

echo.
echo 🌐 Opening Services...
echo.

start http://localhost:3001
start http://localhost:3000
start http://localhost:9090

echo.
echo 🎉 QUICK DEPLOY COMPLETE!
echo.
echo 📊 Services Running:
echo    • Main App: http://localhost:3001
echo    • Grafana: http://localhost:3000 (admin/admin123)
echo    • Prometheus: http://localhost:9090
echo.
echo 📝 Logs: docker-compose logs -f
echo 🛑 Stop: docker-compose -f docker-compose.prod.yml down
echo.

pause
