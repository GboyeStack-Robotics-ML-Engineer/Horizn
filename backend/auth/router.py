"""
Authentication Router for Horizn Backend
API endpoints for user authentication system
"""
import os
import uuid
import shutil
from datetime import datetime, timedelta
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from database import get_db
from models import User, VerificationCode
from auth.utils import (
    hash_password,
    verify_password,
    create_access_token,
    generate_otp,
    get_current_user,
    get_current_active_user
)
from auth.schemas import (
    UserCreate,
    UserLogin,
    UserUpdate,
    OTPVerify,
    PasswordResetRequest,
    PasswordReset,
    GoogleAuthRequest,
    ResendOTPRequest,
    TokenResponse,
    UserResponse,
    MessageResponse,
    OTPResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# OTP expiration time in minutes
OTP_EXPIRE_MINUTES = 10


# ============ Helper Functions ============

def create_verification_code(db: Session, user_id: int, code_type: str) -> str:
    """Create and store a new verification code"""
    # Invalidate any existing codes of this type for the user
    db.query(VerificationCode).filter(
        VerificationCode.user_id == user_id,
        VerificationCode.code_type == code_type,
        VerificationCode.is_used == False
    ).update({"is_used": True})
    
    # Generate new code
    code = generate_otp(4)
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)
    
    verification = VerificationCode(
        user_id=user_id,
        code=code,
        code_type=code_type,
        expires_at=expires_at
    )
    db.add(verification)
    db.commit()
    
    return code


def verify_code(db: Session, user_id: int, code: str, code_type: str) -> bool:
    """Verify an OTP code"""
    verification = db.query(VerificationCode).filter(
        VerificationCode.user_id == user_id,
        VerificationCode.code == code,
        VerificationCode.code_type == code_type,
        VerificationCode.is_used == False,
        VerificationCode.expires_at > datetime.utcnow()
    ).first()
    
    if verification:
        verification.is_used = True
        db.commit()
        return True
    return False


# ============ Endpoints ============

@router.post("/register", response_model=OTPResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    Sends a verification OTP to the user's email.
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        print(f"\n⚠️  [DEV] Email already exists: {user_data.email}\n")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        auth_provider="email",
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate verification code
    code = create_verification_code(db, new_user.id, "email_verification")
    
    # TODO: Send email with OTP code
    # For now, we'll return the code in the response (development only)
    print(f"\n{'='*50}")
    print(f"📧 [DEV] Verification code for {user_data.email}: {code}")
    print(f"{'='*50}\n")
    
    return OTPResponse(
        message=f"Verification code sent to {user_data.email}",
        email=user_data.email,
        expires_in_minutes=OTP_EXPIRE_MINUTES
    )


@router.post("/verify-email", response_model=TokenResponse)
async def verify_email(data: OTPVerify, db: Session = Depends(get_db)):
    """
    Verify user's email with OTP code.
    Returns JWT token on successful verification.
    """
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    if not verify_code(db, user.id, data.code, "email_verification"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Mark email as verified
    user.is_verified = True
    db.commit()
    
    # Generate access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password.
    Returns JWT token on successful authentication.
    """
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if user.auth_provider != "email":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This account uses {user.auth_provider} authentication"
        )
    
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_verified:
        # Generate new verification code
        code = create_verification_code(db, user.id, "email_verification")
        print(f"\n{'='*50}")
        print(f"📧 [DEV] Verification code for {credentials.email}: {code}")
        print(f"{'='*50}\n")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. A new verification code has been sent."
        )
    
    # Generate access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Authenticate with Google OAuth.
    Creates account if user doesn't exist.
    """
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    
    # Verify Google token
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={data.id_token}"
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Google token"
                )
            
            google_data = response.json()
            
            # Verify audience if client ID is set
            if google_client_id and google_client_id != "your-google-client-id-here":
                if google_data.get("aud") != google_client_id:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Token not issued for this application"
                    )
            
            email = google_data.get("email")
            google_id = google_data.get("sub")
            first_name = google_data.get("given_name", "")
            last_name = google_data.get("family_name", "")
            
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not verify Google token"
        )
    
    # Check if user exists
    user = db.query(User).filter(
        (User.email == email) | (User.google_id == google_id)
    ).first()
    
    if not user:
        # Create new user
        user = User(
            email=email,
            first_name=first_name or "Google",
            last_name=last_name or "User",
            auth_provider="google",
            google_id=google_id,
            is_verified=True  # Google accounts are pre-verified
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.auth_provider != "google":
        # Link existing account to Google
        user.google_id = google_id
        if not user.is_verified:
            user.is_verified = True
        db.commit()
    
    # Generate access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/forgot-password", response_model=OTPResponse)
async def forgot_password(data: PasswordResetRequest, db: Session = Depends(get_db)):
    """
    Request a password reset OTP.
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        # Don't reveal if email exists or not
        return OTPResponse(
            message=f"If an account exists for {data.email}, a reset code has been sent",
            email=data.email,
            expires_in_minutes=OTP_EXPIRE_MINUTES
        )
    
    if user.auth_provider != "email":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This account uses {user.auth_provider} authentication"
        )
    
    # Generate reset code
    code = create_verification_code(db, user.id, "password_reset")
    print(f"\n{'='*50}")
    print(f"🔑 [DEV] Password reset code for {data.email}: {code}")
    print(f"{'='*50}\n")
    
    return OTPResponse(
        message=f"Password reset code sent to {data.email}",
        email=data.email,
        expires_in_minutes=OTP_EXPIRE_MINUTES
    )


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    """
    Reset password using OTP code.
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not verify_code(db, user.id, data.code, "password_reset"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code"
        )
    
    # Update password
    user.password_hash = hash_password(data.new_password)
    db.commit()
    
    return MessageResponse(message="Password reset successfully")


@router.post("/resend-otp", response_model=OTPResponse)
async def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    """
    Resend OTP code for verification or password reset.
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Generate new code
    code = create_verification_code(db, user.id, data.otp_type)
    print(f"\n{'='*50}")
    print(f"🔄 [DEV] New {data.otp_type} code for {data.email}: {code}")
    print(f"{'='*50}\n")
    
    return OTPResponse(
        message=f"New verification code sent to {data.email}",
        email=data.email,
        expires_in_minutes=OTP_EXPIRE_MINUTES
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user's profile.
    Protected endpoint - requires valid JWT token.
    """
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile.
    Protected endpoint - requires valid JWT token.
    """
    # Update only provided fields
    if profile_data.first_name is not None:
        current_user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        current_user.last_name = profile_data.last_name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.country is not None:
        current_user.country = profile_data.country
    
    db.commit()
    db.refresh(current_user)
    
    print(f"\n✅ [DEV] Profile updated for {current_user.email}\n")
    
    return UserResponse.model_validate(current_user)


# Uploads directory path (relative to backend folder)
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")


@router.post("/upload-avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload a profile picture for the current user.
    Accepts image files (jpg, png, gif, webp).
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed types: jpg, png, gif, webp"
        )
    
    # Generate unique filename
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Ensure uploads directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    # Update user's avatar_url (will store relative URL)
    # The full URL will be constructed on the client side
    current_user.avatar_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(current_user)
    
    print(f"\n📸 [DEV] Avatar uploaded for {current_user.email}: {filename}\n")
    
    return UserResponse.model_validate(current_user)
