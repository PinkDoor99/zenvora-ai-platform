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
const projects = new Map();
const analyses = new Map();
const users = new Map();

// Initialize with demo data
function initializeDemoData() {
    // Demo user
    users.set('demo-user', {
        id: 'demo-user',
        username: 'demo',
        email: 'demo@zenvora.ai',
        createdAt: new Date().toISOString(),
        projects: []
    });

    // Demo project
    const demoProject = {
        id: uuidv4(),
        name: 'Zenvora AI Platform',
        description: 'Advanced AI integration platform',
        language: 'javascript',
        code: `function analyzeCode(code) {
    // AI-powered code analysis
    const issues = [];
    const suggestions = [];
    
    // Analyze for potential improvements
    if (code.includes('var ')) {
        suggestions.push('Consider using const/let instead of var');
    }
    
    return { issues, suggestions };
}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analyses: []
    };
    projects.set(demoProject.id, demoProject);
    
    const demoAnalysis = {
        id: uuidv4(),
        projectId: demoProject.id,
        complexity: 7.2,
        maintainability: 85,
        testCoverage: 68,
        securityScore: 9.1,
        suggestions: [
            'Use const/let instead of var',
            'Add error handling',
            'Optimize loop structure',
            'Add JSDoc comments'
        ],
        issues: [
            { type: 'warning', message: 'Consider using modern syntax', line: 3 },
            { type: 'info', message: 'Function could benefit from documentation', line: 1 }
        ],
        createdAt: new Date().toISOString()
    };
    analyses.set(demoAnalysis.id, demoAnalysis);
    demoProject.analyses.push(demoAnalysis.id);
}

initializeDemoData();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// User routes
app.get('/api/user/:id', (req, res) => {
    const user = users.get(req.params.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

app.post('/api/user', (req, res) => {
    const { username, email } = req.body;
    const userId = uuidv4();
    const user = {
        id: userId,
        username,
        email,
        createdAt: new Date().toISOString(),
        projects: []
    };
    users.set(userId, user);
    res.status(201).json(user);
});

// Project routes
app.get('/api/projects', (req, res) => {
    const projectList = Array.from(projects.values());
    res.json(projectList);
});

app.get('/api/projects/:id', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
});

app.post('/api/projects', (req, res) => {
    const { name, description, language, code, userId } = req.body;
    const project = {
        id: uuidv4(),
        name: name || 'Untitled Project',
        description: description || '',
        language: language || 'javascript',
        code: code || '',
        userId: userId || 'demo-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        analyses: []
    };
    projects.set(project.id, project);
    
    // Add to user's projects
    const user = users.get(project.userId);
    if (user) {
        user.projects.push(project.id);
    }
    
    res.status(201).json(project);
});

app.put('/api/projects/:id', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    
    const { name, description, language, code } = req.body;
    project.name = name || project.name;
    project.description = description || project.description;
    project.language = language || project.language;
    project.code = code || project.code;
    project.updatedAt = new Date().toISOString();
    
    res.json(project);
});

app.delete('/api/projects/:id', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    
    // Remove associated analyses
    project.analyses.forEach(analysisId => {
        analyses.delete(analysisId);
    });
    
    // Remove from user's projects
    const user = users.get(project.userId);
    if (user) {
        user.projects = user.projects.filter(id => id !== req.params.id);
    }
    
    projects.delete(req.params.id);
    res.status(204).send();
});

// AI suggestion endpoint
app.post('/api/ai/suggest', (req, res) => {
    const { suggestion } = req.body;
    res.json({
        success: true,
        suggestion: suggestion,
        response: `AI suggestion processed: ${suggestion}`,
        timestamp: new Date().toISOString()
    });
});

// Project load endpoint
app.post('/api/projects/load', (req, res) => {
    const { name } = req.body;
    const project = Array.from(projects.values()).find(p => p.name === name);
    if (project) {
        res.json({ success: true, project });
    } else {
        res.json({ success: true, project: { name, code: '// New project', language: 'javascript' } });
    }
});

// Lessons endpoint
app.post('/api/lessons', (req, res) => {
    const { level } = req.body;
    const lessons = {
        'Beginner': [
            { id: 1, title: 'Introduction to Variables', content: 'Learn about variables in programming' },
            { id: 2, title: 'Functions Basics', content: 'Understanding functions and their usage' }
        ],
        'Intermediate': [
            { id: 3, title: 'Advanced Functions', content: 'Higher-order functions and callbacks' },
            { id: 4, title: 'Data Structures', content: 'Arrays, objects, and more' }
        ],
        'Advanced': [
            { id: 5, title: 'Design Patterns', content: 'Common software design patterns' },
            { id: 6, title: 'Performance Optimization', content: 'Optimizing code performance' }
        ],
        'Expert': [
            { id: 7, title: 'System Architecture', content: 'Building scalable systems' },
            { id: 8, title: 'Security Best Practices', content: 'Securing applications' }
        ]
    };
    res.json({ success: true, lessons: lessons[level] || lessons['Beginner'] });
});

// Settings endpoint
app.post('/api/settings', (req, res) => {
    const { key, value } = req.body;
    res.json({ success: true, message: `Setting ${key} saved with value: ${value}` });
});

// Analysis routes
app.post('/api/analyze', async (req, res) => {
    const { code, language, projectId } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }
    
    try {
        // Simulate AI processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const analysis = performAIAnalysis(code, language, projectId);
        analyses.set(analysis.id, analysis);
        
        // Add to project if provided
        if (projectId && projects.has(projectId)) {
            const project = projects.get(projectId);
            project.analyses.push(analysis.id);
            project.updatedAt = new Date().toISOString();
        }
        
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ error: 'Analysis failed', details: error.message });
    }
});

app.get('/api/analyses/:id', (req, res) => {
    const analysis = analyses.get(req.params.id);
    if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json(analysis);
});

app.get('/api/projects/:id/analyses', (req, res) => {
    const project = projects.get(req.params.id);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    
    const projectAnalyses = project.analyses.map(id => analyses.get(id)).filter(Boolean);
    res.json(projectAnalyses);
});

// AI Tools routes
app.post('/api/tools/generate-code', async (req, res) => {
    const { description, language } = req.body;
    
    if (!description) {
        return res.status(400).json({ error: 'Description is required' });
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const generatedCode = generateCodeFromDescription(description, language);
        res.json({ code: generatedCode, language: language || 'javascript' });
    } catch (error) {
        res.status(500).json({ error: 'Code generation failed', details: error.message });
    }
});

app.post('/api/tools/generate-tests', async (req, res) => {
    const { code, framework } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const tests = generateTestsForCode(code, framework);
        res.json({ tests, framework: framework || 'jest' });
    } catch (error) {
        res.status(500).json({ error: 'Test generation failed', details: error.message });
    }
});

app.post('/api/tools/generate-docs', async (req, res) => {
    const { code, docType } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const documentation = generateDocumentationForCode(code, docType);
        res.json({ documentation, type: docType || 'jsdoc' });
    } catch (error) {
        res.status(500).json({ error: 'Documentation generation failed', details: error.message });
    }
});

app.post('/api/tools/refactor', async (req, res) => {
    const { code, goal } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const refactoredCode = refactorCodeWithGoal(code, goal);
        res.json({ refactoredCode, goal: goal || 'readability' });
    } catch (error) {
        res.status(500).json({ error: 'Refactoring failed', details: error.message });
    }
});

app.post('/api/tools/security-scan', async (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const securityReport = performSecurityScan(code);
        res.json(securityReport);
    } catch (error) {
        res.status(500).json({ error: 'Security scan failed', details: error.message });
    }
});

app.post('/api/tools/performance-optimize', async (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const optimizationReport = optimizeCodePerformance(code);
        res.json(optimizationReport);
    } catch (error) {
        res.status(500).json({ error: 'Performance optimization failed', details: error.message });
    }
});

// AI Analysis Functions
function performAIAnalysis(code, language, projectId) {
    const lines = code.split('\n').length;
    const functions = (code.match(/function|=>/g) || []).length;
    const comments = (code.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length;
    
    // Calculate metrics
    const complexity = calculateComplexity(code);
    const maintainability = calculateMaintainability(code, comments, lines);
    const testCoverage = estimateTestCoverage(code, functions);
    const securityScore = calculateSecurityScore(code);
    
    // Generate suggestions
    const suggestions = generateSuggestions(code);
    
    // Find issues
    const issues = findIssues(code);
    
    return {
        id: uuidv4(),
        projectId,
        code,
        language: language || 'javascript',
        metrics: {
            complexity,
            maintainability,
            testCoverage,
            securityScore,
            lines,
            functions,
            comments
        },
        suggestions,
        issues,
        createdAt: new Date().toISOString()
    };
}

function calculateComplexity(code) {
    const cyclomaticComplexity = (code.match(/if|for|while|switch|catch|&&|\|\|/g) || []).length + 1;
    return Math.round((cyclomaticComplexity * 1.5) * 10) / 10;
}

function calculateMaintainability(code, comments, lines) {
    const commentRatio = comments / Math.max(1, lines);
    const baseScore = 50;
    const commentBonus = commentRatio * 30;
    const lengthPenalty = Math.max(0, (lines - 100) / 10);
    return Math.min(100, Math.round(baseScore + commentBonus - lengthPenalty));
}

function estimateTestCoverage(code, functions) {
    const testKeywords = (code.match(/test|it|describe|expect|assert/g) || []).length;
    return Math.min(95, Math.round((testKeywords / Math.max(1, functions)) * 100));
}

function calculateSecurityScore(code) {
    let score = 10;
    
    if (code.includes('eval')) score -= 3;
    if (code.includes('innerHTML')) score -= 2;
    if (code.includes('document.write')) score -= 3;
    if (code.includes('SQL' || code.includes('SELECT'))) score -= 2;
    if (!code.includes('try') && !code.includes('catch')) score -= 1;
    
    return Math.max(1, score);
}

function generateSuggestions(code) {
    const suggestions = [];
    
    if (code.includes('var ')) {
        suggestions.push('Use const/let instead of var for better scoping');
    }
    
    if (code.includes('console.log') && !code.includes('logger')) {
        suggestions.push('Use proper logging system instead of console.log');
    }
    
    if (code.includes('function') && !code.includes('=>')) {
        suggestions.push('Consider arrow functions for callbacks');
    }
    
    if (!code.includes('try') && !code.includes('catch')) {
        suggestions.push('Add error handling with try-catch blocks');
    }
    
    if (code.length > 500 && !code.includes('/*') && !code.includes('//')) {
        suggestions.push('Add documentation comments for better maintainability');
    }
    
    if (code.includes('==') && !code.includes('===')) {
        suggestions.push('Use strict equality (===) instead of loose equality (==)');
    }
    
    return suggestions;
}

function findIssues(code) {
    const issues = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
        if (line.includes('eval')) {
            issues.push({ type: 'error', message: 'Use of eval() function detected', line: index + 1 });
        }
        if (line.includes('innerHTML')) {
            issues.push({ type: 'warning', message: 'Potential XSS risk with innerHTML', line: index + 1 });
        }
        if (line.includes('var ')) {
            issues.push({ type: 'info', message: 'Consider using const/let instead of var', line: index + 1 });
        }
    });
    
    return issues;
}

// AI Tool Functions
function generateCodeFromDescription(description, language) {
    const templates = {
        javascript: {
            email: `function validateEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
}

// Usage examples
console.log(validateEmail("test@example.com")); // true
console.log(validateEmail("invalid-email"));    // false`,
            calculator: `class Calculator {
    constructor() {
        this.result = 0;
    }
    
    add(num) {
        this.result += num;
        return this;
    }
    
    subtract(num) {
        this.result -= num;
        return this;
    }
    
    multiply(num) {
        this.result *= num;
        return this;
    }
    
    divide(num) {
        if (num === 0) throw new Error("Cannot divide by zero");
        this.result /= num;
        return this;
    }
    
    getResult() {
        return this.result;
    }
}

// Usage
const calc = new Calculator();
const result = calc.add(10).multiply(2).subtract(5).getResult();`
        },
        python: {
            email: `import re

def validate_email(email):
    """Validate email address format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# Usage examples
print(validate_email("test@example.com"))  # True
print(validate_email("invalid-email"))       # False`,
            calculator: `class Calculator:
    def __init__(self):
        self.result = 0
    
    def add(self, num):
        self.result += num
        return self
    
    def subtract(self, num):
        self.result -= num
        return self
    
    def multiply(self, num):
        self.result *= num
        return self
    
    def divide(self, num):
        if num == 0:
            raise ValueError("Cannot divide by zero")
        self.result /= num
        return self
    
    def get_result(self):
        return self.result

# Usage
calc = Calculator()
result = calc.add(10).multiply(2).subtract(5).get_result()`
        }
    };

    if (description.toLowerCase().includes('email')) {
        return templates[language]?.email || templates.javascript.email;
    } else if (description.toLowerCase().includes('calculator')) {
        return templates[language]?.calculator || templates.javascript.calculator;
    } else {
        return `// Generated ${language || 'JavaScript'} code based on: ${description}
function ${description.toLowerCase().includes('function') ? 'customFunction' : 'generatedCode'}() {
    // AI-generated implementation
    console.log("AI-generated code for: ${description}");
    
    // Add your specific logic here
    return true;
}

// Call the function
const result = customFunction();
console.log("Result:", result);`;
    }
}

