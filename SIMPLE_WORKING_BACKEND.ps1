# Simple Working Backend Server for Zenvora AI Platform
# Uses only built-in Windows PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Simple Working Backend Server" -ForegroundColor Cyan
Write-Host "    Zenvora AI Platform" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$Port = 3001

function Start-Server {
    Write-Host "🚀 Starting Simple Backend Server..." -ForegroundColor Green
    Write-Host "🌐 Server URL: http://localhost:$Port" -ForegroundColor Green
    Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    $Listener = New-Object System.Net.HttpListener
    $Listener.Prefixes.Add("http://localhost:$Port/")
    
    try {
        $Listener.Start()
        Write-Host "✅ Backend server started successfully!" -ForegroundColor Green
        Write-Host "🌐 API available at: http://localhost:$Port" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Available endpoints:" -ForegroundColor White
        Write-Host "   • GET  /api/health - Health check" -ForegroundColor Gray
        Write-Host "   • POST /api/analyze - AI code analysis" -ForegroundColor Gray
        Write-Host "   • POST /api/tools/generate-code - Code generation" -ForegroundColor Gray
        Write-Host "   • POST /api/tools/security-scan - Security scanning" -ForegroundColor Gray
        Write-Host ""
        
        # Open health check in browser
        Start-Process "http://localhost:$Port/api/health"
        
        while ($Listener.IsListening) {
            try {
                $Context = $Listener.GetContext()
                $Request = $Context.Request
                $Response = $Context.Response
                $Url = $Request.Url.LocalPath
                
                # Set CORS headers
                $Response.Headers.Add("Access-Control-Allow-Origin", "*")
                $Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
                $Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type")
                
                if ($Request.HttpMethod -eq "OPTIONS") {
                    $Response.StatusCode = 200
                    $Response.Close()
                    continue
                }
                
                if ($Url -eq "/api/health") {
                    $Response.ContentType = "application/json"
                    $Response.StatusCode = 200
                    $body = @{
                        "status" = "healthy"
                        "timestamp" = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
                        "version" = "1.0.0"
                        "backend" = "PowerShell Simple Server"
                    } | ConvertTo-Json -Depth 10
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
                    $Response.ContentLength64 = $buffer.Length
                    $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                    $Response.Close()
                    Write-Host "✅ Health check served" -ForegroundColor Green
                    continue
                }
                
                if ($Request.HttpMethod -eq "POST" -and $Url -eq "/api/analyze") {
                    $Reader = New-Object System.IO.StreamReader($Request.InputStream)
                    $Body = $Reader.ReadToEnd()
                    $Data = $Body | ConvertFrom-Json
                    
                    $Code = $Data.code
                    $Language = $Data.language
                    
                    if (-not $Code) {
                        $Response.ContentType = "application/json"
                        $Response.StatusCode = 400
                        $errorBody = @{ "error" = "Code is required" } | ConvertTo-Json
                        $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorBody)
                        $Response.ContentLength64 = $buffer.Length
                        $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                        $Response.Close()
                        continue
                    }
                    
                    # Simulate AI processing
                    Start-Sleep -Milliseconds 1500
                    
                    $lines = $Code -split "`n"
                    $functions = ($lines | Where-Object { $_ -match "function|=>" }).Count
                    $comments = ($lines | Where-Object { $_ -match "^\s*//|/\*" }).Count
                    
                    $complexity = 1
                    $indicators = @("if", "for", "while", "switch", "catch", "&&", "\|\|")
                    foreach ($indicator in $indicators) {
                        $complexity += ([regex]::Matches($Code, $indicator)).Count
                    }
                    $complexity = [math]::Round($complexity * 1.5, 1)
                    
                    $maintainability = 50 + (($comments / [math]::Max(1, $lines.Count)) * 30)
                    $maintainability = [math]::Min(100, [math]::Round($maintainability))
                    
                    $testCoverage = [math]::Min(95, [math]::Round(($functions / [math]::Max(1, $functions)) * 100))
                    
                    $securityScore = 10
                    if ($Code -match "eval") { $securityScore -= 3 }
                    if ($Code -match "innerHTML") { $securityScore -= 2 }
                    if ($Code -match "document\.write") { $securityScore -= 3 }
                    if ($Code -notmatch "try|catch") { $securityScore -= 1 }
                    $securityScore = [math]::Max(1, $securityScore)
                    
                    $suggestions = @()
                    if ($Code -match "var\s+") { $suggestions += "Use const/let instead of var for better scoping" }
                    if ($Code -match "console\.log" -and $Code -notmatch "logger") { $suggestions += "Use proper logging system instead of console.log" }
                    if ($Code -notmatch "try|catch") { $suggestions += "Add error handling with try-catch blocks" }
                    
                    $issues = @()
                    for ($i = 0; $i -lt $lines.Count; $i++) {
                        $line = $lines[$i]
                        $lineNumber = $i + 1
                        if ($line -match "eval") {
                            $issues += @{ "type" = "error"; "message" = "Use of eval() function detected"; "line" = $lineNumber }
                        }
                        if ($line -match "innerHTML") {
                            $issues += @{ "type" = "warning"; "message" = "Potential XSS risk with innerHTML"; "line" = $lineNumber }
                        }
                        if ($line -match "var\s+") {
                            $issues += @{ "type" = "info"; "message" = "Consider using const/let instead of var"; "line" = $lineNumber }
                        }
                    }
                    
                    $analysis = @{
                        "id" = [System.Guid]::NewGuid().ToString()
                        "projectId" = $Data.projectId
                        "code" = $Code
                        "language" = $Language
                        "metrics" = @{
                            "complexity" = $complexity
                            "maintainability" = $maintainability
                            "testCoverage" = $testCoverage
                            "securityScore" = $securityScore
                            "lines" = $lines.Count
                            "functions" = $functions
                            "comments" = $comments
                        }
                        "suggestions" = $suggestions
                        "issues" = $issues
                        "createdAt" = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
                    }
                    
                    $Response.ContentType = "application/json"
                    $Response.StatusCode = 200
                    $body = $analysis | ConvertTo-Json -Depth 10
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
                    $Response.ContentLength64 = $buffer.Length
                    $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                    $Response.Close()
                    Write-Host "✅ Code analysis served" -ForegroundColor Green
                    continue
                }
                
                if ($Request.HttpMethod -eq "POST" -and $Url -eq "/api/tools/generate-code") {
                    $Reader = New-Object System.IO.StreamReader($Request.InputStream)
                    $Body = $Reader.ReadToEnd()
                    $Data = $Body | ConvertFrom-Json
                    
                    $Description = $Data.description
                    $Language = $Data.language
                    
                    if (-not $Description) {
                        $Response.ContentType = "application/json"
                        $Response.StatusCode = 400
                        $errorBody = @{ "error" = "Description is required" } | ConvertTo-Json
                        $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorBody)
                        $Response.ContentLength64 = $buffer.Length
                        $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                        $Response.Close()
                        continue
                    }
                    
                    Start-Sleep -Milliseconds 2000
                    
                    $generatedCode = @"
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
                    
                    $Response.ContentType = "application/json"
                    $Response.StatusCode = 200
                    $body = @{
                        "code" = $generatedCode
                        "language" = $Language
                    } | ConvertTo-Json -Depth 10
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
                    $Response.ContentLength64 = $buffer.Length
                    $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                    $Response.Close()
                    Write-Host "✅ Code generation served" -ForegroundColor Green
                    continue
                }
                
                if ($Request.HttpMethod -eq "POST" -and $Url -eq "/api/tools/security-scan") {
                    $Reader = New-Object System.IO.StreamReader($Request.InputStream)
                    $Body = $Reader.ReadToEnd()
                    $Data = $Body | ConvertFrom-Json
                    
                    $Code = $Data.code
                    
                    if (-not $Code) {
                        $Response.ContentType = "application/json"
                        $Response.StatusCode = 400
                        $errorBody = @{ "error" = "Code is required" } | ConvertTo-Json
                        $buffer = [System.Text.Encoding]::UTF8.GetBytes($errorBody)
                        $Response.ContentLength64 = $buffer.Length
                        $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                        $Response.Close()
                        continue
                    }
                    
                    Start-Sleep -Milliseconds 1500
                    
                    $vulnerabilities = @()
                    if ($Code -match "eval") { $vulnerabilities += "HIGH: Use of eval() function detected - potential code injection risk" }
                    if ($Code -match "innerHTML") { $vulnerabilities += "MEDIUM: innerHTML usage detected - potential XSS risk" }
                    if ($Code -match "document\.write") { $vulnerabilities += "HIGH: document.write() detected - potential XSS risk" }
                    if ($Code -notmatch "try|catch") { $vulnerabilities += "LOW: No error handling detected" }
                    
                    $securityReport = @{
                        "status" = if ($vulnerabilities.Count -eq 0) { "SECURE" } else { "VULNERABILITIES FOUND" }
                        "riskLevel" = if ($vulnerabilities -match "HIGH") { "HIGH" } else { "MEDIUM" }
                        "vulnerabilities" = $vulnerabilities
                        "recommendations" = @(
                            "Address HIGH priority issues immediately",
                            "Implement input sanitization",
                            "Use secure coding practices",
                            "Add proper error handling",
                            "Regular security audits"
                        )
                    }
                    
                    $Response.ContentType = "application/json"
                    $Response.StatusCode = 200
                    $body = $securityReport | ConvertTo-Json -Depth 10
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
                    $Response.ContentLength64 = $buffer.Length
                    $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                    $Response.Close()
                    Write-Host "✅ Security scan served" -ForegroundColor Green
                    continue
                }
                
                # Default response
                $Response.ContentType = "application/json"
                $Response.StatusCode = 404
                $body = @{ "error" = "Endpoint not found" } | ConvertTo-Json
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
                $Response.ContentLength64 = $buffer.Length
                $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                $Response.Close()
                Write-Host "❌ Endpoint not found: $Url" -ForegroundColor Red
                
            } catch {
                Write-Host "⚠️ Error handling request: $_" -ForegroundColor Red
                $Response.ContentType = "application/json"
                $Response.StatusCode = 500
                $body = @{ "error" = "Internal server error"; "details" = $_.Exception.Message } | ConvertTo-Json
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($body)
                $Response.ContentLength64 = $buffer.Length
                $Response.OutputStream.Write($buffer, 0, $buffer.Length)
                $Response.Close()
            }
        }
        
    } catch {
        Write-Host "❌ Failed to start server: $_" -ForegroundColor Red
    } finally {
        if ($Listener.IsListening) {
            $Listener.Stop()
            Write-Host ""
            Write-Host "🛑 Backend server stopped" -ForegroundColor Yellow
        }
    }
}

Start-Server
