# Guaranteed Working Backend Server for Zenvora AI Platform
# Uses only built-in Windows PowerShell - No installation required

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Guaranteed Backend Server" -ForegroundColor Cyan
Write-Host "    Zenvora AI Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$Port = 3001
$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# In-memory data storage
$Global:Projects = @{}
$Global:Analyses = @{}
$Global:Users = @{}

# Initialize demo data
function Initialize-DemoData {
    $Global:Users['demo-user'] = @{
        'id' = 'demo-user'
        'username' = 'demo'
        'email' = 'demo@zenvora.ai'
        'createdAt' = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        'projects' = @()
    }
    
    $demoProject = @{
        'id' = [System.Guid]::NewGuid().ToString()
        'name' = 'Zenvora AI Platform'
        'description' = 'Advanced AI integration platform'
        'language' = 'javascript'
        'code' = @'
function analyzeCode(code) {
    // AI-powered code analysis
    const issues = [];
    const suggestions = [];
    
    // Analyze for potential improvements
    if (code.includes('var ')) {
        suggestions.push('Consider using const/let instead of var');
    }
    
    return { issues, suggestions };
}
'@
        'createdAt' = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        'updatedAt' = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
        'analyses' = @()
    }
    $Global:Projects[$demoProject.id] = $demoProject
    
    $demoAnalysis = @{
        'id' = [System.Guid]::NewGuid().ToString()
        'projectId' = $demoProject.id
        'complexity' = 7.2
        'maintainability' = 85
        'testCoverage' = 68
        'securityScore' = 9.1
        'suggestions' = @(
            'Use const/let instead of var',
            'Add error handling',
            'Optimize loop structure',
            'Add JSDoc comments'
        )
        'issues' = @(
            @{ 'type' = 'warning'; 'message' = 'Consider using modern syntax'; 'line' = 3 },
            @{ 'type' = 'info'; 'message' = 'Function could benefit from documentation'; 'line' = 1 }
        )
        'createdAt' = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    }
    $Global:Analyses[$demoAnalysis.id] = $demoAnalysis
    $demoProject.analyses += $demoAnalysis.id
}

# AI Analysis Functions
function Get-AIAnalysis {
    param($Code, $Language, $ProjectId)
    
    $lines = $Code -split "`n"
    $functions = ($lines | Where-Object { $_ -match 'function|=>' }).Count
    $comments = ($lines | Where-Object { $_ -match '^\s*//|/\*' }).Count
    
    $complexity = Get-Complexity $Code
    $maintainability = Get-Maintainability $Code $comments $lines.Count
    $testCoverage = Get-TestCoverage $Code $functions
    $securityScore = Get-SecurityScore $Code
    
    $suggestions = Get-Suggestions $Code
    $issues = Get-Issues $Code
    
    @{
        'id' = [System.Guid]::NewGuid().ToString()
        'projectId' = $ProjectId
        'code' = $Code
        'language' = $Language
        'metrics' = @{
            'complexity' = $complexity
            'maintainability' = $maintainability
            'testCoverage' = $testCoverage
            'securityScore' = $securityScore
            'lines' = $lines.Count
            'functions' = $functions
            'comments' = $comments
        }
        'suggestions' = $suggestions
        'issues' = $issues
        'createdAt' = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    }
}

function Get-Complexity {
    param($Code)
    $indicators = @('if', 'for', 'while', 'switch', 'catch', '&&', '\|\|')
    $complexity = 1
    foreach ($indicator in $indicators) {
        $complexity += ([regex]::Matches($Code, $indicator)).Count
    }
    return [math]::Round($complexity * 1.5, 1)
}

function Get-Maintainability {
    param($Code, $Comments, $Lines)
    $commentRatio = $Comments / [math]::Max(1, $Lines)
    $baseScore = 50
    $commentBonus = $commentRatio * 30
    $lengthPenalty = [math]::Max(0, ($Lines - 100) / 10)
    return [math]::Min(100, [math]::Round($baseScore + $commentBonus - $lengthPenalty))
}

