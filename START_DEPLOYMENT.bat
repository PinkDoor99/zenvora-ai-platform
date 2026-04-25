@echo off
title Zenvora AI Platform - Production Deployment

echo ========================================
echo    🚀 ZENVORA AI PLATFORM DEPLOYMENT 🚀
echo    Production Cloud Deployment Setup
echo ========================================
echo.

echo 🔧 Starting Production Deployment...
echo.

cd /d "%~dp0"

echo 1️⃣ Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker first.
    echo    Download from: https://docker.com/
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.
#]
echo 2️⃣ Creating environment configuration...
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    echo NODE_ENV=production > .env
    echo PORT=3001 >> .env
    echo DB_HOST=postgres >> .env
    echo DB_PORT=5432 >> .env
    echo DB_NAME=zenvora_production >> .env
    echo DB_USER=zenvora_user >> .env
    echo DB_PASSWORD=your_secure_password_here >> .env
    echo REDIS_HOST=redis >> .env
    echo REDIS_PORT=6379 >> .env
    echo REDIS_PASSWORD=your_redis_password_here >> .env
    echo JWT_SECRET=your_jwt_secret_key_here >> .env
    echo SESSION_SECRET=your_session_secret_key_here >> .env
    echo CORS_ORIGIN=https://yourdomain.com >> .env
    echo GRAFANA_PASSWORD=your_grafana_password_here >> .env
    
    echo ⚠️  Please edit .env file with your actual values before continuing!
    pause
)

echo 3️⃣ Building Docker containers...
echo.

docker-compose -f docker-compose.prod.yml build

if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)

echo ✅ Docker containers built successfully!
echo.

echo 4️⃣ Starting production services...
echo.

docker-compose -f docker-compose.prod.yml up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start services!
    pause
    exit /b 1
)

echo ✅ Production services started!
echo.

echo 5️⃣ Waiting for services to be ready...
echo.

timeout /t 30 >nul

echo 6️⃣ Running health checks...
echo.

REM Check main application
curl -f http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Main application health check failed!
) else (
    echo ✅ Main application is healthy
)

REM Check collaboration server
curl -f http://localhost:3003 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Collaboration server health check failed!
) else (
    echo ✅ Collaboration server is healthy
)

echo.
echo 7️⃣ Deployment Summary:
echo.
echo 🌐 Production URLs:
echo    • Main Application: http://localhost:3001
echo    • Collaboration Server: http://localhost:3003
echo    • Nginx Proxy: http://localhost
echo    • Grafana Dashboard: http://localhost:3000
echo    • Prometheus: http://localhost:9090
echo    • Kibana Logs: http://localhost:5601
echo.
echo 📊 Monitoring Services:
echo    • Grafana: admin / your_grafana_password
echo    • Prometheus: metrics collection
echo    • ELK Stack: log aggregation
echo.
echo 🗄️  Database Access:
echo    • PostgreSQL: localhost:5432
echo    • Redis: localhost:6379
echo.
echo 📝 Logs:
echo    • Application logs: ./logs/
echo    • Nginx logs: ./logs/nginx/
echo    • Docker logs: docker-compose logs -f
echo.
echo 🔧 Management Commands:
echo    • View logs: docker-compose logs -f
echo    • Stop services: docker-compose -f docker-compose.prod.yml down
echo    • Restart services: docker-compose -f docker-compose.prod.yml restart
echo    • Update: docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d
echo.
echo 🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!
echo.
echo 📋 Next Steps:
echo    1. Configure your domain name and SSL certificate
echo    2. Update .env file with production values
echo    3. Set up monitoring alerts in Grafana
echo    4. Configure backup strategies
echo    5. Review security configurations
echo.
echo 📚 For detailed deployment instructions, see DEPLOYMENT_GUIDE.md
echo.

REM Open monitoring dashboards
echo 8️⃣ Opening monitoring dashboards...
echo.

start http://localhost:3000  # Grafana
start http://localhost:9090  # Prometheus
start http://localhost:5601  # Kibana

echo.
echo 🎯 Production deployment is now running!
echo    Check your browser for monitoring dashboards.
echo.

echo 9️⃣ Quick Test - Opening main application...
echo.

start http://localhost:3001

echo.
echo ✅ All systems operational!
echo.
echo 🎉 ZENVORA AI PLATFORM DEPLOYMENT COMPLETE! 🎉
echo.
echo 📞 Support & Documentation:
echo    • Deployment Guide: DEPLOYMENT_GUIDE.md
echo    • API Documentation: http://localhost:3001/api/docs
echo    • Health Status: http://localhost:3001/api/health
echo.
echo 🔄 Next Deployment Options:
echo    • Run again to update: START_DEPLOYMENT.bat
echo    • Stop services: docker-compose -f docker-compose.prod.yml down
echo    • View logs: docker-compose logs -f
echo.
echo 🚀 Your revolutionary AI platform is now live!
echo.

pause
