from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TodayStatsOut(BaseModel):
    prepared: int
    served: int
    surplus: int
    waste: int


class AdminStatsResponse(BaseModel):
    mess_name: str
    supervisor: str
    date: str
    today_stats: TodayStatsOut
    registered_boarders: int
    active_rsvps: int


class ProductionLogRequest(BaseModel):
    meal_session: str = "Lunch"
    prepared_qty: int = Field(ge=0)
    served_qty: int = Field(ge=0)
    waste_qty: int = Field(ge=0, default=0)
    notes: Optional[str] = None


class ProductionLogResponse(BaseModel):
    id: str
    prepared: int
    served: int
    surplus: int
    waste: int
    logged_at: str


class WasteLogRequest(BaseModel):
    meal_session: str = "Lunch"
    day_of_week: str = "Wednesday"
    prep_waste_kg: float = Field(ge=0.0, default=2.4)
    unserved_surplus_kg: float = Field(ge=0.0, default=7.1)
    plate_waste_kg: float = Field(ge=0.0, default=4.8)
    notes: Optional[str] = None


class WasteLogResponse(BaseModel):
    id: str
    meal_session: str
    day_of_week: str
    prep_waste_kg: float
    unserved_surplus_kg: float
    plate_waste_kg: float
    total_waste_kg: float
    logged_at: str


class HeatmapCell(BaseModel):
    session: str
    day: str
    intensity_kg: float
    level: str  # low, medium, high


class WasteHeatmapResponse(BaseModel):
    sessions: List[str]
    days: List[str]
    grid: Dict[str, Dict[str, float]]
    weekly_total_kg: float
    highest_waste_session: str
    insights: List[str]


class SurplusPublishRequest(BaseModel):
    title: Optional[str] = None
    food_title: Optional[str] = None
    meals: Optional[int] = None
    meals_available: Optional[int] = None
    hostel: Optional[str] = None
    location_detail: Optional[str] = None
    temp_celsius: Optional[int] = 65
    storage_temperature: Optional[float] = None
    prep_time: Optional[str] = "Just now"
    pickup_deadline: Optional[str] = "5:00 PM"
    storage_condition: Optional[str] = "Insulated Stainless Steel Warmer"
    food_type: Optional[str] = "Cooked Main Course (Vegetarian)"
    dietary: Optional[str] = "Vegetarian"
    image_url: Optional[str] = None


class SurplusPublishResponse(BaseModel):
    id: str
    title: str
    meals: int
    status: str
    fssai_safety_passed: bool
    pickup_otp: str
    published_at: str


class HandoverVerifyRequest(BaseModel):
    request_id: str
    otp: str


class HandoverVerifyResponse(BaseModel):
    success: bool
    request_id: str
    status: str
    meals_handed_over: int
    message: str


class MenuUpdateRequest(BaseModel):
    session: str # breakfast, lunch, snacks, dinner
    menu: str
    time_window: Optional[str] = None
    deadline: Optional[str] = None
    append_dish: bool = False


class MenuSessionItem(BaseModel):
    session: str
    menu: str
    time_window: str
    deadline: str
    rsvps_count: int = 0
    addons: Optional[List[Dict[str, Any]]] = []


class AdminMenuResponse(BaseModel):
    date: str
    hostel: str
    sessions: Dict[str, MenuSessionItem]
    message: Optional[str] = None
