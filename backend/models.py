"""
Database Models for Horizn Backend
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class AuthProvider(enum.Enum):
    """Authentication provider types"""
    EMAIL = "email"
    GOOGLE = "google"


class VerificationType(enum.Enum):
    """Types of verification codes"""
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"


class User(Base):
    """User model for storing user account information"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Nullable for OAuth users
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Account status
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Sender access
    is_sender = Column(Boolean, default=False)
    sender_request_status = Column(String(20), nullable=True)  # pending, approved, rejected
    
    # Auth provider
    auth_provider = Column(String(20), default="email")
    google_id = Column(String(255), nullable=True, unique=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    verification_codes = relationship("VerificationCode", back_populates="user", cascade="all, delete-orphan")


class VerificationCode(Base):
    """Verification codes for email verification and password reset"""
    __tablename__ = "verification_codes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code = Column(String(6), nullable=False)
    code_type = Column(String(30), nullable=False)  # email_verification, password_reset
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="verification_codes")
