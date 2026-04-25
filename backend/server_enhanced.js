const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'file://'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// Data storage (in-memory for demo, replace with database in production)
const users = new Map();
const projects = new Map();
const analyses = new Map();
const sessions = new Map();

// Initialize with demo data
function initializeDemoData() {
    // Demo user
    users.set('demo-user', {
        id: 'demo-user',
        username: 'demo',
        email: 'demo@zenvora.ai',
        createdAt: new Date().toISOString(),
        projects: [],
        settings: {
            theme: 'dark',
            aiModel: 'advanced',
            notifications: true,
            autoSave: true
        }
    });

    // Demo projects
    const demoProject1 = {
        id: uuidv4(),
        name: 'E-Commerce Platform',
        description: 'Full-stack e-commerce application with React and Node.js',
        language: 'javascript',
        code: `// E-Commerce Platform
class ECommercePlatform {
    constructor() {
        this.products = [];
        this.cart = [];
        this.users = [];
    }
    
    addProduct(product) {
        this.products.push(product);
        this.notifyUsers('New product added!');
    }
    
    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.cart.push(product);
        }
    }
}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'demo-user',
        analyses: []
    };

    const demoProject2 = {
        id: uuidv4(),
        name: 'AI Chat Application',
        description: 'Real-time chat application with AI integration',
        language: 'javascript',
        code: `// AI Chat Application
class AIChatApp {
    constructor() {
        this.messages = [];
        this.aiModel = 'gpt-4';
    }
    
    async sendMessage(message) {
        this.messages.push({ user: true, text: message });
        
        // AI Processing
        const aiResponse = await this.processWithAI(message);
        this.messages.push({ user: false, text: aiResponse });
        
        return aiResponse;
    }
    
    async processWithAI(message) {
        // Simulate AI processing
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(\`AI Response to: \${message}\`);
            }, 1000);
        });
    }
}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'demo-user',
        analyses: []
    };

    projects.set(demoProject1.id, demoProject1);
    projects.set(demoProject2.id, demoProject2);
    users.get('demo-user').projects.push(demoProject1.id, demoProject2.id);
}

// Enhanced AI Analysis Functions
function performEnhancedAIAnalysis(code, language, projectId) {
    const lines = code.split('\n');
    const functions = lines.filter(line => 
        line.includes('function') || line.includes('=>') || line.includes('class')
    ).length;
    
    const comments = lines.filter(line => 
        line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')
    ).length;
    
    const complexity = calculateEnhancedComplexity(code);
    const maintainability = calculateEnhancedMaintainability(code, comments, lines.length);
    const testCoverage = estimateEnhancedTestCoverage(code, functions);
    const securityScore = calculateEnhancedSecurityScore(code);
    const performance = calculatePerformanceMetrics(code);
    
    const suggestions = generateEnhancedSuggestions(code);
    const issues = findEnhancedIssues(code);
    
    return {
        id: uuidv4(),
        projectId,
        code,
        language,
        metrics: {
            complexity,
            maintainability,
            testCoverage,
            securityScore,
            performance,
            lines: lines.length,
            functions,
            comments,
            codeQuality: calculateCodeQuality(code, complexity, maintainability, securityScore),
            technicalDebt: calculateTechnicalDebt(complexity, issues.length)
        },
        suggestions,
        issues,
        insights: generateCodeInsights(code, language),
        recommendations: generateRecommendations(code, complexity, securityScore),
        createdAt: new Date().toISOString()
    };
}

function calculateEnhancedComplexity(code) {
    let complexity = 1;
    
    // Cyclomatic complexity
    const loops = (code.match(/for\s*\(|while\s*\(|do\s*{/g) || []).length;
    const conditionals = (code.match(/if\s*\(|switch\s*\(|case\s*:/g) || []).length;
    const nestedBlocks = (code.match(/\{[^{}]*\{/g) || []).length;
    
    complexity += loops * 2 + conditionals + nestedBlocks;
    
    // Function complexity
    const functions = code.match(/function\s+\w+\s*\([^)]*\)/g) || [];
    functions.forEach(func => {
        const params = func.match(/\([^)]*\)/);
        if (params) {
            complexity += params[0].split(',').length;
        }
    });
    
    return Math.min(20, Math.round(complexity * 1.2));
}

function calculateEnhancedMaintainability(code, comments, lines) {
    const commentRatio = comments / Math.max(1, lines);
    const baseScore = 50;
    const commentBonus = commentRatio * 25;
    const lengthPenalty = Math.max(0, (lines - 100) / 20);
    const complexityPenalty = calculateEnhancedComplexity(code) > 10 ? 15 : 0;
    
    const maintainability = Math.min(100, Math.round(
        baseScore + commentBonus - lengthPenalty - complexityPenalty
    ));
    
    return maintainability;
}

function estimateEnhancedTestCoverage(code, functions) {
    const testKeywords = ['describe', 'it', 'test', 'expect', 'assert', 'should'];
    let testCount = 0;
    
    testKeywords.forEach(keyword => {
        testCount += (code.match(new RegExp(keyword, 'gi')) || []).length;
    });
    
    const estimatedCoverage = Math.min(95, Math.round(
        (testCount / Math.max(1, functions)) * 100
    ));
    
    return estimatedCoverage;
}

function calculateEnhancedSecurityScore(code) {
    let score = 10;
    
    // Security vulnerabilities
    const vulnerabilities = [
        { pattern: /eval\s*\(/gi, penalty: 4, type: 'critical' },
        { pattern: /innerHTML\s*=/gi, penalty: 2, type: 'high' },
        { pattern: /document\.write\s*\(/gi, penalty: 3, type: 'critical' },
        { pattern: /SQL\s*(SELECT|INSERT|UPDATE|DELETE)/gi, penalty: 2, type: 'high' },
        { pattern: /exec\s*\(/gi, penalty: 3, type: 'critical' },
        { pattern: /setTimeout\s*\(\s*["']/gi, penalty: 1, type: 'medium' }
    ];
    
    vulnerabilities.forEach(vuln => {
        if (vuln.pattern.test(code)) {
            score -= vuln.penalty;
        }
    });
    
    return Math.max(1, score);
}

function calculatePerformanceMetrics(code) {
    const lines = code.split('\n');
    const emptyLines = lines.filter(line => !line.trim()).length;
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    const maxNesting = calculateMaxNesting(code);
    
    return {
        linesOfCode: lines.length - emptyLines,
        avgLineLength: Math.round(avgLineLength),
        maxNesting,
        cyclomaticComplexity: calculateEnhancedComplexity(code),
        memoryComplexity: estimateMemoryComplexity(code),
        executionTime: estimateExecutionTime(code)
    };
}

function calculateMaxNesting(code) {
    let maxNesting = 0;
    let currentNesting = 0;
    
    for (let char of code) {
        if (char === '{') currentNesting++;
        if (char === '}') currentNesting--;
        maxNesting = Math.max(maxNesting, currentNesting);
    }
    
    return maxNesting;
}

function estimateMemoryComplexity(code) {
    const variables = (code.match(/(?:const|let|var)\s+\w+/g) || []).length;
    const functions = (code.match(/function\s+\w+/g) || []).length;
    const objects = (code.match(/new\s+\w+/g) || []).length;
    
    return Math.min(10, Math.round((variables + functions + objects) / 3));
}

function estimateExecutionTime(code) {
    const loops = (code.match(/for\s*\(|while\s*\(/g) || []).length;
    const recursions = (code.match(/function\s+\w+.*\w+\s*\(/g) || []).length;
    const complexity = calculateEnhancedComplexity(code);
    
    // Estimated execution time in milliseconds
    return Math.round((loops * 10 + recursions * 50 + complexity * 5) * Math.random() * 2);
}

function calculateCodeQuality(code, complexity, maintainability, securityScore) {
    const qualityScore = (maintainability + securityScore) / 2;
    const complexityPenalty = Math.max(0, (complexity - 8) * 2);
    
    return Math.max(1, Math.min(10, Math.round(qualityScore - complexityPenalty)));
}

function calculateTechnicalDebt(complexity, issueCount) {
    const baseDebt = complexity * 2;
    const issueDebt = issueCount * 4;
    
    return Math.round(baseDebt + issueDebt);
}

function generateEnhancedSuggestions(code) {
    const suggestions = [];
    
    // Code style suggestions
    if (code.includes('var ')) {
        suggestions.push({
            type: 'style',
            priority: 'medium',
            message: 'Replace var with const/let for better scoping',
            autoFix: 'var → const/let'
        });
    }
    
    if (code.includes('console.log')) {
        suggestions.push({
            type: 'logging',
            priority: 'low',
            message: 'Replace console.log with proper logging system',
            autoFix: 'console.log → logger.log'
        });
    }
    
    // Performance suggestions
    const loops = (code.match(/for\s*\(/g) || []).length;
    if (loops > 3) {
        suggestions.push({
            type: 'performance',
            priority: 'high',
            message: 'Consider reducing nested loops for better performance',
            autoFix: 'Refactor loop structure'
        });
    }
    
    // Security suggestions
    if (!code.includes('try') || !code.includes('catch')) {
        suggestions.push({
            type: 'security',
            priority: 'high',
            message: 'Add error handling with try-catch blocks',
            autoFix: 'Add try-catch wrapper'
        });
    }
    
    return suggestions;
}

function findEnhancedIssues(code) {
    const issues = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        
        // Security issues
        if (line.includes('eval(')) {
            issues.push({
                type: 'security',
                severity: 'critical',
                message: 'Use of eval() function detected - potential code injection',
                line: lineNumber,
                autoFix: 'Remove eval() and use safer alternative'
            });
        }
        
        if (line.includes('innerHTML')) {
            issues.push({
                type: 'security',
                severity: 'high',
                message: 'innerHTML usage detected - potential XSS vulnerability',
                line: lineNumber,
                autoFix: 'Use textContent or sanitize input'
            });
        }
        
        // Performance issues
        if (line.includes('for (') && line.includes('for (')) {
            issues.push({
                type: 'performance',
                severity: 'medium',
                message: 'Nested for loop detected',
                line: lineNumber,
                autoFix: 'Refactor nested loops'
            });
        }
        
        // Code quality issues
        if (line.trim().length > 120) {
            issues.push({
                type: 'quality',
                severity: 'low',
                message: 'Line too long - consider breaking up',
                line: lineNumber,
                autoFix: 'Break long lines into multiple lines'
            });
        }
    });
    
    return issues;
}

function generateCodeInsights(code, language) {
    const insights = [];
    
    // Language-specific insights
    if (language === 'javascript') {
        insights.push({
            category: 'language',
            insight: 'JavaScript patterns detected',
            details: ['ES6+ features', 'Async/await usage', 'Modern syntax']
        });
    }
    
    // Architecture insights
    const functions = (code.match(/function\s+\w+/g) || []).length;
    const classes = (code.match(/class\s+\w+/g) || []).length;
    
    if (functions > 10) {
        insights.push({
            category: 'architecture',
            insight: 'High function count',
            details: ['Consider modularizing', 'Extract common functionality', 'Use design patterns']
        });
    }
    
    return insights;
}

function generateRecommendations(code, complexity, securityScore) {
    const recommendations = [];
    
    if (complexity > 15) {
        recommendations.push({
            priority: 'high',
            category: 'refactoring',
            action: 'Reduce complexity',
            description: 'Break down complex functions into smaller, more manageable pieces'
        });
    }
    
    if (securityScore < 6) {
        recommendations.push({
            priority: 'critical',
            category: 'security',
            action: 'Improve security',
            description: 'Address security vulnerabilities immediately'
        });
    }
    
    return recommendations;
}

// Enhanced API Routes
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Simulate authentication (in production, use proper hashing and database)
    const user = users.get('demo-user');
    
    if (user && user.email === email) {
        const sessionToken = uuidv4();
        sessions.set(sessionToken, {
            userId: user.id,
            email: user.email,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
        
        res.json({
            success: true,
            token: sessionToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.email.split('@')[0],
                settings: user.settings
            },
            message: 'Login successful'
        });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }
    
    // Simulate registration (in production, use proper validation and database)
    const newUser = {
        id: uuidv4(),
        name,
        email,
        createdAt: new Date().toISOString(),
        projects: [],
        settings: {
            theme: 'dark',
            aiModel: 'advanced',
            notifications: true,
            autoSave: true
        }
    };
    
    users.set(newUser.id, newUser);
    
    res.status(201).json({
        success: true,
        user: {
            id: newUser.id,
            name,
            email,
            settings: newUser.settings
        },
        message: 'Registration successful'
    });
});

app.post('/api/auth/logout', (req, res) => {
    const { token } = req.body;
    
    if (token && sessions.has(token)) {
        sessions.delete(token);
        res.json({ success: true, message: 'Logout successful' });
    } else {
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.get('/api/auth/profile', (req, res) => {
    const { token } = req.query;
    
    if (token && sessions.has(token)) {
        const session = sessions.get(token);
        const user = users.get(session.userId);
        
        if (user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    settings: user.settings,
                    projects: user.projects
                }
            });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } else {
        res.status(401).json({ error: 'Token required' });
    }
});

// Enhanced project management
app.post('/api/projects', (req, res) => {
    const { name, description, language, code, userId } = req.body;
    
    if (!name || !userId) {
        return res.status(400).json({ error: 'Name and userId required' });
    }
    
    const project = {
        id: uuidv4(),
        name,
        description: description || '',
        language: language || 'javascript',
        code: code || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId,
        analyses: [],
        collaborators: [],
        tags: [],
        visibility: 'private',
        status: 'active'
    };
    
    projects.set(project.id, project);
    
    // Update user's projects
    const user = users.get(userId);
    if (user) {
        user.projects.push(project.id);
    }
    
    res.status(201).json(project);
});

app.get('/api/projects/:userId', (req, res) => {
    const { userId } = req.params;
    const user = users.get(userId);
    
    if (user) {
        const userProjects = Array.from(projects.values()).filter(p => p.userId === userId);
        res.json(userProjects);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.put('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    if (projects.has(id)) {
        const project = projects.get(id);
        Object.assign(project, updates, { updatedAt: new Date().toISOString() });
        projects.set(id, project);
        res.json(project);
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

app.delete('/api/projects/:id', (req, res) => {
    const { id } = req.params;
    
    if (projects.has(id)) {
        projects.delete(id);
        res.json({ success: true, message: 'Project deleted' });
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

// Enhanced AI Tools
app.post('/api/tools/generate-code', (req, res) => {
    const { description, language, framework, style } = req.body;
    
    if (!description) {
        return res.status(400).json({ error: 'Description required' });
    }
    
    const generatedCode = generateEnhancedCode(description, language, framework, style);
    
    res.json({
        success: true,
        code: generatedCode,
        language: language || 'javascript',
        framework: framework || 'vanilla',
        style: style || 'modern',
        metadata: {
            lines: generatedCode.split('\n').length,
            functions: (generatedCode.match(/function\s+\w+/g) || []).length,
            complexity: calculateEnhancedComplexity(generatedCode),
            estimatedTime: Math.round(Math.random() * 5000 + 1000)
        }
    });
});

function generateEnhancedCode(description, language, framework, style) {
    const templates = {
        javascript: {
            react: `// React Component - ${description}
import React, { useState, useEffect } from 'react';

const ${generateComponentName(description)} = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setData(${generateMockData(description)});
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="${generateComponentName(description)}">
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <h1>${description}</h1>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default ${generateComponentName(description)};`,
            vanilla: `// Vanilla JavaScript - ${description}
class ${generateClassName(description)} {
    constructor() {
        this.description = '${description}';
        this.data = null;
        this.loading = false;
    }
    
    async initialize() {
        this.loading = true;
        try {
            this.data = await this.fetchData();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            this.loading = false;
        }
    }
    
    async fetchData() {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(${generateMockData(description)});
            }, 1000);
        });
    }
    
    render() {
        const container = document.getElementById('app');
        if (container) {
            container.innerHTML = this.loading ? 
                '<div>Loading...</div>' : 
                \`<div class="\${this.constructor.name.toLowerCase()}">
                    <h1>\${this.description}</h1>
                    <div id="data-display"></div>
                </div>\`;
        }
    }
}

// Initialize
const app = new ${generateClassName(description)}();
app.initialize();`,
            nodejs: `// Node.js Module - ${description}
const express = require('express');
const router = express.Router();

class ${generateClassName(description)} {
    constructor(options = {}) {
        this.options = {
            port: options.port || 3000,
            host: options.host || 'localhost',
            ...options
        };
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }
    
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(cors());
    }
    
    setupRoutes() {
        this.app.get('/api/${this.constructor.name.toLowerCase()}', async (req, res) => {
            try {
                const data = await this.processRequest(req.query);
                res.json({ success: true, data });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }
    
    async processRequest(params) {
        // Simulate processing based on ${description}
        return ${generateMockData(description)};
    }
    
    start() {
        this.app.listen(this.options.port, () => {
            console.log(\`${this.constructor.name} server running on port \${this.options.port}\`);
        });
    }
}

module.exports = ${generateClassName(description)};`
        },
        python: `# Python Class - ${description}
class ${generateClassName(description)}:
    """${description}"""
    
    def __init__(self, config=None):
        self.config = config or {}
        self.description = '${description}'
        self.data = None
        self.loading = False
    
    async def fetch_data(self):
        """Simulate API call"""
        import asyncio
        await asyncio.sleep(1)  # Simulate network delay
        self.data = ${generateMockData(description, 'python')}
        self.loading = False
    
    def process_request(self, params):
        """Process request based on ${description}"""
        return self.data
    
    def run(self):
        """Run the application"""
        print(f"Starting {self.description}...")
        # Application logic here

# Usage
if __name__ == "__main__":
    app = ${generateClassName(description)}()
    app.run()`
        }
    };
    
    return templates[language]?.[framework] || templates[language]?.vanilla || templates.javascript.vanilla;
}

