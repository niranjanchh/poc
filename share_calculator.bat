@echo off
color 0A
echo Updating the public website with the latest changes...
copy /y "d:\projects\poc_rfq\geometry_optics_calculator.html" "d:\projects\public_calculator\index.html" > nul
copy /y "d:\projects\poc_rfq\style.css" "d:\projects\public_calculator\style.css" > nul
copy /y "d:\projects\poc_rfq\app.js" "d:\projects\public_calculator\app.js" > nul
cd /d "d:\projects\public_calculator"

echo.
echo ========================================================
echo Starting local server silently...
echo ========================================================
:: We use python so it doesn't clear the screen. 
:: We bind strictly to 127.0.0.1 and force SSH to route to 127.0.0.1
start /b python -m http.server 19999 --bind 127.0.0.1 > nul 2>&1

echo.
echo ========================================================
echo Generating PUBLIC LINK... Please wait 5-10 seconds!
echo Look for the URL that says "Forwarding HTTP traffic from https://..."
echo ========================================================
:: Explicitly mapping to 127.0.0.1 instead of 'localhost' fixes the IPv6 Bad Gateway!
ssh -o StrictHostKeyChecking=no -R 80:127.0.0.1:19999 serveo.net
pause