function Get-TestCoverage {
    param($Code, $Functions)
    $testKeywords = @('test', 'it', 'describe', 'expect', 'assert')
    $testCount = 0
    foreach ($keyword in $testKeywords) {
        $testCount += ([regex]::Matches($Code, $keyword)).Count
    }
    return [math]::Min(95, [math]::Round(($testCount / [math]::Max(1, $Functions)) * 100))
}

function Get-SecurityScore {
    param($Code)
    $score = 10
    if ($Code -match 'eval') { $score -= 3 }
    if ($Code -match 'innerHTML') { $score -= 2 }
    if ($Code -match 'document\.write') { $score -= 3 }
    if ($Code -match 'SQL|SELECT') { $score -= 2 }
    if ($Code -notmatch 'try|catch') { $score -= 1 }
    return [math]::Max(1, $score)
}

function Get-Suggestions {
    param($Code)
    $suggestions = @()
    if ($Code -match 'var\s+') {
        $suggestions += 'Use const/let instead of var for better scoping'
    }
    if ($Code -match 'console\.log' -and $Code -notmatch 'logger') {
        $suggestions += 'Use proper logging system instead of console.log'
    }
    if ($Code -match 'function' -and $Code -notmatch '=>') {
        $suggestions += 'Consider arrow functions for callbacks'
    }
    if ($Code -notmatch 'try|catch') {
        $suggestions += 'Add error handling with try-catch blocks'
    }
    return $suggestions
}

function Get-Issues {
    param($Code)
    $issues = @()
    $lines = $Code -split "`n"
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        $lineNumber = $i + 1
        if ($line -match 'eval') {
            $issues += @{ 'type' = 'error'; 'message' = 'Use of eval() function detected'; 'line' = $lineNumber }
        }
        if ($line -match 'innerHTML') {
            $issues += @{ 'type' = 'warning'; 'message' = 'Potential XSS risk with innerHTML'; 'line' = $lineNumber }
        }
        if ($line -match 'var\s+') {
            $issues += @{ 'type' = 'info'; 'message' = 'Consider using const/let instead of var'; 'line' = $lineNumber }
        }
    }
    return $issues
}

function Get-GeneratedCode {
    param($Description, $Language)
    
    if ($Description -match 'email') {
        return @"
// Generated $Language code for email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Usage examples
console.log(validateEmail("test@example.com")); // true
console.log(validateEmail("invalid-email"));    // false
"@
    } elseif ($Description -match 'calculator') {
        return @"
// Generated $Language code for calculator
class Calculator {
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
const result = calc.add(10).multiply(2).subtract(5).getResult();
"@
    } else {
        return @"
// Generated $Language code based on: $Description
function generatedFunction() {
    // AI-generated implementation
    console.log("Generated code for: $Description");
    
    // Add your specific logic here
    return true;
}

// Call the function
const result = generatedFunction();
console.log("Result:", result);
"@
    }
}

function Get-GeneratedTests {
    param($Code, $Framework)
    
    if ($Framework -eq 'jest') {
        return @"
describe('Generated Tests', () => {
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
});
"@
    } elseif ($Framework -eq 'mocha') {
        return @"
const assert = require('assert');

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
});
"@
    } else {
        return @"
// Generated tests for unknown framework
function testBasicFunctionality() {
    console.log('Testing basic functionality...');
    // Add test implementation
}

function testEdgeCases() {
    console.log('Testing edge cases...');
    // Add test implementation
}
"@
    }
}

function Get-SecurityReport {
    param($Code)
    
    $vulnerabilities = @()
    
    if ($Code -match 'eval') {
        $vulnerabilities += 'HIGH: Use of eval() function detected - potential code injection risk'
    }
    if ($Code -match 'innerHTML') {
        $vulnerabilities += 'MEDIUM: innerHTML usage detected - potential XSS risk'
    }
    if ($Code -match 'document\.write') {
        $vulnerabilities += 'HIGH: document.write() detected - potential XSS risk'
    }
    if ($Code -notmatch 'try|catch') {
        $vulnerabilities += 'LOW: No error handling detected'
    }
    
    return @{
        'status' = if ($vulnerabilities.Count -eq 0) { 'SECURE' } else { 'VULNERABILITIES FOUND' }
        'riskLevel' = if ($vulnerabilities -match 'HIGH') { 'HIGH' } else { 'MEDIUM' }
        'vulnerabilities' = $vulnerabilities
        'recommendations' = @(
            'Address HIGH priority issues immediately',
            'Implement input sanitization',
            'Use secure coding practices',
            'Add proper error handling',
            'Regular security audits'
        )
    }
}

