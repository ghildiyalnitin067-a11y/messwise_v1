"""
Pydantic Schemas for Used Cooking Oil (UCO) Recycling & Carbon Footprint Management
===================================================================================
"""
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from pydantic import BaseModel, Field, field_validator, ConfigDict


class UcoCreateRequest(BaseModel):
    disposal_date: Optional[date] = Field(default_factory=date.today)
    quantity: float = Field(..., gt=0, description="Quantity of used cooking oil, must be positive (> 0)")
    unit: str = Field(default="litres", description="Unit of measure: 'litres' or 'kg'")
    oil_type: Optional[str] = Field(default="Mixed Cooking Oil", description="Type of cooking oil (Sunflower, Mustard, Palm, etc.)")
    destination: Optional[str] = Field(default=None, description="Authorized recycling partner or destination plant")
    repurposing_method: Optional[str] = Field(default=None, description="Intended recycling method (Biodiesel Production, Industrial Soap, etc.)")
    collection_status: str = Field(default="Pending", description="Collection status: Pending, Collected, or Processed")
    reference_number: Optional[str] = Field(default=None, description="Disposal/consignment receipt or transfer reference")
    remarks: Optional[str] = Field(default=None, description="Kitchen notes or storage conditions")

    @field_validator("quantity")
    @classmethod
    def validate_positive_quantity(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Used cooking oil quantity must be strictly greater than 0.")
        return round(v, 2)

    @field_validator("unit")
    @classmethod
    def validate_unit(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if cleaned not in ["litres", "liter", "l", "ltr", "liters", "kg", "kilograms"]:
            raise ValueError("Unit must be explicitly 'litres' or 'kg'.")
        if cleaned in ["kg", "kilograms"]:
            return "kg"
        return "litres"

    @field_validator("collection_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        cleaned = v.strip().capitalize()
        if cleaned not in ["Pending", "Collected", "Processed"]:
            raise ValueError("Collection status must be 'Pending', 'Collected', or 'Processed'.")
        return cleaned


class UcoUpdateRequest(BaseModel):
    disposal_date: Optional[date] = None
    quantity: Optional[float] = Field(default=None, gt=0)
    unit: Optional[str] = None
    oil_type: Optional[str] = None
    destination: Optional[str] = None
    repurposing_method: Optional[str] = None
    collection_status: Optional[str] = None
    reference_number: Optional[str] = None
    remarks: Optional[str] = None
    collected_qty: Optional[float] = Field(default=None, ge=0)
    processed_qty: Optional[float] = Field(default=None, ge=0)

    @field_validator("quantity")
    @classmethod
    def validate_positive_quantity(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("Quantity must be positive.")
        return round(v, 2) if v is not None else None

    @field_validator("unit")
    @classmethod
    def validate_unit(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip().lower()
        if cleaned not in ["litres", "liter", "l", "ltr", "liters", "kg", "kilograms"]:
            raise ValueError("Unit must be explicitly 'litres' or 'kg'.")
        return "kg" if cleaned in ["kg", "kilograms"] else "litres"

    @field_validator("collection_status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        cleaned = v.strip().capitalize()
        if cleaned not in ["Pending", "Collected", "Processed"]:
            raise ValueError("Status must be 'Pending', 'Collected', or 'Processed'.")
        return cleaned


class UcoTransitionRequest(BaseModel):
    target_status: str = Field(..., description="Target status: 'Collected' or 'Processed'")
    destination: Optional[str] = None
    repurposing_method: Optional[str] = None
    reference_number: Optional[str] = None
    remarks: Optional[str] = None
    quantity_to_transition: Optional[float] = Field(
        default=None,
        gt=0,
        description="Optional partial quantity to transition (prevents double-counting)"
    )

    @field_validator("target_status")
    @classmethod
    def validate_target_status(cls, v: str) -> str:
        cleaned = v.strip().capitalize()
        if cleaned not in ["Collected", "Processed", "Pending"]:
            raise ValueError("Target status must be 'Collected' or 'Processed'.")
        return cleaned


class UcoRecordOut(BaseModel):
    id: str
    recorded_by: str
    disposal_date: date
    quantity: float
    unit: str
    quantity_kg: float
    collected_qty: float
    processed_qty: float
    oil_type: Optional[str] = None
    destination: Optional[str] = None
    repurposing_method: Optional[str] = None
    collection_status: str
    co2_avoided_kg: Optional[float] = None
    emission_factor_used: Optional[float] = None
    calculation_basis: Optional[str] = None
    measurement_status: Optional[str] = None
    reference_number: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MonthlyUcoTrend(BaseModel):
    month: str
    generated_litres: float
    collected_litres: float
    processed_litres: float
    co2_avoided_kg: float


class StatusDistribution(BaseModel):
    pending_litres: float
    collected_litres: float
    processed_litres: float
    pending_count: int
    collected_count: int
    processed_count: int


class PathwayInfo(BaseModel):
    name: str
    net_factor: float
    baseline: str
    processing_transport_emissions: float
    gross_avoided_emissions: float
    source: str
    description: str


class UcoSummaryResponse(BaseModel):
    total_oil_generated_litres: float
    total_oil_generated_kg: float
    total_oil_collected_litres: float
    total_oil_collected_kg: float
    total_oil_processed_litres: float
    total_oil_processed_kg: float
    pending_collection_litres: float
    pending_collection_kg: float
    estimated_net_co2e_avoided_kg: float
    verified_co2e_avoided_kg: float
    total_records: int
    monthly_trends: List[MonthlyUcoTrend]
    status_distribution: StatusDistribution
    supported_pathways: Dict[str, PathwayInfo]
    oil_density_kg_per_litre: float
    safety_guidelines: str
    methodology_summary: str
