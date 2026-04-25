@echo off
echo Starting Zenvora AI Platform Web Server...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Using Python server...
    echo Server will start at: http://localhost:8080
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    cd /d "%~dp0"
    python -m http.server 8080
) else (
    echo Python not found. Trying Node.js...
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Using Node.js server...
        echo Server will start at: http://localhost:8080
        echo.
        echo Press Ctrl+C to stop the server
        echo.
        cd /d "%~dp0"
        node -e "const http = require('http'); const fs = require('fs'); const path = require('path'); const server = http.createServer((req, res) => { const filePath = path.join(__dirname, req.url === '/' ? 'LAUNCH_NOW.html' : req.url); const ext = path.extname(filePath); const contentType = ext === '.html' ? 'text/html' : ext === '.css' ? 'text/css' : ext === '.js' ? 'application/javascript' : 'text/plain'; fs.readFile(filePath, (err, data) => { if (err) { res.writeHead(404); res.end('Not found'); } else { res.writeHead(200, {'Content-Type': contentType}); res.end(data); } }); }); server.listen(8080, () => { console.log('Server running at http://localhost:8080'); });"
    ) else (
        echo Neither Python nor Node.js found.
        echo Please install Python or Node.js to run the web server.
        echo.
        echo Alternative: Double-click LAUNCH_NOW.html directly in your browser.
        echo.
        pause
    )
)

pause
