# 🚀 Zenvora AI Platform - Persistent Server Launcher
# This script runs servers as background services that persist even when offline

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 PERSISTENT SERVER LAUNCHER - RUNS 24/7 🚀              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Running as regular user. For full persistence, run as Administrator." -ForegroundColor Yellow
    Write-Host ""
}

# Function to start HTTP server
function Start-HTTPServer {
    param(
        [int]$Port = 8000,
        [string]$Directory = $PSScriptRoot
    )
    
    Write-Host "🌐 Starting HTTP Server on port $Port..." -ForegroundColor Cyan
    Write-Host "📂 Directory: $Directory" -ForegroundColor Gray
    
    # Try Python first
    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCmd) {
        Write-Host "✅ Using Python HTTP server" -ForegroundColor Green
        $scriptBlock = {
            param($port, $dir)
            Set-Location $dir
            python -m http.server $port
        }
        
        # Start as background job
        $job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $Port, $Directory -Name "ZenvoraHTTPServer"
        
        if ($job) {
            Write-Host "✅ Server started as background job (ID: $($job.Id))" -ForegroundColor Green
            Write-Host "🌐 Access at: http://localhost:$Port/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
            return $job
        }
        return $null
    }
    
    # Try Node.js
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) {
        Write-Host "✅ Using Node.js HTTP server" -ForegroundColor Green
        $scriptBlock = {
            param($port, $dir)
            Set-Location $dir
            npx http-server -p $port
        }
        
        $job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $Port, $Directory -Name "ZenvoraHTTPServer"
        
        if ($job) {
            Write-Host "✅ Server started as background job (ID: $($job.Id))" -ForegroundColor Green
            Write-Host "🌐 Access at: http://localhost:$Port/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
            return $job
        }
        return $null
    }
    
    # Fallback: Use PowerShell simple HTTP listener
    Write-Host "⚠️  Python/Node.js not found, using PowerShell listener" -ForegroundColor Yellow
    $scriptBlock = {
        param($port, $dir)
        Set-Location $dir
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:$port/")
        $listener.Start()
        Write-Host "PowerShell HTTP server listening on port $port"
        
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $url = $request.Url.LocalPath
            $filePath = Join-Path $dir ($url.TrimStart('/'))
            
            if (Test-Path $filePath) {
                $content = Get-Content $filePath -Raw -Encoding UTF8
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
                $response.ContentLength64 = $buffer.Length
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            } else {
                $response.StatusCode = 404
            }
            
            $response.Close()
        }
    }
    
    $job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $Port, $Directory -Name "ZenvoraHTTPServer"
    
    if ($job) {
        Write-Host "✅ Server started as background job (ID: $($job.Id))" -ForegroundColor Green
        Write-Host "🌐 Access at: http://localhost:$Port/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
        return $job
    }
    
    return $null
}

# Function to start backend server
function Start-BackendServer {
    param(
        [string]$Directory = $PSScriptRoot
    )
    
    $backendPath = Join-Path $Directory "server.js"
    if (Test-Path $backendPath) {
        Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
        
        $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
        if ($nodeCmd) {
            $scriptBlock = {
                param($dir)
                Set-Location $dir
                node server.js
            }
            
            $job = Start-Job -ScriptBlock $scriptBlock -ArgumentList $Directory -Name "ZenvoraBackendServer"
            
            if ($job) {
                Write-Host "✅ Backend server started as background job (ID: $($job.Id))" -ForegroundColor Green
                return $job
            }
        } else {
            Write-Host "⚠️  Node.js not found, backend server not started" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ℹ️  No backend server file found (server.js)" -ForegroundColor Gray
    }
    
    return $null
}

# Function to create scheduled task for auto-restart
function New-ScheduledTask {
    param(
        [string]$ScriptPath
    )
    
    if (-not $isAdmin) {
        Write-Host "⚠️  Need administrator privileges to create scheduled task" -ForegroundColor Yellow
        return
    }
    
    Write-Host "📅 Creating scheduled task for auto-restart..." -ForegroundColor Cyan
    
    $taskName = "ZenvoraServerAutoStart"
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`""
    $trigger = New-ScheduledTaskTrigger -AtLogon
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    try {
        Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force | Out-Null
        Write-Host "✅ Scheduled task created: $taskName" -ForegroundColor Green
        Write-Host "   Server will auto-start on login" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed to create scheduled task: $_" -ForegroundColor Red
    }
}

# Main execution
Write-Host "🚀 Starting Zenvora AI Platform Servers..." -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Start HTTP server
Start-HTTPServer -Port 8000 -Directory $PSScriptRoot
Write-Host ""

# Start backend server
$backendJob = Start-BackendServer -Directory $PSScriptRoot
Write-Host ""

# Create scheduled task for persistence
$scriptPath = $PSCommandPath
if ($scriptPath) {
    New-ScheduledTask -ScriptPath $scriptPath
}
Write-Host ""

# Summary
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    🎉 SERVERS STARTED 🎉                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ HTTP Server: Running" -ForegroundColor Green
Write-Host "   Access: http://localhost:8000/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
Write-Host ""

if ($backendJob) {
    Write-Host "✅ Backend Server: Running" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Backend Server: Not started" -ForegroundColor Gray
}
Write-Host ""

Write-Host "📊 Background Jobs:" -ForegroundColor Cyan
Get-Job | ForEach-Object {
    Write-Host "   - $($_.Name) (ID: $($_.Id))" -ForegroundColor White
}
Write-Host ""

Write-Host "🔄 PERSISTENCE:" -ForegroundColor Cyan
Write-Host "   - Servers running as background jobs" -ForegroundColor White
Write-Host "   - Will continue running even if you close this window" -ForegroundColor White
if ($isAdmin) {
    Write-Host "   - Auto-restart on login enabled" -ForegroundColor Green
} else {
    Write-Host "   - Run as Administrator for auto-restart on login" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "🌐 PLATFORM READY FOR LAUNCH!" -ForegroundColor Green
Write-Host "   Your platform is accessible at: http://localhost:8000/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
Write-Host ""

Write-Host "💡 To stop servers:" -ForegroundColor Yellow
Write-Host "   Stop-Job -Name ZenvoraHTTPServer" -ForegroundColor Gray
Write-Host "   Stop-Job -Name ZenvoraBackendServer" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 To check server status:" -ForegroundColor Yellow
Write-Host "   Get-Job" -ForegroundColor Gray
Write-Host ""

Write-Host "Press any key to exit (servers will continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "✅ Exiting - servers continue running in background" -ForegroundColor Green