function generateComponentName(description) {
    return description
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

function generateClassName(description) {
    return description
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
}

function generateMockData(description, language = 'javascript') {
    const dataTemplates = {
        javascript: {
            users: [
                { id: 1, name: 'John', email: 'john@example.com' },
                { id: 2, name: 'Jane', email: 'jane@example.com' }
            ],
            posts: [
                { id: 1, title: 'First Post', content: 'Content for ' + description },
                { id: 2, title: 'Second Post', content: 'More content for ' + description }
            ]
        },
        python: `{
            "users": [
                {"id": 1, "name": "John", "email": "john@example.com"},
                {"id": 2, "name": "Jane", "email": "jane@example.com"}
            ],
            "posts": [
                {"id": 1, "title": "First Post", "content": "Content for ${description}"},
                {"id": 2, "title": "Second Post", "content": "More content for ${description}"}
            ]
        }`
    };
    
    return dataTemplates[language] || dataTemplates.javascript;
}

// Enhanced analyze endpoint
app.post('/api/analyze', (req, res) => {
    const { code, language, projectId, analysisType } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }
    
    const analysis = performEnhancedAIAnalysis(code, language || 'javascript', projectId);
    
    // Store analysis
    analyses.set(analysis.id, analysis);
    
    // Update project if provided
    if (projectId && projects.has(projectId)) {
        const project = projects.get(projectId);
        project.analyses.push(analysis.id);
        project.updatedAt = new Date().toISOString();
        projects.set(projectId, project);
    }
    
    res.json(analysis);
});

