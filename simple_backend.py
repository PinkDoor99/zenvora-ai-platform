#!/usr/bin/env python3
"""
Simple Backend Server for Zenvora AI Platform
Provides basic API endpoints when Node.js/Docker are not available
"""

import json
import time
import random
import hashlib
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading

class SimpleBackendHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

    def do_GET(self):
        """Handle GET requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # CORS headers
        self.send_cors_headers()
        
        if path == '/health':
            self.send_response(200)
            self.end_headers()
            response = {
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '1.0.0-simple',
                'uptime': '5m',
                'memory': {'used': '256MB', 'total': '512MB'},
                'database': 'connected',
                'redis': 'connected'
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif path == '/api/health':
            self.send_response(200)
            self.end_headers()
            response = {
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '1.0.0-simple',
                'uptime': '5m',
                'memory': {'used': '256MB', 'total': '512MB'},
                'database': 'connected',
                'redis': 'connected'
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif path == '/api/projects':
            self.send_response(200)
            self.end_headers()
            projects = [
                {
                    'id': 'proj_1',
                    'name': 'My First Project',
                    'description': 'Learning JavaScript basics',
                    'language': 'javascript',
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat(),
                    'status': 'active'
                },
                {
                    'id': 'proj_2', 
                    'name': 'Python Calculator',
                    'description': 'Simple calculator application',
                    'language': 'python',
                    'createdAt': datetime.now().isoformat(),
                    'updatedAt': datetime.now().isoformat(),
                    'status': 'active'
                }
            ]
            self.wfile.write(json.dumps(projects).encode())
            
        elif path.startswith('/api/analyze'):
            self.send_response(200)
            self.end_headers()
            analysis = {
                'id': 'analysis_' + str(int(time.time())),
                'metrics': {
                    'cyclomatic_complexity': random.randint(1, 10),
                    'maintainability': random.randint(60, 95),
                    'security_score': random.randint(70, 100),
                    'performance': random.randint(75, 95),
                    'technical_debt': random.randint(0, 30)
                },
                'suggestions': [
                    'Consider extracting this function for better readability',
                    'Add error handling for edge cases',
                    'Use more descriptive variable names'
                ],
                'issues': [
                    {
                        'type': 'warning',
                        'line': 15,
                        'message': 'Potential null reference'
                    }
                ],
                'insights': [
                    'Code complexity is moderate',
                    'Good use of modern JavaScript features',
                    'Consider adding unit tests'
                ],
                'recommendations': [
                    'Add input validation',
                    'Implement error boundaries',
                    'Consider using TypeScript for better type safety'
                ],
                'createdAt': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(analysis).encode())
            
        elif path == '/api/tools/generate-code':
            self.send_response(200)
            self.end_headers()
            generated_code = {
                'id': 'gen_' + str(int(time.time())),
                'code': '''// Generated function
function calculateTotal(items) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Usage example
const cart = [
    { name: 'Book', price: 20, quantity: 2 },
    { name: 'Pen', price: 2, quantity: 5 }
];

console.log('Total:', calculateTotal(cart));''',
                'language': 'javascript',
                'description': 'Function to calculate total price of items in cart',
                'createdAt': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(generated_code).encode())
            
        elif path == '/api/tools/security-scan':
            self.send_response(200)
            self.end_headers()
            security_report = {
                'id': 'sec_' + str(int(time.time())),
                'score': random.randint(70, 95),
                'vulnerabilities': [
                    {
                        'severity': 'medium',
                        'type': 'XSS',
                        'line': 23,
                        'description': 'Potential XSS vulnerability',
                        'fix': 'Sanitize user input before rendering'
                    }
                ],
                'recommendations': [
                    'Implement input sanitization',
                    'Use parameterized queries',
                    'Add CSRF protection'
                ],
                'createdAt': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(security_report).encode())
            
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')

    def do_POST(self):
        """Handle POST requests"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        # CORS headers
        self.send_cors_headers()
        
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        if path == '/api/auth/login':
            self.send_response(200)
            self.end_headers()
            response = {
                'success': True,
                'user': {
                    'id': 'user_123',
                    'username': 'demo_user',
                    'name': 'Demo User',
                    'email': 'demo@zenvora.com',
                    'avatar': '👤'
                },
                'token': 'demo_token_' + hashlib.md5(str(time.time()).encode()).hexdigest(),
                'expiresAt': (datetime.now() + timedelta(hours=24)).isoformat()
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif path == '/api/auth/register':
            self.send_response(200)
            self.end_headers()
            response = {
                'success': True,
                'user': {
                    'id': 'user_' + str(int(time.time())),
                    'username': 'new_user',
                    'name': 'New User',
                    'email': 'new@zenvora.com',
                    'avatar': '👤'
                },
                'token': 'new_token_' + hashlib.md5(str(time.time()).encode()).hexdigest(),
                'expiresAt': (datetime.now() + timedelta(hours=24)).isoformat()
            }
            self.wfile.write(json.dumps(response).encode())
            
        elif path == '/api/projects':
            self.send_response(200)
            self.end_headers()
            project = {
                'id': 'proj_' + str(int(time.time())),
                'name': 'New Project',
                'description': 'Created via API',
                'language': 'javascript',
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat(),
                'status': 'active'
            }
            self.wfile.write(json.dumps(project).encode())
            
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error": "Endpoint not found"}')

    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS"""
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_cors_headers(self):
        """Send CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')

def run_simple_backend():
    """Run the simple backend server"""
    server_address = ('', 8081)
    httpd = HTTPServer(server_address, SimpleBackendHandler)
    print("🚀 Simple Backend Server Started!")
    print("📡 API Server: http://localhost:8081")
    print("🏥 Health Check: http://localhost:8081/health")
    print("🔧 Available endpoints:")
    print("   • GET  /api/health")
    print("   • GET  /api/projects")
    print("   • GET  /api/analyze")
    print("   • GET  /api/tools/generate-code")
    print("   • GET  /api/tools/security-scan")
    print("   • POST /api/auth/login")
    print("   • POST /api/auth/register")
    print("   • POST /api/projects")
    print()
    print("🎯 Simple backend is ready for Zenvora AI Platform!")
    print("   Note: This provides simulated responses for testing.")
    print()
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Simple backend server stopped")
        httpd.server_close()

if __name__ == '__main__':
    run_simple_backend()
