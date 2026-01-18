# Google Sign-In Setup Guide

## Overview
This guide explains how to enable Google authentication in your Horizn app. The backend already supports Google OAuth - you just need to configure the credentials.

## Backend Setup (Already Complete ✅)
The backend `/auth/google` endpoint is already implemented and ready to use.

## Frontend Setup (Requires Configuration)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

### Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Create credentials for each platform:

#### Android Client ID
- Application type: **Android**
- Package name: `host.exp.exponent` (for Expo Go) or your app's package name
- SHA-1 certificate fingerprint: Get from `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`

#### iOS Client ID
- Application type: **iOS**
- Bundle ID: `host.exp.Exponent` (for Expo Go) or your app's bundle ID

#### Web Client ID
- Application type: **Web application**
- Authorized JavaScript origins: `https://auth.expo.io`
- Authorized redirect URIs: `https://auth.expo.io/@your-expo-username/your-app-slug`

### Step 3: Update Backend Configuration

1. Open `backend/.env`
2. Update the `GOOGLE_CLIENT_ID` with your **Web Client ID**:
   ```
   GOOGLE_CLIENT_ID=your-actual-web-client-id.apps.googleusercontent.com
   ```

### Step 4: Update Mobile App

1. Open `mobile/screens/LoginScreen.js`
2. In the `handleGoogleSignIn` function, uncomment the implementation code
3. Replace the placeholder client IDs with your actual IDs:
   ```javascript
   const config = {
       androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
       iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
       webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
   };
   ```

### Step 5: Install Google Sign-In Library

For production (non-Expo Go), you'll need:
```bash
npx expo install expo-auth-session expo-web-browser
```

Or use the native Google Sign-In SDK:
```bash
npx expo install @react-native-google-signin/google-signin
```

## Current Status

✅ **Backend**: Fully functional Google auth endpoint  
✅ **Button**: Visible and clickable  
⏳ **Configuration**: Needs Google Cloud Console setup  
⏳ **Implementation**: Code ready but commented out

When you tap "Sign in with Google" now, you'll see instructions on how to complete the setup.

## Testing

Once configured:
1. Tap "Sign in with Google"
2. Select your Google account
3. Grant permissions
4. You'll be automatically logged in and redirect to Home

## Troubleshooting

### "Invalid Google token" error
- Verify your client IDs match between Google Console and the app
- Check that the Web Client ID is set in backend `.env`

### "Token not issued for this application"  
- Ensure the `GOOGLE_CLIENT_ID` in backend matches your Web Client ID
- Verify the token is from the correct Google Cloud project

### No Google accounts appear
- Check SHA-1 fingerprint is correct (Android)
- Verify Bundle ID matches (iOS)
- Ensure Google+ API is enabled