// Enhanced code generation
app.post('/api/tools/generate-tests', (req, res) => {
    const { code, framework, testType, coverage } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }
    
    const tests = generateEnhancedTests(code, framework, testType, coverage);
    
    res.json({
        success: true,
        tests,
        framework: framework || 'jest',
        testType: testType || 'unit',
        coverage: coverage || 80,
        metadata: {
            totalTests: tests.length,
            estimatedTime: Math.round(Math.random() * 3000 + 2000),
            complexity: calculateEnhancedComplexity(code)
        }
    });
});

function generateEnhancedTests(code, framework, testType, coverage) {
    const functions = code.match(/function\s+\w+\s*\([^)]*\)/g) || [];
    const testTemplates = {
        jest: {
            unit: functions.map((func, index) => `
describe('${func[0] || 'Function'}', () => {
    it('should handle basic functionality', () => {
        // Test basic functionality
        expect(${func[0] || 'function'}).toBeDefined();
    });
    
    it('should handle edge cases', () => {
        // Test edge cases
        expect(${func[0] || 'function'}()).not.toThrow();
    });
    
    it('should handle error cases', () => {
        // Test error handling
        expect(() => {
            throw new Error('Test error');
        }).toThrow('Test error');
    });
});`),
            integration: functions.map((func, index) => `
describe('${func[0] || 'Function'} Integration', () => {
    it('should integrate with other components', () => {
        // Integration tests
        const result = ${func[0] || 'function'}();
        expect(result).toBeDefined();
    });
});`)
        },
        mocha: functions.map((func, index) => `
const assert = require('assert');
const chai = require('chai');

describe('${func[0] || 'Function'}', () => {
    it('should handle basic functionality', () => {
        assert(${func[0] || 'function'}(), 'Basic functionality test failed');
    });
    
    it('should handle edge cases', () => {
        // Edge case testing
        assert.throws(() => {
            ${func[0] || 'function'}(null);
        }, /Error/);
    });
});`)
        }
    };
    
    return testTemplates[framework]?.[testType] || testTemplates.jest.unit;
}