function generateTestsForCode(code, framework) {
    const testTemplates = {
        jest: `describe('Generated Tests', () => {
    test('should handle basic functionality', () => {
        // Test implementation
        expect(true).toBe(true);
    });
    
    test('should handle edge cases', () => {
        // Edge case testing
        expect(null).toBeNull();
    });
    
    test('should handle errors gracefully', () => {
        // Error handling tests
        expect(() => {
            throw new Error('Test error');
        }).toThrow('Test error');
    });
});`,
        mocha: `const assert = require('assert');

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
});`,
        pytest: `import pytest

def test_basic_functionality():
    """Test basic functionality."""
    assert True is True

def test_edge_cases():
    """Test edge cases."""
    assert None is None

def test_error_handling():
    """Test error handling."""
    with pytest.raises(ValueError, match="Test error"):
        raise ValueError("Test error")

if __name__ == "__main__":
    pytest.main([__file__])`
    };

    return testTemplates[framework] || testTemplates.jest;
}

function generateDocumentationForCode(code, docType) {
    const docTemplates = {
        jsdoc: `/**
 * Generated documentation for your code
 * @description AI-generated documentation based on code analysis
 * @author AI Assistant
 * @since ${new Date().toISOString().split('T')[0]}
 * @example
 * // Usage example
 * const result = yourFunction();
 * console.log(result);
 */
function yourFunction() {
    // Your implementation here
}`,
        readme: `# Generated Documentation

## Overview
AI-generated documentation based on code analysis.

## Features
- Automated documentation generation
- Code analysis and insights
- Best practices recommendations

## Usage
\`\`\`javascript
// Example usage
const result = yourFunction();
console.log(result);
\`\`\`

## Installation
\`\`\`bash
npm install your-package
\`\`\`

## API Reference
Detailed API documentation will be generated based on your code structure.

## Contributing
Contributions are welcome! Please read the contributing guidelines.

## License
MIT License - see LICENSE file for details.`
    };

    return docTemplates[docType] || docTemplates.jsdoc;
}

