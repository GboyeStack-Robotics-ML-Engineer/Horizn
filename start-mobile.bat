@echo off
echo ========================================
echo Starting Horizn Mobile App
echo ========================================
echo.

cd mobile

if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting Expo development server...
echo Scan the QR code with Expo Go app on your phone
echo.
echo IMPORTANT: Update App.js with your computer's IP address!
echo Run 'ipconfig' to find your IP and update line 15 in App.js
echo.

npm start
