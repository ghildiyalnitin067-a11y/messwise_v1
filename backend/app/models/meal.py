import uuid
from datetime import datetime, date, timezone
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship

from app.db.session import Base


class MealSchedule(Base):
    __tablename__ = "meal_schedules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=False)
    date = Column(Date, default=date.today, index=True, nullable=False)
    session = Column(String(50), nullable=False)  # breakfast, lunch, dinner
    menu = Column(Text, nullable=False)
    time_window = Column(String(100), nullable=False)  # e.g., "7:00 AM - 9:00 AM"

    # Relationships
    hostel = relationship("Hostel", back_populates="schedules")
    bookings = relationship("MealBooking", back_populates="schedule", cascade="all, delete-orphan")


class MealBooking(Base):
    __tablename__ = "meal_bookings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    schedule_id = Column(String(36), ForeignKey("meal_schedules.id"), nullable=True)
    date = Column(Date, default=date.today, index=True, nullable=False)
    meal_session = Column(String(50), nullable=False)  # breakfast, lunch, dinner
    item_summary = Column(String(255), nullable=True)
    status = Column(String(50), default="Booked")  # Booked, OptedOut, Served, Cancelled
    token = Column(String(100), nullable=True)
    booked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("StudentProfile", back_populates="bookings")
    schedule = relationship("MealSchedule", back_populates="bookings")


class MealFeedback(Base):
    __tablename__ = "meal_feedback"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    meal_session = Column(String(50), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 - 5
    comment = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("StudentProfile", back_populates="feedback")


class DailyProductionLog(Base):
    __tablename__ = "daily_production_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=False)
    date = Column(Date, default=date.today, index=True, nullable=False)
    meal_session = Column(String(50), default="Lunch")
    prepared_qty = Column(Integer, default=0)
    served_qty = Column(Integer, default=0)
    surplus_qty = Column(Integer, default=0)
    waste_qty = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    logged_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    hostel = relationship("Hostel", back_populates="production_logs")


class MealOptionCandidate(Base):
    __tablename__ = "meal_option_candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    hostel_id = Column(String(36), ForeignKey("hostels.id"), nullable=True)
    date = Column(Date, default=date.today, index=True, nullable=False)
    session = Column(String(50), nullable=False)  # lunch, dinner, breakfast, snacks
    category = Column(String(100), nullable=False)  # Main Course, Dal & Lentils, Breads & Rice, Sides & Dessert
    dish_name = Column(String(200), nullable=False)
    description = Column(String(255), nullable=True)
    dietary_type = Column(String(50), default="Vegetarian")  # Vegetarian, Vegan, High-Protein
    votes = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)  # True = included in active menu, False = pruned due to low preference
    waste_risk = Column(String(50), default="Low")  # Low, Moderate, High Risk
    min_threshold_pct = Column(Float, default=20.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class StudentPreferenceVote(Base):
    __tablename__ = "student_preference_votes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(36), ForeignKey("student_profiles.id"), nullable=False)
    date = Column(Date, default=date.today, index=True, nullable=False)
    session = Column(String(50), nullable=False)
    selected_option_ids = Column(Text, nullable=False)  # JSON-serialized list of option ids or names
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
