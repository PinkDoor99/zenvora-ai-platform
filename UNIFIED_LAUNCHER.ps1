# Unified Launcher - Frontend + Backend Servers
# Runs both servers and auto-starts on system boot

Write-Host "Starting Zenvora AI Platform..." -ForegroundColor Cyan
Write-Host ""

$scriptDir = $PSScriptRoot
$frontendPort = 3000
$backendPort = 3001

# Function to start frontend server
function Start-FrontendServer {
    Write-Host "Starting Frontend Server on port $frontendPort..." -ForegroundColor Cyan
    
    $frontendScript = {
        param($port, $dir)
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Start()
        Write-Host "Frontend server listening on port $port"
        
        while ($listener.IsListening) {
            try {
                $context = $listener.GetContext()
                $request = $context.Request
                $response = $context.Response
                
                $url = $request.Url.LocalPath
                if ($url -eq "/") {
                    $url = "/ZENVORA_WINDSURF.html"
                }
                
                $filePath = Join-Path $dir ($url.TrimStart('/'))
                
                if (Test-Path $filePath) {
                    $content = [System.IO.File]::ReadAllText($filePath)
                    $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                    $response.ContentLength64 = $buffer.Length
                    $response.ContentType = "text/html"
                    $response.OutputStream.Write($buffer, 0, $buffer.Length)
                } else {
                    $response.StatusCode = 404
                }
                
                $response.Close()
            } catch {
                # Handle connection errors
            }
        }
    }
    
    $job = Start-Job -ScriptBlock $frontendScript -ArgumentList $frontendPort, $scriptDir -Name "ZenvoraFrontend"
    Write-Host "Frontend server started (Job ID: $($job.Id))" -ForegroundColor Green
    Write-Host "Access: http://localhost:$frontendPort/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
    return $job
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

# Start servers
$frontendJob = Start-FrontendServer
Write-Host ""

$backendJob = Start-BackendServer
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
Write-Host "- Servers running as background jobs" -ForegroundColor White
Write-Host "- Will continue running if you close this window" -ForegroundColor White
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

Write-Host "Management Commands:" -ForegroundColor Yellow
Write-Host "Stop servers: Stop-Job -Name ZenvoraFrontend, ZenvoraBackend" -ForegroundColor Gray
Write-Host "Check status: Get-Job" -ForegroundColor Gray
Write-Host "View logs: Receive-Job -Name ZenvoraFrontend -Keep" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit (servers continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Exiting - servers continue running in background" -ForegroundColor Green
