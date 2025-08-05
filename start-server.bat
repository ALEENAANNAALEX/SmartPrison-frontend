@echo off
echo Installing server dependencies...
npm install --prefix . express cors

echo Starting mock server...
node mock-server.cjs

pause
