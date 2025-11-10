@echo off
echo Finding your local IP address...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%a
    set ip=!ip:~1!
    echo ========================================
    echo Your Local IP Address: !ip!
    echo.
    echo To access from your phone:
    echo http://!ip!:3000
    echo.
    echo Make sure:
    echo 1. Both devices are on the same WiFi network
    echo 2. Backend is running: cd backend ^&^& python app.py
    echo 3. Frontend is running: cd frontend ^&^& npm start
    echo 4. Windows Firewall allows connections on ports 3000 and 5000
    echo ========================================
    echo.
    goto :found
)

:found
pause






