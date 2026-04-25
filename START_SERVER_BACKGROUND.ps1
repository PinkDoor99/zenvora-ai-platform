# Simple Background Server Launcher
Write-Host "Starting Zenvora AI Platform Server..." -ForegroundColor Cyan

# Start PowerShell HTTP listener as background job
$scriptBlock = {
    $port = 8000
    $dir = $PSScriptRoot
    Set-Location $dir
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
    Write-Host "Server listening on port $port"
    
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

$job = Start-Job -ScriptBlock $scriptBlock -Name "ZenvoraServer"

Write-Host "Server started as background job" -ForegroundColor Green
Write-Host "Access at: http://localhost:8000/ZENVORA_WINDSURF.html" -ForegroundColor Cyan
Write-Host "Job ID: $($job.Id)" -ForegroundColor White
Write-Host ""
Write-Host "Server will continue running even if you close this window" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop server: Stop-Job -Name ZenvoraServer" -ForegroundColor Gray
Write-Host "To check status: Get-Job" -ForegroundColor Gray
Write-Host ""

# Open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:8000/ZENVORA_WINDSURF.html"

Write-Host "Browser opened" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit (server continues running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
