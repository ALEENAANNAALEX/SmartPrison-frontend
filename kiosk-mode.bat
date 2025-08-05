@echo off
echo Starting Smart Prison Admin in Kiosk Mode...

REM Start the development server in background
start /B npm start

REM Wait for server to start
timeout /t 10

REM Launch Chrome in kiosk mode (fullscreen, no browser UI)
start chrome --kiosk --disable-web-security --disable-features=VizDisplayCompositor --no-first-run --disable-default-apps --disable-popup-blocking --disable-translate --disable-background-timer-throttling --disable-renderer-backgrounding --disable-device-discovery-notifications http://localhost:3000/admin

echo Kiosk mode launched. Press any key to exit...
pause

REM Kill Chrome processes when done
taskkill /f /im chrome.exe

echo Kiosk mode closed.
