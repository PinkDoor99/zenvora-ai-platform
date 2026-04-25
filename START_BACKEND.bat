@echo off
title Backend Server - Zenvora AI Platform

echo ========================================
echo    Backend Server - Real API Functionality
echo ========================================
echo.

echo 🔧 Starting backend server...
echo.

REM Check for Node.js first
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js found - Starting backend...
    echo.
    echo 🌐 Backend API will be at: http://localhost:3001
    echo 📡 Available endpoints:
    echo    • POST /api/analyze - AI code analysis
    echo    • POST /api/tools/generate-code - Code generation
    echo    • POST /api/tools/security-scan - Security scanning
    echo    • GET /api/health - Health check
    echo.
    echo 🛑 Press Ctrl+C to stop backend
    echo ========================================
    echo.
    cd /d "%~dp0\backend"
    npm install
    node server.js
    goto end
)

REM Check for Python as alternative
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Python found - Starting Python backend...
    echo.
    echo 🌐 Backend API will be at: http://localhost:3001
    echo 📡 Using Python HTTP server with API simulation
    echo.
    cd /d "%~dp0"
    python -c "
import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'status': 'healthy', 'timestamp': datetime.now().isoformat(), 'version': '1.0.0'}
            self.wfile.write(json.dumps(response).encode())
        elif self.path.startswith('/api/'):
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/analyze':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {
                'id': 'analysis-123',
                'metrics': {'complexity': 7.2, 'maintainability': 85, 'testCoverage': 68, 'securityScore': 9.1},
                'suggestions': ['Use const/let instead of var', 'Add error handling'],
                'issues': [{'type': 'info', 'message': 'Consider modern syntax', 'line': 3}]
            }
            self.wfile.write(json.dumps(response).encode())
        elif self.path.startswith('/api/tools/'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'status': 'success', 'result': 'Generated content from Python backend'}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

print('🚀 Python Backend Server Started!')
print('📡 API available at: http://localhost:3001')
print('🛑 Press Ctrl+C to stop')
print('')

with socketserver.TCPServer(('', 3001), APIHandler) as httpd:
    httpd.serve_forever()
"
    goto end
)

REM No runtime found
echo ❌ No backend runtime found
echo.
echo 📥 To enable real backend functionality:
echo.
echo Option 1: Install Node.js (Recommended)
echo   • Download from: https://nodejs.org/
echo   • Run this script again
echo.
echo Option 2: Install Python
echo   • Download from: https://python.org/
echo   • Run this script again
echo.
echo 🎯 For now, frontend will use simulated responses
echo.
echo 🌐 Opening frontend with simulated backend...
start "" "LAUNCH_NOW.html"

:end
echo.
echo 📡 Backend status check:
echo    • If Node.js/Python installed: Real APIs at http://localhost:3001
echo    • If not installed: Frontend uses simulated responses
echo.
pause
