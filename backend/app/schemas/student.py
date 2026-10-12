from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class MealItemOut(BaseModel):
    session: str
    menu: str
    time: str
    booked: bool
    status: str
    deadline: str
    can_modify: bool
    token: Optional[str] = None
    addons: Optional[List[Dict[str, Any]]] = []


class TodayMealsResponse(BaseModel):
    date: str
    hostel: str
    meals: Dict[str, MealItemOut]


class WeeklyDayMenu(BaseModel):
    day: str
    date: str
    is_today: bool
    breakfast: str
    lunch: str
    snacks: str
    dinner: str
    time_windows: Optional[Dict[str, str]] = None
    deadlines: Optional[Dict[str, str]] = None
    updated_session: Optional[str] = None


class WeeklyMenuResponse(BaseModel):
    hostel: str
    date: str
    week_start: str
    week_end: str
    schedule: List[WeeklyDayMenu]
    message: Optional[str] = "Weekly dining menu retrieved successfully."


class ToggleBookingRequest(BaseModel):
    meal_session: str
    date: Optional[str] = None


class ToggleBookingResponse(BaseModel):
    meal_session: str
    booked: bool
    status: str
    token: Optional[str] = None
    co2_avoided_kg: float
    meals_booked: int
    cancellation_recorded: bool
    message: str


class FeedbackRequest(BaseModel):
    meal_session: str
    taste_rating: int = Field(ge=1, le=5, default=5)
    quantity_satisfaction: int = Field(ge=1, le=5, default=5)
    menu_rating: int = Field(ge=1, le=5, default=5)
    finished_meal: bool = True
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    message: str
    submitted_at: str


class BookingHistoryItem(BaseModel):
    id: str
    date: str
    meal: str
    item: str
    status: str
    token: Optional[str] = None


class BookingHistoryResponse(BaseModel):
    total: int
    items: List[BookingHistoryItem]


class StudentImpactResponse(BaseModel):
    student_name: str
    hostel: str
    meals_booked: int
    meals_attended: int
    timely_cancellations: int
    estimated_surplus_avoided_kg: float
    co2_avoided_kg: float
    eco_points: int = 580
    eco_rank: int
    sustainability_streak_days: int


class StudentLeaderboardEntry(BaseModel):
    rank: int
    id: str
    name: str
    avatar: str
    roll_no: str
    hostel: str
    room: Optional[str] = None
    eco_points: int
    meals_saved: int
    co2_avoided_kg: float
    streak_days: int
    tier: str
    badge: str
    is_current_user: bool = False


class StudentLeaderboardResponse(BaseModel):
    current_student_rank: int
    current_student_points: int
    current_student_tier: str
    points_to_next_rank: int
    total_participants: int
    leaderboard: List[StudentLeaderboardEntry]


class PointsEarnRequest(BaseModel):
    points: int
    action: str = "Eco Action"
    student_id: Optional[str] = None


class PointsEarnResponse(BaseModel):
    success: bool
    points_added: int
    total_eco_points: int
    rank: int
    message: str
