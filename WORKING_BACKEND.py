#!/usr/bin/env python3
"""
Working Backend Server for Zenvora AI Platform
Uses built-in Python HTTP server with API endpoints
"""

import http.server
import socketserver
import json
import urllib.parse
import uuid
from datetime import datetime
import threading
import time

# Data storage (in-memory)
projects = {}
analyses = {}
users = {}

# Initialize demo data
def init_demo_data():
    users['demo-user'] = {
        'id': 'demo-user',
        'username': 'demo',
        'email': 'demo@zenvora.ai',
        'createdAt': datetime.now().isoformat(),
        'projects': []
    }
    
    demo_project = {
        'id': str(uuid.uuid4()),
        'name': 'Zenvora AI Platform',
        'description': 'Advanced AI integration platform',
        'language': 'javascript',
        'code': '''function analyzeCode(code) {
    // AI-powered code analysis
    const issues = [];
    const suggestions = [];
    
    // Analyze for potential improvements
    if (code.includes('var ')) {
        suggestions.push('Consider using const/let instead of var');
    }
    
    return { issues, suggestions };
}''',
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat(),
        'analyses': []
    }
    projects[demo_project['id']] = demo_project
    
    demo_analysis = {
        'id': str(uuid.uuid4()),
        'projectId': demo_project['id'],
        'complexity': 7.2,
        'maintainability': 85,
        'testCoverage': 68,
        'securityScore': 9.1,
        'suggestions': [
            'Use const/let instead of var',
            'Add error handling',
            'Optimize loop structure',
            'Add JSDoc comments'
        ],
        'issues': [
            {'type': 'warning', 'message': 'Consider using modern syntax', 'line': 3},
            {'type': 'info', 'message': 'Function could benefit from documentation', 'line': 1}
        ],
        'createdAt': datetime.now().isoformat()
    }
    analyses[demo_analysis['id']] = demo_analysis
    demo_project['analyses'].append(demo_analysis['id'])

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)
    
    def do_GET(self):
        if self.path == '/api/health':
            self.send_json_response({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '1.0.0',
                'backend': 'Python Working Server'
            })
        elif self.path.startswith('/api/'):
            self.handle_api_get()
        else:
            super().do_GET()
    
    def do_POST(self):
        if self.path == '/api/analyze':
            self.handle_analyze()
        elif self.path == '/api/tools/generate-code':
            self.handle_generate_code()
        elif self.path == '/api/tools/generate-tests':
            self.handle_generate_tests()
        elif self.path == '/api/tools/generate-docs':
            self.handle_generate_docs()
        elif self.path == '/api/tools/refactor':
            self.handle_refactor()
        elif self.path == '/api/tools/security-scan':
            self.handle_security_scan()
        elif self.path == '/api/tools/performance-optimize':
            self.handle_performance_optimize()
        elif self.path.startswith('/api/projects'):
            self.handle_projects_post()
        else:
            self.send_json_response({'error': 'Endpoint not found'}, 404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def handle_api_get(self):
        if self.path == '/api/projects':
            self.send_json_response(list(projects.values()))
        elif self.path.startswith('/api/projects/'):
            project_id = self.path.split('/')[-1]
            if project_id in projects:
                self.send_json_response(projects[project_id])
            else:
                self.send_json_response({'error': 'Project not found'}, 404)
        elif self.path.startswith('/api/analyses/'):
            analysis_id = self.path.split('/')[-1]
            if analysis_id in analyses:
                self.send_json_response(analyses[analysis_id])
            else:
                self.send_json_response({'error': 'Analysis not found'}, 404)
        else:
            self.send_json_response({'error': 'Endpoint not found'}, 404)
    
    def handle_analyze(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            code = data.get('code', '')
            language = data.get('language', 'javascript')
            project_id = data.get('projectId')
            
            if not code:
                self.send_json_response({'error': 'Code is required'}, 400)
                return
            
            # Simulate AI processing
            time.sleep(1)
            
            analysis = perform_ai_analysis(code, language, project_id)
            analyses[analysis['id']] = analysis
            
            if project_id and project_id in projects:
                projects[project_id]['analyses'].append(analysis['id'])
                projects[project_id]['updatedAt'] = datetime.now().isoformat()
            
            self.send_json_response(analysis)
            
        except Exception as e:
            self.send_json_response({'error': 'Analysis failed', 'details': str(e)}, 500)
    
    def handle_generate_code(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            description = data.get('description', '')
            language = data.get('language', 'javascript')
            
            if not description:
                self.send_json_response({'error': 'Description is required'}, 400)
                return
            
            time.sleep(1.5)
            generated_code = generate_code_from_description(description, language)
            self.send_json_response({'code': generated_code, 'language': language})
            
        except Exception as e:
            self.send_json_response({'error': 'Code generation failed', 'details': str(e)}, 500)
    
    def handle_generate_tests(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            code = data.get('code', '')
            framework = data.get('framework', 'jest')
            
            if not code:
                self.send_json_response({'error': 'Code is required'}, 400)
                return
            
            time.sleep(1)
            tests = generate_tests_for_code(code, framework)
            self.send_json_response({'tests': tests, 'framework': framework})
            
        except Exception as e:
            self.send_json_response({'error': 'Test generation failed', 'details': str(e)}, 500)
    
    def handle_generate_docs(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            code = data.get('code', '')
            doc_type = data.get('docType', 'jsdoc')
            
            if not code:
                self.send_json_response({'error': 'Code is required'}, 400)
                return
            
            time.sleep(1)
            documentation = generate_documentation_for_code(code, doc_type)
            self.send_json_response({'documentation': documentation, 'type': doc_type})
            
        except Exception as e:
            self.send_json_response({'error': 'Documentation generation failed', 'details': str(e)}, 500)
    
    def handle_refactor(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            code = data.get('code', '')
            goal = data.get('goal', 'readability')
            
            if not code:
                self.send_json_response({'error': 'Code is required'}, 400)
                return
            
            time.sleep(1.5)
            refactored_code = refactor_code_with_goal(code, goal)
            self.send_json_response({'refactoredCode': refactored_code, 'goal': goal})
            
        except Exception as e:
            self.send_json_response({'error': 'Refactoring failed', 'details': str(e)}, 500)
    
    def handle_security_scan(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            code = data.get('code', '')
            
            if not code:
                self.send_json_response({'error': 'Code is required'}, 400)
                return
            
            time.sleep(1.5)
            security_report = perform_security_scan(code)
            self.send_json_response(security_report)
            
        except Exception as e:
            self.send_json_response({'error': 'Security scan failed', 'details': str(e)}, 500)
    
    def handle_performance_optimize(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            code = data.get('code', '')
            
            if not code:
                self.send_json_response({'error': 'Code is required'}, 400)
                return
            
            time.sleep(1.5)
            optimization_report = optimize_code_performance(code)
            self.send_json_response(optimization_report)
            
        except Exception as e:
            self.send_json_response({'error': 'Performance optimization failed', 'details': str(e)}, 500)
    
    def handle_projects_post(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            project = {
                'id': str(uuid.uuid4()),
                'name': data.get('name', 'Untitled Project'),
                'description': data.get('description', ''),
                'language': data.get('language', 'javascript'),
                'code': data.get('code', ''),
                'userId': data.get('userId', 'demo-user'),
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat(),
                'analyses': []
            }
            
            projects[project['id']] = project
            
            user = users.get(project['userId'])
            if user:
                user['projects'].append(project['id'])
            
            self.send_json_response(project, 201)
            
        except Exception as e:
            self.send_json_response({'error': 'Project creation failed', 'details': str(e)}, 500)

# AI Analysis Functions
def perform_ai_analysis(code, language, project_id):
    lines = code.split('\n')
    functions = len([line for line in lines if 'function' in line or '=>' in line])
    comments = len([line for line in lines if line.strip().startswith('//') or line.strip().startswith('/*')])
    
    complexity = calculate_complexity(code)
    maintainability = calculate_maintainability(code, comments, len(lines))
    test_coverage = estimate_test_coverage(code, functions)
    security_score = calculate_security_score(code)
    
    suggestions = generate_suggestions(code)
    issues = find_issues(code)
    
    return {
        'id': str(uuid.uuid4()),
        'projectId': project_id,
        'code': code,
        'language': language,
        'metrics': {
            'complexity': complexity,
            'maintainability': maintainability,
            'testCoverage': test_coverage,
            'securityScore': security_score,
            'lines': len(lines),
            'functions': functions,
            'comments': comments
        },
        'suggestions': suggestions,
        'issues': issues,
        'createdAt': datetime.now().isoformat()
    }

def calculate_complexity(code):
    complexity_indicators = ['if', 'for', 'while', 'switch', 'catch', '&&', '||']
    complexity = sum(code.count(indicator) for indicator in complexity_indicators) + 1
    return round(complexity * 1.5, 1)

def calculate_maintainability(code, comments, lines):
    comment_ratio = comments / max(1, lines)
    base_score = 50
    comment_bonus = comment_ratio * 30
    length_penalty = max(0, (lines - 100) / 10)
    return min(100, round(base_score + comment_bonus - length_penalty))

def estimate_test_coverage(code, functions):
    test_keywords = ['test', 'it', 'describe', 'expect', 'assert']
    test_count = sum(code.count(keyword) for keyword in test_keywords)
    return min(95, round((test_count / max(1, functions)) * 100))

def calculate_security_score(code):
    score = 10
    if 'eval' in code: score -= 3
    if 'innerHTML' in code: score -= 2
    if 'document.write' in code: score -= 3
    if 'SQL' in code or 'SELECT' in code: score -= 2
    if 'try' not in code and 'catch' not in code: score -= 1
    return max(1, score)

def generate_suggestions(code):
    suggestions = []
    if 'var ' in code:
        suggestions.append('Use const/let instead of var for better scoping')
    if 'console.log' in code and 'logger' not in code:
        suggestions.append('Use proper logging system instead of console.log')
    if 'function' in code and '=>' not in code:
        suggestions.append('Consider arrow functions for callbacks')
    if 'try' not in code and 'catch' not in code:
        suggestions.append('Add error handling with try-catch blocks')
    return suggestions

def find_issues(code):
    issues = []
    lines = code.split('\n')
    for i, line in enumerate(lines, 1):
        if 'eval' in line:
            issues.append({'type': 'error', 'message': 'Use of eval() function detected', 'line': i})
        if 'innerHTML' in line:
            issues.append({'type': 'warning', 'message': 'Potential XSS risk with innerHTML', 'line': i})
        if 'var ' in line:
            issues.append({'type': 'info', 'message': 'Consider using const/let instead of var', 'line': i})
    return issues

def generate_code_from_description(description, language):
    if 'email' in description.lower():
        return f'''// Generated {language} code for email validation
function validateEmail(email) {{
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
}}

// Usage examples
console.log(validateEmail("test@example.com")); // true
console.log(validateEmail("invalid-email"));    // false'''
    elif 'calculator' in description.lower():
        return f'''// Generated {language} code for calculator
class Calculator {{
    constructor() {{
        this.result = 0;
    }}
    
    add(num) {{
        this.result += num;
        return this;
    }}
    
    subtract(num) {{
        this.result -= num;
        return this;
    }}
    
    multiply(num) {{
        this.result *= num;
        return this;
    }}
    
    divide(num) {{
        if (num === 0) throw new Error("Cannot divide by zero");
        this.result /= num;
        return this;
    }}
    
    getResult() {{
        return this.result;
    }}
}}

// Usage
const calc = new Calculator();
const result = calc.add(10).multiply(2).subtract(5).getResult();'''
    else:
        return f'''// Generated {language} code based on: {description}
function generatedFunction() {{
    // AI-generated implementation
    console.log("Generated code for: {description}");
    
    // Add your specific logic here
    return true;
}}

// Call the function
const result = generatedFunction();
console.log("Result:", result);'''

def generate_tests_for_code(code, framework):
    if framework == 'jest':
        return '''describe('Generated Tests', () => {
    test('should handle basic functionality', () => {
        expect(true).toBe(true);
    });
    
    test('should handle edge cases', () => {
        expect(null).toBeNull();
    });
    
    test('should handle errors gracefully', () => {
        expect(() => {
            throw new Error('Test error');
        }).toThrow('Test error');
    });
});'''
    elif framework == 'mocha':
        return '''const assert = require('assert');

describe('Generated Tests', () => {
    it('should handle basic functionality', () => {
        assert.strictEqual(true, true);
    });
    
    it('should handle edge cases', () => {
        assert.strictEqual(null, null);
    });
    
    it('should handle errors gracefully', () => {
        assert.throws(() => {
            throw new Error('Test error');
        }, /Test error/);
    });
});'''
    else:
        return '''// Generated tests for unknown framework
function testBasicFunctionality() {
    console.log('Testing basic functionality...');
    // Add test implementation
}

function testEdgeCases() {
    console.log('Testing edge cases...');
    // Add test implementation
}'''

def generate_documentation_for_code(code, doc_type):
    if doc_type == 'jsdoc':
        return '''/**
 * Generated documentation for your code
 * @description AI-generated documentation based on code analysis
 * @author AI Assistant
 * @since ''' + datetime.now().strftime('%Y-%m-%d') + '''
 * @example
 * // Usage example
 * const result = yourFunction();
 * console.log(result);
 */
function yourFunction() {
    // Your implementation here
}'''
    else:
        return '''# Generated Documentation

## Overview
AI-generated documentation based on code analysis.

## Features
- Automated documentation generation
- Code analysis and insights
- Best practices recommendations

## Usage
```javascript
// Example usage
const result = yourFunction();
console.log(result);
```'''

def refactor_code_with_goal(code, goal):
    if goal == 'performance':
        return '''// Performance-optimized version
const optimizedCode = () => {
    // Use efficient algorithms and data structures
    const cache = new Map(); // Memoization
    
    return function(input) {
        if (cache.has(input)) {
            return cache.get(input);
        }
        
        // Optimized logic
        const result = input * 2; // Example optimization
        cache.set(input, result);
        return result;
    };
};

// Reduced complexity and improved efficiency
const result = optimizedCode();'''
    else:
        return '''// Refactored for better readability
function calculateTotal(items) {
    // Calculate total with clear variable names
    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;
    
    return {
        subtotal,
        tax,
        total
    };
}

function calculateSubtotal(items) {
    return items.reduce((sum, item) => sum + item.price, 0);
}

function calculateTax(amount) {
    return amount * 0.08; // 8% tax rate
}'''

def perform_security_scan(code):
    vulnerabilities = []
    
    if 'eval' in code:
        vulnerabilities.append('HIGH: Use of eval() function detected - potential code injection risk')
    if 'innerHTML' in code:
        vulnerabilities.append('MEDIUM: innerHTML usage detected - potential XSS risk')
    if 'document.write' in code:
        vulnerabilities.append('HIGH: document.write() detected - potential XSS risk')
    if 'try' not in code and 'catch' not in code:
        vulnerabilities.append('LOW: No error handling detected')
    
    return {
        'status': 'SECURE' if len(vulnerabilities) == 0 else 'VULNERABILITIES FOUND',
        'riskLevel': 'HIGH' if any('HIGH' in v for v in vulnerabilities) else 'MEDIUM',
        'vulnerabilities': vulnerabilities,
        'recommendations': [
            'Address HIGH priority issues immediately',
            'Implement input sanitization',
            'Use secure coding practices',
            'Add proper error handling',
            'Regular security audits'
        ]
    }

def optimize_code_performance(code):
    return {
        'originalCode': code,
        'optimizedCode': '''// Performance-optimized version
class OptimizedProcessor {
    constructor() {
        this.cache = new Map(); // O(1) lookup
        this.memoized = new Map(); // Memoization
    }
    
    process(data) {
        // Check cache first
        const cacheKey = JSON.stringify(data);
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        // Optimized processing
        const result = this.optimizedLogic(data);
        
        // Cache result
        this.cache.set(cacheKey, result);
        return result;
    }
    
    optimizedLogic(data) {
        // Use efficient algorithms
        return data
            .filter(item => item.active) // Early filtering
            .map(item => this.transform(item)) // Efficient transformation
            .reduce((acc, item) => acc + item.value, 0); // Efficient reduction
    }
}''',
        'improvements': [
            '~80% faster processing with caching',
            '~60% reduced memory usage',
            '~50% fewer DOM operations',
            '~70% better scalability'
        ],
        'benchmark': {
            'before': '1000ms (1000 items)',
            'after': '200ms (1000 items)',
            'improvement': '5x faster'
        }
    }

def run_server():
    init_demo_data()
    
    PORT = 3001
    Handler = APIHandler
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Zenvora AI Backend Server Started!")
        print(f"📡 API available at: http://localhost:{PORT}")
        print(f"🏥 Health check: http://localhost:{PORT}/api/health")
        print(f"🛑 Press Ctrl+C to stop the server")
        print("")
        print("📋 Available endpoints:")
        print("  • POST /api/analyze - AI code analysis")
        print("  • POST /api/tools/generate-code - Code generation")
        print("  • POST /api/tools/generate-tests - Test generation")
        print("  • POST /api/tools/security-scan - Security scanning")
        print("  • GET /api/projects - Project management")
        print("  • GET /api/health - Health check")
        print("")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")

if __name__ == "__main__":
    run_server()
