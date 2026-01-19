# Horizn Backend Deployment Guide

## Quick Deploy to Render

### Option 1: One-Click Deploy (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub repo: `GboyeStack-Robotics-ML-Engineer/Horizn`
4. Select the `backend` folder
5. Render will auto-detect `render.yaml` and create everything

### Option 2: Manual Setup
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Create a **New Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables (Set in Render Dashboard)
| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | (generate random) | Click "Generate" |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token lifetime |
| `DATABASE_URL` | (from Render DB) | Auto-filled if using Render Postgres |
| `CLOUDINARY_CLOUD_NAME` | Your value | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Your value | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Your value | From Cloudinary dashboard |

### After Deployment
Your API will be available at:
```
https://horizn-api.onrender.com
```

Test it:
```bash
curl https://horizn-api.onrender.com/health
```