function refactorCodeWithGoal(code, goal) {
    const refactoringStrategies = {
        performance: `// Performance-optimized version
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
const result = optimizedCode();`,
        readability: `// Refactored for better readability
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
}`
    };

    return refactoringStrategies[goal] || refactoringStrategies.readability;
}

function performSecurityScan(code) {
    const vulnerabilities = [];
    
    if (code.includes('eval(')) {
        vulnerabilities.push('HIGH: Use of eval() function detected - potential code injection risk');
    }
    
    if (code.includes('innerHTML')) {
        vulnerabilities.push('MEDIUM: innerHTML usage detected - potential XSS risk');
    }
    
    if (code.includes('document.write')) {
        vulnerabilities.push('HIGH: document.write() detected - potential XSS risk');
    }
    
    if (!code.includes('try') && !code.includes('catch')) {
        vulnerabilities.push('LOW: No error handling detected');
    }
    
    return {
        status: vulnerabilities.length === 0 ? 'SECURE' : 'VULNERABILITIES FOUND',
        riskLevel: vulnerabilities.some(v => v.includes('HIGH')) ? 'HIGH' : 'MEDIUM',
        vulnerabilities,
        recommendations: [
            'Address HIGH priority issues immediately',
            'Implement input sanitization',
            'Use secure coding practices',
            'Add proper error handling',
            'Regular security audits'
        ]
    };
}

function optimizeCodePerformance(code) {
    return {
        originalCode: code,
        optimizedCode: `// Performance-optimized version
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
}`,
        improvements: [
            '~80% faster processing with caching',
            '~60% reduced memory usage',
            '~50% fewer DOM operations',
            '~70% better scalability'
        ],
        benchmark: {
            before: '1000ms (1000 items)',
            after: '200ms (1000 items)',
            improvement: '5x faster'
        }
    };
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Zenvora AI Backend Server running on port ${PORT}`);
    console.log(`📡 API available at: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