# HTTP Request Handler
function Handle-Request {
    param($Context)
    
    $Request = $Context.Request
    $Response = $Context.Response
    $Url = $Request.Url.LocalPath
    
    # Set CORS headers
    $Response.Headers.Add('Access-Control-Allow-Origin', '*')
    $Response.Headers.Add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    $Response.Headers.Add('Access-Control-Allow-Headers', 'Content-Type')
    
    try {
        if ($Request.HttpMethod -eq 'OPTIONS') {
            $Response.StatusCode = 200
            $Response.Close()
            return
        }
        
        if ($Url -eq '/api/health') {
            $Response.ContentType = 'application/json'
            $Response.StatusCode = 200
            $body = @{
                'status' = 'healthy'
                'timestamp' = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
                'version' = '1.0.0'
                'backend' = 'PowerShell Guaranteed Server'
            } | ConvertTo-Json -Depth 10
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
            $Response.ContentLength64 = $buffer.Length
            $Response.OutputStream.Write($buffer, 0, $buffer.Length)
            $Response.Close()
            Write-Host "✅ Health check served" -ForegroundColor Green
            return
        }
        
        if ($Request.HttpMethod -eq 'POST' -and $Url -eq '/api/analyze') {
            $Reader = New-Object System.IO.StreamReader($Request.InputStream)
            $Body = $Reader.ReadToEnd()
            $Data = $Body | ConvertFrom-Json
            
            $Code = $Data.code
            $Language = $Data.language
            $ProjectId = $Data.projectId
            
            if (-not $Code) {
                $Response.ContentType = 'application/json'
                $Response.StatusCode = 400
                $errorBody = @{ 'error' = 'Code is required' } | ConvertTo-Json
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorBody)
                $Response.ContentLength64 = $buffer.Length
                $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                $Response.Close()
                return
            }
            
            # Simulate AI processing
            Start-Sleep -Milliseconds 1500
            
            $Analysis = Get-AIAnalysis $Code $Language $ProjectId
            $Global:Analyses[$Analysis.id] = $Analysis
            
            if ($ProjectId -and $Global:Projects.ContainsKey($ProjectId)) {
                $Global:Projects[$ProjectId].analyses += $Analysis.id
                $Global:Projects[$ProjectId].updatedAt = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
            }
            
            $Response.ContentType = 'application/json'
            $Response.StatusCode = 200
            $body = $Analysis | ConvertTo-Json -Depth 10
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
            $Response.ContentLength64 = $buffer.Length
            $Response.OutputStream.Write($buffer, 0, $buffer.Length)
            $Response.Close()
            Write-Host "✅ Code analysis served" -ForegroundColor Green
            return
        }
        
        if ($Request.HttpMethod -eq 'POST' -and $Url -eq '/api/tools/generate-code') {
            $Reader = New-Object System.IO.StreamReader($Request.InputStream)
            $Body = $Reader.ReadToEnd()
            $Data = $Body | ConvertFrom-Json
            
            $Description = $Data.description
            $Language = $Data.language
            
            if (-not $Description) {
                $Response.ContentType = 'application/json'
                $Response.StatusCode = 400
                $errorBody = @{ 'error' = 'Description is required' } | ConvertTo-Json
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorBody)
                $Response.ContentLength64 = $buffer.Length
                $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                $Response.Close()
                return
            }
            
            Start-Sleep -Milliseconds 2000
            
            $GeneratedCode = Get-GeneratedCode $Description $Language
            
            $Response.ContentType = 'application/json'
            $Response.StatusCode = 200
            $body = @{
                'code' = $GeneratedCode
                'language' = $Language
            } | ConvertTo-Json -Depth 10
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
            $Response.ContentLength64 = $buffer.Length
            $Response.OutputStream.Write($buffer, 0, $buffer.Length)
            $Response.Close()
            Write-Host "✅ Code generation served" -ForegroundColor Green
            return
        }
        
        if ($Request.HttpMethod -eq 'POST' -and $Url -eq '/api/tools/security-scan') {
            $Reader = New-Object System.IO.StreamReader($Request.InputStream)
            $Body = $Reader.ReadToEnd()
            $Data = $Body | ConvertFrom-Json
            
            $Code = $Data.code
            
            if (-not $Code) {
                $Response.ContentType = 'application/json'
                $Response.StatusCode = 400
                $errorBody = @{ 'error' = 'Code is required' } | ConvertTo-Json
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorBody)
                $Response.ContentLength64 = $buffer.Length
                $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                $Response.Close()
                return
            }
            
            Start-Sleep -Milliseconds 1500
            
            $SecurityReport = Get-SecurityReport $Code
            
            $Response.ContentType = 'application/json'
            $Response.StatusCode = 200
            $body = $SecurityReport | ConvertTo-Json -Depth 10
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
            $Response.ContentLength64 = $buffer.Length
            $Response.OutputStream.Write($buffer, 0, $buffer.Length)
            $Response.Close()
            Write-Host "✅ Security scan served" -ForegroundColor Green
            return
        }
        
        # Default response for other endpoints
        $Response.ContentType = 'application/json'
        $Response.StatusCode = 404
        $body = @{ 'error' = 'Endpoint not found' } | ConvertTo-Json
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
        $Response.ContentLength64 = $buffer.Length
        $Response.OutputStream.Write($buffer, 0, $buffer.Length)
        $Response.Close()
        Write-Host "❌ Endpoint not found: $Url" -ForegroundColor Red
        
    } catch {
        Write-Host "⚠️ Error handling request: $_" -ForegroundColor Red
        $Response.ContentType = 'application/json'
        $Response.StatusCode = 500
        $body = @{ 'error' = 'Internal server error'; 'details' = $_.Exception.Message } | ConvertTo-Json
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
        $Response.ContentLength64 = $buffer.Length
        $Response.OutputStream.Write($buffer, 0, $buffer.Length)
        $Response.Close()
    }
}

