# Quick Reference Guide for Horizn

## Starting the Backend

**Option 1: Using the batch script (Easiest)**
```bash
# From the root Horizn directory
.\start-backend.bat
```

**Option 2: Manual start**
```bash
# Navigate to backend
cd backend

# Activate virtual environment
.\venv\Scripts\activate

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Starting the Mobile App

**Option 1: Using the batch script (Easiest)**
```bash
# From the root Horizn directory
.\start-mobile.bat
```

**Option 2: Manual start**
```bash
# Navigate to mobile
cd mobile

# Start Expo
npm start
```

## Troubleshooting

### Port 8000 Already in Use
1. Find what's using the port:
   ```bash
   netstat -ano | findstr :8000
   ```

2. Kill the process (replace PID with actual process ID):
   ```bash
   taskkill /F /PID <PID>
   ```

### Can't Connect Mobile to Backend
1. Find your IP address:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Update `mobile/App.js` line 15:
   ```javascript
   const API_URL = 'http://YOUR_IP_HERE:8000';
   ```

3. Ensure:
   - Backend is running
   - Phone and computer on same WiFi
   - Backend is running on 0.0.0.0 (not 127.0.0.1)

### Backend Won't Start
- Make sure virtual environment is activated
- Check if port 8000 is free
- Verify dependencies are installed: `pip install -r requirements.txt`

### Mobile App Won't Start
- Clear cache: `npx expo start -c`
- Reinstall dependencies: `npm install`

## Common Commands

### Backend
- Install dependencies: `pip install -r requirements.txt`
- Run server: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- Check API docs: http://localhost:8000/docs

### Mobile
- Start dev server: `npm start`
- Clear cache: `npx expo start -c`
- Install package: `npm install <package-name>`

## Quick Testing
- Backend health: http://localhost:8000/health
- Get users API: http://localhost:8000/api/users
- API docs: http://localhost:8000/docs
