' VBScript Web Server for Zenvora AI Platform
' This creates a simple HTTP server using Windows components

Option Explicit

Dim objShell, objFSO, objHTTP, objXMLHTTP
Dim serverPort, serverRoot, strCommand

' Configuration
serverPort = 8080
serverRoot = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Create and run the server
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Check if PowerShell is available
strCommand = "powershell -Command ""$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://localhost:8080/'); $listener.Start(); Write-Host 'Server started at http://localhost:8080'; while ($listener.IsListening) { $context = $listener.GetContext(); $request = $context.Request; $response = $context.Response; $response.ContentType = 'text/html'; $filePath = '" & serverRoot & "\LAUNCH_NOW.html'; if (Test-Path $filePath) { $content = Get-Content $filePath -Raw; $response.StatusCode = 200; } else { $content = '<h1>File not found</h1>'; $response.StatusCode = 404; } $buffer = [System.Text.Encoding]::UTF8.GetBytes($content); $response.ContentLength64 = $buffer.Length; $response.OutputStream.Write($buffer, 0, $buffer.Length); $response.Close(); Write-Host 'Served request'; } $listener.Stop(); Write-Host 'Server stopped';"""

WScript.Echo "Starting Zenvora AI Platform Web Server..."
WScript.Echo "Server will be available at: http://localhost:8080"
WScript.Echo "Press Ctrl+C to stop the server"
WScript.Echo ""

' Start the PowerShell server
objShell.Run strCommand, 1, False

WScript.Echo "Server startup initiated..."
WScript.Echo "Please wait a moment, then visit: http://localhost:8080"
WScript.Echo ""
WScript.Echo "If the server doesn't start, try these alternatives:"
WScript.Echo "1. Double-click LAUNCH_NOW.html directly"
WScript.Echo "2. Use START_WEBSITE.bat (requires Python)"
WScript.Echo "3. Try the EMERGENCY_FIX.bat"
