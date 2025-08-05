#!/bin/bash

echo "Starting Smart Prison Admin in Kiosk Mode..."

# Start the development server in background
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Launch Chrome in kiosk mode (fullscreen, no browser UI)
google-chrome --kiosk --disable-web-security --disable-features=VizDisplayCompositor --no-first-run --disable-default-apps --disable-popup-blocking --disable-translate --disable-background-timer-throttling --disable-renderer-backgrounding --disable-device-discovery-notifications http://localhost:3000/admin &
CHROME_PID=$!

echo "Kiosk mode launched. Press Ctrl+C to exit..."

# Wait for user to stop
trap "echo 'Stopping kiosk mode...'; kill $CHROME_PID $SERVER_PID; exit" INT
wait