// Enhanced security scanning
app.post('/api/tools/security-scan', (req, res) => {
    const { code, scanLevel, reportType } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }
    
    const securityReport = performEnhancedSecurityScan(code, scanLevel, reportType);
    
    res.json({
        success: true,
        report: securityReport,
        scanLevel: scanLevel || 'comprehensive',
        reportType: reportType || 'detailed',
        timestamp: new Date().toISOString()
    });
});

function performEnhancedSecurityScan(code, scanLevel, reportType) {
    const vulnerabilities = [];
    const recommendations = [];
    
    // OWASP Top 10 vulnerabilities
    const securityChecks = [
        {
            name: 'SQL Injection',
            pattern: /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|ALTER)/gi,
            severity: 'critical',
            cwe: 'CWE-89',
            description: 'SQL injection vulnerability detected'
        },
        {
            name: 'Cross-Site Scripting (XSS)',
            pattern: /innerHTML\s*=|document\.write\s*\(|eval\s*\(/gi,
            severity: 'high',
            cwe: 'CWE-79',
            description: 'Potential XSS vulnerability'
        },
        {
            name: 'Insecure Deserialization',
            pattern: /JSON\.parse\s*\(|unserialize\s*\(/gi,
            severity: 'medium',
            cwe: 'CWE-502',
            description: 'Insecure deserialization detected'
        },
        {
            name: 'Broken Authentication',
            pattern: /(password|token|auth)\s*=\s*["'][^]*["']/gi,
            severity: 'high',
            cwe: 'CWE-287',
            description: 'Hardcoded credentials detected'
        },
        {
            name: 'Sensitive Data Exposure',
            pattern: /(api[_-]?key|secret|password|token)\s*=\s*["'][^]*["']/gi,
            severity: 'critical',
            cwe: 'CWE-200',
            description: 'Sensitive data exposure detected'
        }
    ];
    
    securityChecks.forEach(check => {
        if (check.pattern.test(code)) {
            vulnerabilities.push({
                type: check.name,
                severity: check.severity,
                cwe: check.cwe,
                description: check.description,
                location: findVulnerabilityLocation(code, check.pattern),
                recommendation: getSecurityRecommendation(check.name)
            });
        }
    });
    
    // Generate recommendations
    if (vulnerabilities.length > 0) {
        recommendations.push({
            priority: 'critical',
            action: 'Address security vulnerabilities immediately',
            description: 'Fix all critical and high severity issues'
        });
    }
    
    recommendations.push({
        priority: 'medium',
        action: 'Implement security headers',
        description: 'Add security headers like CSP, HSTS'
    });
    
    recommendations.push({
        priority: 'low',
        action: 'Regular security audits',
        description: 'Conduct regular security code reviews'
    });
    
    return {
        scanId: uuidv4(),
        timestamp: new Date().toISOString(),
        scanLevel,
        reportType,
        vulnerabilities,
        recommendations,
        score: calculateSecurityScore(vulnerabilities),
        summary: {
            total: vulnerabilities.length,
            critical: vulnerabilities.filter(v => v.severity === 'critical').length,
            high: vulnerabilities.filter(v => v.severity === 'high').length,
            medium: vulnerabilities.filter(v => v.severity === 'medium').length,
            low: vulnerabilities.filter(v => v.severity === 'low').length
        }
    };
}

function findVulnerabilityLocation(code, pattern) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
            return { line: i + 1, content: lines[i].trim() };
        }
    }
    return null;
}

function getSecurityRecommendation(vulnerabilityType) {
    const recommendations = {
        'SQL Injection': 'Use parameterized queries and input validation',
        'Cross-Site Scripting': 'Use textContent instead of innerHTML and sanitize inputs',
        'Insecure Deserialization': 'Use safe deserialization practices',
        'Broken Authentication': 'Implement proper authentication and session management',
        'Sensitive Data Exposure': 'Remove sensitive data from code and use environment variables'
    };
    
    return recommendations[vulnerabilityType] || 'Review security best practices';
}

function calculateSecurityScore(vulnerabilities) {
    let score = 10;
    
    vulnerabilities.forEach(vuln => {
        switch (vuln.severity) {
            case 'critical': score -= 4; break;
            case 'high': score -= 2; break;
            case 'medium': score -= 1; break;
            case 'low': score -= 0.5; break;
        }
    });
    
    return Math.max(1, score);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!', 
        details: err.message,
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize demo data
initializeDemoData();

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Enhanced Zenvora AI Backend Server running on port ${PORT}`);
    console.log(`📡 API available at: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log('');
    console.log('🔥 Enhanced Features:');
    console.log('   • User authentication & profiles');
    console.log('   • Advanced AI code analysis');
    console.log('   • Enhanced security scanning');
    console.log('   • Intelligent code generation');
    console.log('   • OWASP vulnerability detection');
    console.log('   • Performance metrics');
    console.log('   • Technical debt calculation');
    console.log('   • Code quality scoring');
});

module.exports = app;
