from typing import List, Optional, Any
from pydantic import BaseModel, Field


class BatchCreate(BaseModel):
    ingredient_id: str = Field(...)
    qty: float = Field(..., gt=0)
    received_date: str = Field(...)
    shelf_life_days: int = Field(..., gt=0)
    cost_per_kg: Optional[float] = None
    co2_per_kg: Optional[float] = None
    batch_id: Optional[str] = None


class BatchOut(BaseModel):
    batch_id: str
    ingredient_id: str
    qty: float
    original_qty: float
    received_date: str
    shelf_life_days: int
    expiry_date: str
    remaining_days: int
    is_expired: Optional[bool] = False
    cost_per_kg: float
    co2_per_kg: float


class StockAnalysisResponse(BaseModel):
    ingredient_id: str
    name: str
    category: Optional[str] = "vegetable"
    unit: str
    consumption_per_meal: Optional[float] = 0.045
    total_stock: float
    batches: List[BatchOut]
    avg_daily_usage: float
    predicted_usage_7d: float
    days_of_stock_left: float
    waste_risk_kg: float
    waste_risk_cost_inr: float
    waste_risk_co2_kg: float
    overstock_risk: str
    cost_per_kg: float


class ProcurementRecommendationResponse(BaseModel):
    ingredient_id: str
    name: str
    category: Optional[str] = "vegetable"
    unit: str
    current_stock_kg: float
    days_of_stock_left: float
    predicted_horizon_need_kg: float
    target_inventory_kg: float
    recommended_order_kg: float
    suggested_order_reduction_kg: float
    action: str
    estimated_cost_inr: float
    recommendation_message: str


class StockAlertOut(BaseModel):
    ingredient_id: str
    name: str
    batch_id: Optional[str]
    type: str
    severity: str
    title: str
    message: str
    quantity: float
    unit: str
    cost_at_risk_inr: float
    remaining_days: int


class StockSummaryResponse(BaseModel):
    total_items_tracked: int
    total_inventory_value_inr: float
    projected_waste_risk_kg: float
    projected_waste_cost_inr: float
    projected_waste_co2_kg: float
    critical_alerts_count: int
    warning_alerts_count: int
    suggested_order_reductions_kg: float
    suggested_procurement_savings_inr: float
    critical_alerts: List[StockAlertOut]


class StockDeductRequest(BaseModel):
    ingredient_id: str = Field(...)
    qty_to_deduct: float = Field(..., gt=0)


class ItemCreate(BaseModel):
    name: str = Field(...)
    category: str = Field("vegetable")  # vegetable, meal, dairy, staple
    unit: str = Field("kg")  # kg, portions, L
    consumption_per_meal: float = Field(0.045, gt=0)
    cost_per_unit: float = Field(35.0, gt=0)
    co2_per_unit: Optional[float] = None
    shelf_life_days: int = Field(7, gt=0)
    initial_qty: Optional[float] = Field(0.0, ge=0)
    received_date: Optional[str] = None
    item_id: Optional[str] = None


class ItemRegisterResponse(BaseModel):
    ingredient_id: str
    name: str
    category: str
    unit: str
    consumption_per_meal: float
    cost_per_kg: float
    co2_per_kg: float
    typical_shelf_life: int
    initial_batch: Optional[BatchOut] = None
    status: str = "success"


class MenuAddonRecommendationOut(BaseModel):
    ingredient_id: str
    ingredient_name: str
    category: str
    unit: str
    expiring_qty: float
    earliest_expiry_days: int
    recommended_dish_name: str
    recommended_sessions: List[str]
    description: str
    potential_portions: int
    waste_prevented_kg: float
    co2_savings_kg: float
    cost_savings_inr: float
    eco_points: int
    is_already_published: bool
    urgency: str


class PublishAddonRequest(BaseModel):
    ingredient_id: str
    addon_name: str
    meal_session: str = "lunch"
    portions_target: int = 200
    description: Optional[str] = None
    eco_points: int = 25
    addon_id: Optional[str] = None


class ActiveAddonOut(BaseModel):
    addon_id: str
    ingredient_id: str
    ingredient_name: str
    name: str
    meal_session: str
    portions_target: int
    portions_claimed: int
    description: str
    eco_points: int
    waste_rescued_per_portion_kg: float
    co2_saved_per_portion_kg: float
    status: str
    created_at: str


class AddonOptInRequest(BaseModel):
    addon_id: str
    student_id: Optional[str] = "usr-student-01"


class AddonOptInResponse(BaseModel):
    addon_id: str
    student_id: str
    addon_name: Optional[str] = None
    meal_session: Optional[str] = None
    status: str
    eco_points_awarded: int
    portions_claimed: int
    waste_rescued_kg: float
    co2_avoided_kg: float
    message: str

