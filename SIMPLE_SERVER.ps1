# Simple HTTP Server for Zenvora AI Platform
$port = 3000
$dir = $PSScriptRoot

Write-Host "Starting server on port $port..." -ForegroundColor Cyan
Write-Host "Directory: $dir" -ForegroundColor Gray

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Server started. Access at: http://localhost:$port/ZENVORA_WINDSURF.html" -ForegroundColor Green
Write-Host ""

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $url = $request.Url.LocalPath
    if ($url -eq "/") {
        $url = "/ZENVORA_WINDSURF.html"
    }
    
    $filePath = Join-Path $dir ($url.TrimStart('/'))
    
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
}
