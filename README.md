# Horizn - React Native + FastAPI Mobile App

A full-stack mobile application built with **React Native (Expo)** for the frontend and **FastAPI** for the backend.

## 📁 Project Structure

```
Horizn/
├── backend/           # FastAPI backend
│   ├── main.py       # API endpoints
│   ├── requirements.txt
│   └── README.md
│
└── mobile/           # React Native + Expo app
    ├── App.js        # Main mobile app
    ├── config.js     # Configuration
    ├── package.json
    └── README.md
```

## 🚀 Quick Start Guide

### 1️⃣ Set Up Backend (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend will be available at: **http://localhost:8000**
📚 API Docs: **http://localhost:8000/docs**

### 2️⃣ Set Up Mobile App (React Native + Expo)

```bash
cd mobile

# Dependencies already installed!

# Start the app
npm start
```

✅ Scan the QR code with **Expo Go** app on your phone

### 3️⃣ Connect Mobile to Backend

**Important**: When testing on a physical device:

1. Find your computer's IP address:
   ```bash
   ipconfig  # Windows
   ```

2. Update `mobile/App.js` line 15:
   ```javascript
   const API_URL = 'http://YOUR_IP_ADDRESS:8000';
   ```

3. Ensure both devices are on the **same WiFi network**

## 🎯 Features

### Backend (FastAPI)
- ✅ RESTful API endpoints
- ✅ CORS enabled for mobile access
- ✅ User CRUD operations
- ✅ Interactive API documentation
- ✅ Type validation with Pydantic

### Mobile (React Native + Expo)
- ✅ Modern, beautiful dark-themed UI
- ✅ Real-time data fetching from API
- ✅ Pull-to-refresh functionality
- ✅ Error handling and loading states
- ✅ Responsive design

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Welcome message |
| GET | `/health` | Health check |
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |
| POST | `/api/users` | Create new user |

## 🛠️ Tech Stack

**Frontend:**
- React Native
- Expo
- Axios (HTTP client)

**Backend:**
- FastAPI
- Pydantic (validation)
- Uvicorn (ASGI server)

## 📱 Testing

### On Phone (Recommended)
1. Install **Expo Go** app
2. Start both backend and mobile app
3. Update API URL with your IP address
4. Scan QR code

### On Emulator
- Android: `npm run android`
- iOS: `npm run ios` (Mac only)

## 🔄 Development Workflow

1. **Start Backend**: Terminal 1
   ```bash
   cd backend
   venv\Scripts\activate
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Mobile App**: Terminal 2
   ```bash
   cd mobile
   npm start
   ```

3. Make changes and see them update live! ⚡

## 🐛 Troubleshooting

**Connection Issues:**
- Verify backend is running on `0.0.0.0:8000`
- Check firewall settings
- Ensure same WiFi network
- Use correct IP address (not localhost)

**App Won't Start:**
- Clear Expo cache: `npx expo start -c`
- Reinstall: `rm -rf node_modules && npm install`

## 📚 Next Steps

- [ ] Add authentication (JWT)
- [ ] Add database (PostgreSQL/MongoDB)
- [ ] Implement navigation
- [ ] Add state management
- [ ] Create more screens
- [ ] Deploy to production

## 📖 Documentation

- [Backend README](backend/README.md)
- [Mobile README](mobile/README.md)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Expo Docs](https://docs.expo.dev/)

---

**Happy Coding! 🚀**
