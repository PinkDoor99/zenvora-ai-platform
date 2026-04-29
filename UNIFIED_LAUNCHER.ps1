# Unified Launcher - Frontend + Backend Servers
# Runs both servers and auto-starts on system boot

Write-Host "Starting Zenvora AI Platform..." -ForegroundColor Cyan
Write-Host ""

$scriptDir = $PSScriptRoot
$frontendPort = 8888
$backendPort = 3001

# Function to start frontend server (runs in foreground)
function Start-FrontendServer {
    Write-Host "Starting Frontend Server on port $frontendPort..." -ForegroundColor Cyan
    Write-Host "Directory: $scriptDir" -ForegroundColor Gray
    
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$frontendPort/")
    $listener.Start()
    
    Write-Host "Frontend server listening on port $frontendPort" -ForegroundColor Green
    Write-Host "Access: http://localhost:$frontendPort/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
    
    return $listener
}

# Function to start backend server
function Start-BackendServer {
    Write-Host "Starting Backend Server on port $backendPort..." -ForegroundColor Cyan
    
    $backendPath = Join-Path $scriptDir "backend\server.js"
    if (-not (Test-Path $backendPath)) {
        $backendPath = Join-Path $scriptDir "server.js"
    }
    
    if (Test-Path $backendPath) {
        $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
        if ($nodeCmd) {
            $backendScript = {
                param($dir, $port)
                Set-Location $dir
                $env:PORT = $port
                if (Test-Path "backend\server.js") {
                    Set-Location "backend"
                    node server.js
                } else {
                    node server.js
                }
            }
            
            $job = Start-Job -ScriptBlock $backendScript -ArgumentList $scriptDir, $backendPort -Name "ZenvoraBackend"
            Write-Host "Backend server started (Job ID: $($job.Id))" -ForegroundColor Green
            Write-Host "API: http://localhost:$backendPort/api" -ForegroundColor Cyan
            return $job
        } else {
            Write-Host "Node.js not found, backend not started" -ForegroundColor Yellow
            return $null
        }
    } else {
        Write-Host "No backend server file found" -ForegroundColor Gray
        return $null
    }
}

# Function to create Windows service for auto-start
function New-SystemService {
    Write-Host "Setting up auto-start on system boot..." -ForegroundColor Cyan
    
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "Need administrator privileges for auto-start" -ForegroundColor Yellow
        Write-Host "Run this script as Administrator to enable auto-start" -ForegroundColor Yellow
        return
    }
    
    # Create scheduled task
    $taskName = "ZenvoraAutoStart"
    $scriptPath = $PSCommandPath
    
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable
    
    try {
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
        Write-Host "Auto-start enabled - servers will start on system boot" -ForegroundColor Green
    } catch {
        Write-Host "Failed to create scheduled task: $_" -ForegroundColor Red
    }
}

# Main execution
Write-Host "Starting Zenvora AI Platform..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Start backend server (as background job)
$backendJob = Start-BackendServer
Write-Host ""

# Start frontend server (in foreground)
$frontendListener = Start-FrontendServer
Write-Host ""

# Setup auto-start
New-SystemService
Write-Host ""

# Summary
Write-Host "PLATFORM STARTED" -ForegroundColor Green
Write-Host ""

Write-Host "Frontend Server: Running" -ForegroundColor Green
Write-Host "URL: http://localhost:$frontendPort/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
Write-Host ""

if ($backendJob) {
    Write-Host "Backend Server: Running" -ForegroundColor Green
    Write-Host "API: http://localhost:$backendPort/api" -ForegroundColor Cyan
} else {
    Write-Host "Backend Server: Not running" -ForegroundColor Gray
}
Write-Host ""

Write-Host "AUTO-START:" -ForegroundColor Cyan
Write-Host "- Frontend server running in foreground" -ForegroundColor White
Write-Host "- Backend server running as background job (if available)" -ForegroundColor White
Write-Host "- Auto-start on system boot enabled (if run as Admin)" -ForegroundColor Green
Write-Host ""

Write-Host "PLATFORM READY!" -ForegroundColor Green
Write-Host "Access at: http://localhost:$frontendPort/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
Write-Host ""

# Open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:$frontendPort/ZENVORA_WINDSURF.html"
Write-Host "Browser opened" -ForegroundColor Green
Write-Host ""

Write-Host "Press Ctrl+C to stop the server..." -ForegroundColor Yellow
Write-Host ""

# Main server loop (foreground)
while ($frontendListener.IsListening) {
    try {
        $context = $frontendListener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $url = $request.Url.LocalPath
        if ($url -eq "/") {
            $url = "/ZENVORA_WINDSURF.html"
        }
        
        $filePath = Join-Path $scriptDir ($url.TrimStart('/'))
        
        Write-Host "Request: $url -> $filePath" -ForegroundColor Gray
        
        if (Test-Path $filePath) {
            try {
                $content = [System.IO.File]::ReadAllText($filePath)
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                $response.ContentLength64 = $buffer.Length
                $response.ContentType = "text/html"
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                Write-Host "Served: $($buffer.Length) bytes" -ForegroundColor Green
            } catch {
                Write-Host "Error serving file: $_" -ForegroundColor Red
                $response.StatusCode = 500
            }
        } else {
            Write-Host "File not found: $filePath" -ForegroundColor Yellow
            $response.StatusCode = 404
        }
        
        $response.Close()
    } catch {
        Write-Host "Connection error: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Server stopped" -ForegroundColor Yellow
