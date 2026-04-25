const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    let filePath = path.join(__dirname, req.url === '/' ? 'LAUNCH_NOW.html' : req.url);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log('🚀 Zenvora AI Platform Server Started!');
    console.log(`📡 Server running at: http://localhost:${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
    console.log('🛑 Press Ctrl+C to stop the server');
    console.log('');
    console.log('Available pages:');
    console.log(`  • Main Launch: http://localhost:${PORT}/`);
    console.log(`  • Enhanced Editor: http://localhost:${PORT}/app_enhanced.html`);
    console.log(`  • AI Tools: http://localhost:${PORT}/ai_tools.html`);
    console.log(`  • Original App: http://localhost:${PORT}/app.html`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server stopped by user');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Server terminated');
    process.exit(0);
});
