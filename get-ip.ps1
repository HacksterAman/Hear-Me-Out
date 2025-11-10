# PowerShell script to find your local IP address
# Run with: .\get-ip.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Finding your local IP address..." -ForegroundColor Yellow
Write-Host ""

$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*"
} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "Your Local IP Address: " -NoNewline -ForegroundColor Green
    Write-Host $ipAddress -ForegroundColor White
    Write-Host ""
    Write-Host "To access from your phone:" -ForegroundColor Yellow
    Write-Host "  http://$ipAddress:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Both devices are on the same WiFi network"
    Write-Host "  2. Backend is running: cd backend; python app.py"
    Write-Host "  3. Frontend is running: cd frontend; npm start"
    Write-Host "  4. Windows Firewall allows connections on ports 3000 and 5000"
} else {
    Write-Host "Could not find IP address. Make sure you're connected to WiFi." -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"






