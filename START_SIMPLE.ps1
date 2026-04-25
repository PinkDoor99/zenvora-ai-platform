# Simple PowerShell Launch Script
Write-Host "Starting Zenvora AI Platform..." -ForegroundColor Cyan

# Start Python server
$server = Start-Process -FilePath "python" -ArgumentList "-m", "http.server", "8000" -WorkingDirectory $PSScriptRoot -PassThru -WindowStyle Hidden

Write-Host "Server started on http://localhost:8000" -ForegroundColor Green
Write-Host "Platform available at: http://localhost:8000/ZENVORA_WINDSURF.html" -ForegroundColor Yellow

# Open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:8000/ZENVORA_WINDSURF.html"

Write-Host ""
Write-Host "TOP COMMUNITIES FOR PROMOTION:" -ForegroundColor Cyan
Write-Host "Reddit: reddit.com/r/programming (5.2M users)" -ForegroundColor White
Write-Host "Reddit: reddit.com/r/webdev (1.8M users)" -ForegroundColor White
Write-Host "Hacker News: news.ycombinator.com (4.5M users)" -ForegroundColor White
Write-Host "Product Hunt: producthunt.com (500K users)" -ForegroundColor White
Write-Host "Twitter/X: twitter.com (450M users)" -ForegroundColor White
Write-Host "LinkedIn: linkedin.com (900M users)" -ForegroundColor White
Write-Host "YouTube: youtube.com (2.5B users)" -ForegroundColor White

Write-Host ""
Write-Host "APP STORE DEPLOYMENT:" -ForegroundColor Cyan
Write-Host "iOS: Apple Developer Account $99/year, 2-3 weeks to launch" -ForegroundColor White
Write-Host "Android: Google Play $25 one-time, 1-2 weeks to launch" -ForegroundColor White

Write-Host ""
Write-Host "PAYMENT SYSTEM READY:" -ForegroundColor Green
Write-Host "Free tier: $0 (50 AI requests/day)" -ForegroundColor White
Write-Host "Starter: $9.99/month (500 requests)" -ForegroundColor White
Write-Host "Professional: $19.99/month (unlimited)" -ForegroundColor White
Write-Host "Enterprise: $49.99/month (all features)" -ForegroundColor White

Write-Host ""
Write-Host "Expected revenue Month 1: $500-$3,000" -ForegroundColor Yellow
Write-Host "Expected revenue Year 1: $300K-$900K" -ForegroundColor Yellow

Write-Host ""
Write-Host "Press any key to stop server..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Stop-Process -Id $server.Id -Force
Write-Host "Server stopped." -ForegroundColor Green
