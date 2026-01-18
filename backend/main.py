"""
Horizn Backend - Main Application
FastAPI server with authentication and CORS support
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
from auth.router import router as auth_router

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Creates database tables on startup.
    """
    # Startup: Create all database tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    yield
    # Shutdown: Cleanup if needed
    print("👋 Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Horizn API",
    description="Backend API for Horizn autonomous delivery platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving uploaded images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth_router)


# ============ Health Endpoints ============

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API information"""
    return {
        "name": "Horizn API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected"
    }


# ============ Development Helpers ============

@app.get("/api/users", tags=["Development"])
async def list_users():
    """
    [DEV ONLY] List all users in the database.
    This endpoint should be removed in production.
    """
    from database import SessionLocal
    from models import User
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return [
            {
                "id": u.id,
                "email": u.email,
                "name": f"{u.first_name} {u.last_name}",
                "is_verified": u.is_verified,
                "auth_provider": u.auth_provider
            }
            for u in users
        ]
    finally:
        db.close()
