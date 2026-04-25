#!/usr/bin/env python3
"""
Simple web server to serve the Zenvora AI Platform
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Set the port
PORT = 8080

# Change to the correct directory
script_dir = Path(__file__).parent
os.chdir(script_dir)

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
            print(f"🚀 Zenvora AI Platform Server Started!")
            print(f"📡 Server running at: http://localhost:{PORT}")
            print(f"🏠 Open your browser and go to: http://localhost:{PORT}/START_HERE.html")
            print(f"🛑 Press Ctrl+C to stop the server")
            print()
            
            # Try to open the browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}/START_HERE.html')
                print("🌐 Browser opened automatically!")
            except:
                print("📝 Could not open browser automatically. Please open the URL manually.")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        print("💡 Make sure port 8080 is not in use")