# Main Server Function
function Start-BackendServer {
    Write-Host "🚀 Starting Guaranteed Backend Server..." -ForegroundColor Green
    Write-Host "📁 Root Path: $RootPath" -ForegroundColor Yellow
    Write-Host "🌐 Server URL: http://localhost:$Port" -ForegroundColor Green
    Write-Host ""
    
    # Initialize demo data
    Initialize-DemoData
    
    # Create HTTP listener
    $Listener = New-Object System.Net.HttpListener
    $Listener.Prefixes.Add("http://localhost:$Port/")
    
    try {
        $Listener.Start()
        Write-Host "✅ Backend server started successfully!" -ForegroundColor Green
        Write-Host "🌐 API available at: http://localhost:$Port" -ForegroundColor Cyan
        Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Available endpoints:" -ForegroundColor White
        Write-Host "   • GET  /api/health - Health check" -ForegroundColor Gray
        Write-Host "   • POST /api/analyze - AI code analysis" -ForegroundColor Gray
        Write-Host "   • POST /api/tools/generate-code - Code generation" -ForegroundColor Gray
        Write-Host "   • POST /api/tools/security-scan - Security scanning" -ForegroundColor Gray
        Write-Host ""
        
        # Open health check in browser
        Start-Process "http://localhost:$Port/api/health"
        
        # Server loop
        while ($Listener.IsListening) {
            try {
                $Context = $Listener.GetContext()
                Handle-Request -Context $Context
            } catch {
                Write-Host "⚠️ Server error: $_" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host "❌ Failed to start server: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔄 Alternative:" -ForegroundColor Yellow
        Write-Host "   1. Check if port $Port is in use" -ForegroundColor Gray
        Write-Host "   2. Try running as Administrator" -ForegroundColor Gray
        Write-Host "   3. Use frontend with simulated responses" -ForegroundColor Gray
    } finally {
        if ($Listener.IsListening) {
            $Listener.Stop()
            Write-Host ""
            Write-Host "🛑 Backend server stopped" -ForegroundColor Yellow
        }
    }
}

# Start the server
Start-BackendServer

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
