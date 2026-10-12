import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Float, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=True)
    username = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # student, admin, ngo
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    admin_profile = relationship("AdminProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    ngo_profile = relationship("NgoProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    roll_no = Column(String(100), unique=True, index=True, nullable=False)
    enrollment_no = Column(String(100), unique=True, index=True, nullable=True)
    father_name_hash = Column(String(255), nullable=True)
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=True)
    room = Column(String(50), nullable=True)
    avatar = Column(String(100), default="👨‍🎓")
    diet = Column(String(50), default="Vegetarian")
    meals_booked = Column(Integer, default=0)
    meals_saved = Column(Integer, default=0)
    co2_avoided_kg = Column(Float, default=0.0)
    eco_points = Column(Integer, default=580)
    rank = Column(Integer, default=1)
    notifications = Column(Boolean, default=True)

    # Relationships
    user = relationship("User", back_populates="student_profile")
    hostel = relationship("Hostel", back_populates="students")
    bookings = relationship("MealBooking", back_populates="student", cascade="all, delete-orphan")
    feedback = relationship("MealFeedback", back_populates="student", cascade="all, delete-orphan")


class AdminProfile(Base):
    __tablename__ = "admin_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    username = Column(String(100), nullable=True)
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=True)
    phone = Column(String(50), nullable=True)

    # Relationships
    user = relationship("User", back_populates="admin_profile")
    hostel = relationship("Hostel", back_populates="admins")


class NgoProfile(Base):
    __tablename__ = "ngo_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    organization_name = Column(String(255), nullable=True)
    tagline = Column(String(255), nullable=True)
    contact_person = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    fssai_verified = Column(Boolean, default=True)
    
    # Stats counters
    total_meals_rescued = Column(Integer, default=0)
    people_served = Column(Integer, default=0)
    co2_diverted_kg = Column(Float, default=0.0)

    # Relationships
    user = relationship("User", back_populates="ngo_profile")
    requests = relationship("SurplusRequest", back_populates="ngo", cascade="all, delete-orphan")
    distributions = relationship("DistributionRecord", back_populates="ngo", cascade="all, delete-orphan")
