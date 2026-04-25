# PowerShell Web Server for Zenvora AI Platform
# This creates a robust HTTP server using built-in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Zenvora AI Platform Web Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$Port = 8080
$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "🚀 Starting Zenvora AI Platform Server..." -ForegroundColor Green
Write-Host "📁 Root Path: $RootPath" -ForegroundColor Yellow
Write-Host "🌐 Server URL: http://localhost:$Port" -ForegroundColor Green
Write-Host ""

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
    Write-Host "✅ Server started successfully!" -ForegroundColor Green
    Write-Host "🌐 Visit: http://localhost:$Port" -ForegroundColor Cyan
    Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Available pages:" -ForegroundColor White
    Write-Host "   • Main Page: http://localhost:$Port/LAUNCH_NOW.html" -ForegroundColor Gray
    Write-Host "   • AI Editor:  http://localhost:$Port/app_enhanced.html" -ForegroundColor Gray
    Write-Host "   • AI Tools:   http://localhost:$Port/ai_tools.html" -ForegroundColor Gray
    Write-Host ""

    # Open browser automatically
    Start-Process "http://localhost:$Port/LAUNCH_NOW.html"

    # Server loop
    $requestCount = 0
    while ($listener.IsListening -and $requestCount -lt 100) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            # Get requested path
            $url = $request.Url.LocalPath
            if ($url -eq "/") { $url = "/LAUNCH_NOW.html" }

            $filePath = Join-Path $RootPath $url.TrimStart('/')
            
            # Serve file
            if (Test-Path $filePath -PathType Leaf) {
                $content = Get-Content $filePath -Raw
                $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
                
                # Set content type based on file extension
                switch ($extension) {
                    ".html" { $contentType = "text/html; charset=utf-8" }
                    ".css" { $contentType = "text/css; charset=utf-8" }
                    ".js" { $contentType = "application/javascript; charset=utf-8" }
                    ".json" { $contentType = "application/json; charset=utf-8" }
                    ".png" { $contentType = "image/png" }
                    ".jpg" { $contentType = "image/jpeg" }
                    ".gif" { $contentType = "image/gif" }
                    ".svg" { $contentType = "image/svg+xml" }
                    default { $contentType = "text/plain; charset=utf-8" }
                }
                
                $response.ContentType = $contentType
                $response.StatusCode = 200
                $requestCount++
                Write-Host "✅ Served: $url" -ForegroundColor Green
            } else {
                # File not found - serve default page
                $defaultPath = Join-Path $RootPath "LAUNCH_NOW.html"
                if (Test-Path $defaultPath) {
                    $content = Get-Content $defaultPath -Raw
                    $response.ContentType = "text/html; charset=utf-8"
                    $response.StatusCode = 200
                    $requestCount++
                    Write-Host "🔄 Redirected to: $url -> LAUNCH_NOW.html" -ForegroundColor Yellow
                } else {
                    $content = "<h1>Zenvora AI Platform</h1><p>File not found: $url</p><p>Try <a href='/LAUNCH_NOW.html'>Main Page</a></p>"
                    $response.ContentType = "text/html; charset=utf-8"
                    $response.StatusCode = 404
                    Write-Host "❌ Not found: $url" -ForegroundColor Red
                }
            }

            # Send response
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.Close()

        } catch {
            Write-Host "⚠️ Error serving request: $_" -ForegroundColor Red
        }
    }

} catch {
    Write-Host "❌ Failed to start server: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔄 Alternative methods:" -ForegroundColor Yellow
    Write-Host "   1. Double-click LAUNCH_NOW.html directly" -ForegroundColor Gray
    Write-Host "   2. Use UNIVERSAL_SERVER.bat" -ForegroundColor Gray
    Write-Host "   3. Use EMERGENCY_FIX.bat" -ForegroundColor Gray
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
        Write-Host ""
        Write-Host "🛑 Server stopped" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Server completed!" -ForegroundColor Green
