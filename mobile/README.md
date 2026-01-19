# Horizn Mobile App

React Native mobile application built with Expo, connected to a FastAPI backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Expo Go app installed on your phone (download from App Store/Play Store)
- Backend API running (see `../backend/README.md`)

### Installation

Already installed! Dependencies are ready to go.

### Running the App

1. **Start the development server:**
```bash
npm start
```

2. **Run on your device:**
   - Scan the QR code with Expo Go app (Android) or Camera app (iOS)
   - Make sure your phone and computer are on the **same WiFi network**

3. **Run on emulator/simulator:**
```bash
# Android
npm run android

# iOS (Mac only)
npm run ios

# Web browser
npm run web
```

## ⚙️ Configuration

### Connecting to Backend API

**When testing on your phone**, you need to update the API URL:

1. Find your computer's IP address:
   - Windows: Run `ipconfig` in terminal, look for IPv4 Address
   - Mac: Run `ifconfig` in terminal, look for inet
   - Linux: Run `ip addr`

2. Update `App.js` line 15:
```javascript
const API_URL = 'http://YOUR_IP_ADDRESS:8000';
// Example: const API_URL = 'http://192.168.1.100:8000';
```

3. Make sure the backend is running on `0.0.0.0:8000` (not just `127.0.0.1`)

**When testing on emulator**, you can use:
- Android Emulator: `http://10.0.2.2:8000`
- iOS Simulator: `http://localhost:8000`

## 📱 Features

- ✅ Modern, beautiful UI with dark theme
- ✅ Fetch and display users from API
- ✅ Pull-to-refresh functionality
- ✅ Loading states and error handling
- ✅ Responsive design

## 🏗️ Project Structure

```
mobile/
├── App.js              # Main app component
├── config.js           # Environment configuration
├── assets/             # Images, fonts, icons
├── package.json        # Dependencies
└── app.json           # Expo configuration
```

## 🛠️ Available Scripts

- `npm start` - Start Expo dev server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## 📝 Next Steps

1. Add navigation (React Navigation)
2. Add authentication
3. Create more screens
4. Add state management (Redux/Zustand)
5. Add offline support
6. Implement forms

## 🐛 Troubleshooting

**Can't connect to API:**
- Ensure backend is running
- Check that you're using the correct IP address
- Verify both devices are on the same WiFi
- Disable firewall temporarily to test

**App won't start:**
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
