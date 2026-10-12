from app.db.session import Base
from app.models.user import User, StudentProfile, AdminProfile, NgoProfile
from app.models.hostel import Hostel
from app.models.meal import (
    MealSchedule,
    MealBooking,
    MealFeedback,
    DailyProductionLog,
    MealOptionCandidate,
    StudentPreferenceVote,
)
from app.models.surplus import SurplusListing, SurplusRequest, DistributionRecord
from app.models.waste import WasteRecord
from app.models.demand import NgoDemand, ForecastRecord
from app.models.impact import ImpactEvent
from app.models.uco import UcoRecord

__all__ = [
    "Base",
    "User",
    "StudentProfile",
    "AdminProfile",
    "NgoProfile",
    "Hostel",
    "MealSchedule",
    "MealBooking",
    "MealFeedback",
    "DailyProductionLog",
    "MealOptionCandidate",
    "StudentPreferenceVote",
    "SurplusListing",
    "SurplusRequest",
    "DistributionRecord",
    "WasteRecord",
    "NgoDemand",
    "ForecastRecord",
    "ImpactEvent",
    "UcoRecord"
]
