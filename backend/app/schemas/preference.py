from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class OptionCandidateOut(BaseModel):
    id: str
    category: str
    dish_name: str
    description: Optional[str] = None
    dietary_type: str = "Vegetarian"
    votes: int = 0
    vote_percentage: float = 0.0
    is_active: bool = True
    waste_risk: str = "Low"
    min_threshold_pct: float = 20.0


class PreferenceCategoryGroup(BaseModel):
    category: str
    options: List[OptionCandidateOut]
    total_category_votes: int = 0
    winning_dish: Optional[str] = None
    pruned_dishes: List[str] = []


class StudentPreferencePollResponse(BaseModel):
    date: str
    session: str
    categories: List[PreferenceCategoryGroup]
    total_voters: int = 0
    has_voted: bool = False
    daily_limit_reached: bool = False
    voted_session: Optional[str] = None
    student_selection: List[str] = []
    current_menu: str
    menu_status: str = "VOTING_ACTIVE"  # VOTING_ACTIVE, OPTIMIZED_ZERO_WASTE
    waste_prevented_kg: float = 0.0
    carbon_saved_kg: float = 0.0
    cost_saved_inr: float = 0.0
    message: Optional[str] = None


class StudentVoteRequest(BaseModel):
    session: str = "lunch"
    selected_option_ids: List[str]
    notes: Optional[str] = None


class StudentVoteResponse(BaseModel):
    success: bool
    message: str
    eco_points_earned: int = 15
    updated_poll: StudentPreferencePollResponse


class AdminPreferenceOptimizationRequest(BaseModel):
    session: str = "lunch"
    threshold_pct: float = 20.0
    auto_update_menu: bool = True


class AdminPreferenceOptimizationResponse(BaseModel):
    success: bool
    session: str
    threshold_pct: float
    pruned_dishes: List[str]
    retained_dishes: List[str]
    new_menu: str
    estimated_waste_saved_kg: float
    estimated_cost_saved_inr: float
    estimated_co2_saved_kg: float
    message: str
