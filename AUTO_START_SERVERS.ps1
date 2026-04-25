# Auto Start All Servers - Frontend and Backend
Write-Host "Starting Zenvora AI Platform Servers..." -ForegroundColor Cyan
Write-Host ""

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendScript = {
    $port = 8000
    $dir = $PSScriptRoot
    Set-Location $dir
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
        } catch {
            # Handle connection errors gracefully
        }
    }
}

$frontendJob = Start-Job -ScriptBlock $frontendScript -Name "ZenvoraFrontend"
Write-Host "Frontend server started (Job ID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host "Access: http://localhost:8000/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
Write-Host ""

# Start Backend Server (if exists)
$backendPath = Join-Path $PSScriptRoot "server.js"
if (Test-Path $backendPath) {
    Write-Host "Starting Backend Server..." -ForegroundColor Yellow
    
    $backendScript = {
        $dir = $PSScriptRoot
        Set-Location $dir
        if (Get-Command node -ErrorAction SilentlyContinue) {
            node server.js
        } else {
            Write-Host "Node.js not found"
        }
    }
    
    $backendJob = Start-Job -ScriptBlock $backendScript -Name "ZenvoraBackend"
    Write-Host "Backend server started (Job ID: $($backendJob.Id))" -ForegroundColor Green
} else {
    Write-Host "No backend server found (server.js)" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "Servers running as background jobs" -ForegroundColor Green
Write-Host "They will continue running even if you close this window" -ForegroundColor Yellow
Write-Host ""

# Open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:8000/ZENVORA_WINDSURF.html"
Write-Host "Browser opened" -ForegroundColor Green
Write-Host ""

Write-Host "To stop servers:" -ForegroundColor Yellow
Write-Host "  Stop-Job -Name ZenvoraFrontend" -ForegroundColor Gray
Write-Host "  Stop-Job -Name ZenvoraBackend" -ForegroundColor Gray
Write-Host ""
Write-Host "To check status:" -ForegroundColor Yellow
Write-Host "  Get-Job" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit (servers continue running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
