from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import require_role, get_optional_admin
from app.models.user import User

from app.ml.stock_analysis_engine import stock_engine
from app.schemas.stock import (
    BatchCreate,
    BatchOut,
    StockAnalysisResponse,
    ProcurementRecommendationResponse,
    StockAlertOut,
    StockSummaryResponse,
    StockDeductRequest,
    ItemCreate,
    ItemRegisterResponse,
    MenuAddonRecommendationOut,
    PublishAddonRequest,
    ActiveAddonOut,
    AddonOptInRequest,
    AddonOptInResponse
)


router = APIRouter(prefix="/stock", tags=["Stock Analysis & Perishable Shelf-Life Optimization"])


@router.get("/summary", response_model=StockSummaryResponse)
async def get_stock_summary():
    """Returns top-level stock KPIs, total waste risk, and critical batch alerts."""
    return stock_engine.get_stock_summary()


@router.get("/items", response_model=List[StockAnalysisResponse])
async def get_all_stock_items():
    """Returns full stock analysis and FIFO batch status for all tracked ingredients."""
    return stock_engine.get_all_ingredients_analysis()


@router.get("/alerts", response_model=List[StockAlertOut])
async def get_stock_alerts():
    """Returns sorted critical, warning, and low-stock alerts across ingredients."""
    return stock_engine.get_critical_alerts()


@router.get("/addon-recommendations", response_model=List[MenuAddonRecommendationOut])
async def get_menu_addon_recommendations():
    """
    Identifies near-expiry vegetables and perished batches, generating culinary
    add-on recommendations to rescue stock before end-of-life spoilage.
    """
    return stock_engine.get_menu_addon_recommendations()


from app.services.admin_service import admin_service
from app.schemas.admin import MenuUpdateRequest


@router.post("/publish-addon", response_model=ActiveAddonOut, status_code=status.HTTP_201_CREATED)
async def publish_menu_addon(
    req: PublishAddonRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_admin)
):
    """
    Publishes a zero-waste menu add-on to the student portal menu for a given meal session.
    Also appends the dish to today's MealSchedule in the database for that session.
    """
    addon = stock_engine.publish_menu_addon(
        ingredient_id=req.ingredient_id,
        addon_name=req.addon_name,
        meal_session=req.meal_session,
        portions_target=req.portions_target,
        description=req.description,
        eco_points=req.eco_points,
        addon_id=req.addon_id
    )
    try:
        await admin_service.update_daily_menu(
            db=db,
            req=MenuUpdateRequest(
                session=req.meal_session,
                menu=req.addon_name,
                append_dish=True
            )
        )
    except Exception:
        pass
    return addon


@router.get("/active-addons", response_model=List[ActiveAddonOut])
async def get_active_menu_addons(meal_session: Optional[str] = None):
    """
    Returns active zero-waste sustainability menu add-ons, optionally filtered by meal session.
    """
    return stock_engine.get_active_menu_addons(meal_session=meal_session)


@router.post("/addons/opt-in", response_model=AddonOptInResponse)
async def opt_in_menu_addon(req: AddonOptInRequest):
    """
    Student opt-in for a zero-waste special:
    Claims portion, awards eco-points, and automatically executes FEFO stock deduction.
    """
    res = stock_engine.opt_in_addon(addon_id=req.addon_id, student_id=req.student_id or "usr-student-01")
    return res


@router.get("/{ingredient_id}", response_model=StockAnalysisResponse)
async def get_ingredient_analysis(ingredient_id: str):
    """Returns detailed stock analysis for a specific ingredient (e.g. onion)."""
    if ingredient_id not in stock_engine.catalog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient '{ingredient_id}' not found in catalog."
        )
    return stock_engine.get_stock_analysis_payload(ingredient_id)


@router.post("/batch", response_model=BatchOut, status_code=status.HTTP_201_CREATED)
async def add_stock_batch(
    req: BatchCreate,
    current_user: Optional[User] = Depends(get_optional_admin)
):
    """Adds a new batch to FIFO inventory queue."""
    batch = stock_engine.add_batch(
        ingredient_id=req.ingredient_id,
        qty=req.qty,
        received_date=req.received_date,
        shelf_life_days=req.shelf_life_days,
        cost_per_kg=req.cost_per_kg,
        co2_per_kg=req.co2_per_kg,
        batch_id=req.batch_id
    )
    return batch


@router.get("/{ingredient_id}/procurement", response_model=ProcurementRecommendationResponse)
async def get_procurement_recommendation(
    ingredient_id: str,
    safety_factor: float = 1.1,
    planning_horizon_days: int = 5
):
    """Generates demand-forecast-linked procurement recommendation to prevent overstock."""
    if ingredient_id not in stock_engine.catalog:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient '{ingredient_id}' not found in catalog."
        )
    return stock_engine.get_procurement_recommendation(
        ingredient_id=ingredient_id,
        safety_factor=safety_factor,
        planning_horizon_days=planning_horizon_days
    )


@router.post("/deduct")
async def deduct_stock_usage(
    req: StockDeductRequest,
    current_user: Optional[User] = Depends(get_optional_admin)
):
    """Deducts consumed stock via FIFO from oldest active batches."""
    return stock_engine.deduct_usage_detailed(req.ingredient_id, req.qty_to_deduct)


@router.post("/item", response_model=ItemRegisterResponse, status_code=status.HTTP_201_CREATED)
async def register_stock_item(
    req: ItemCreate,
    current_user: Optional[User] = Depends(get_optional_admin)
):
    """Registers a new raw vegetable or prepared meal into inventory."""
    return stock_engine.register_item(
        name=req.name,
        category=req.category,
        unit=req.unit,
        consumption_per_meal=req.consumption_per_meal,
        cost_per_unit=req.cost_per_unit,
        co2_per_unit=req.co2_per_unit,
        shelf_life_days=req.shelf_life_days,
        initial_qty=req.initial_qty,
        received_date=req.received_date,
        item_id=req.item_id
    )



