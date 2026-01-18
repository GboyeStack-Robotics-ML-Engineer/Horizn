"""
Pydantic Schemas for Authentication
Request/Response models for auth endpoints
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ============ Request Schemas ============

class UserCreate(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters")
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class UserLogin(BaseModel):
    """Schema for email/password login"""
    email: EmailStr
    password: str


class OTPVerify(BaseModel):
    """Schema for OTP verification"""
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=6)


class PasswordResetRequest(BaseModel):
    """Schema for requesting password reset"""
    email: EmailStr


class PasswordReset(BaseModel):
    """Schema for resetting password with OTP"""
    email: EmailStr
    code: str = Field(..., min_length=4, max_length=6)
    new_password: str = Field(..., min_length=6)


class GoogleAuthRequest(BaseModel):
    """Schema for Google OAuth login"""
    id_token: str


class ResendOTPRequest(BaseModel):
    """Schema for resending OTP"""
    email: EmailStr
    otp_type: str = Field(default="email_verification", description="Type: email_verification or password_reset")


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = None


# ============ Response Schemas ============

class TokenResponse(BaseModel):
    """Schema for JWT token response"""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """Schema for user data in responses"""
    id: int
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None
    is_verified: bool
    is_sender: bool
    auth_provider: str
    created_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


class OTPResponse(BaseModel):
    """Response after OTP is sent"""
    message: str
    email: str
    expires_in_minutes: int = 10


# Update forward reference
TokenResponse.model_rebuild()
