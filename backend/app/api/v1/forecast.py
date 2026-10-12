from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional

from app.db.session import get_db
from app.services.forecast_service import forecast_service
from app.schemas.ml import (
    ForecastPredictRequest,
    ForecastPredictResponse,
    WhatIfSimulateRequest,
    WhatIfSimulateResponse,
    ForecastAccuracyResponse
)

router = APIRouter(prefix="/forecast", tags=["Demand Forecasting & Simulation"])


@router.post("/predict", response_model=ForecastPredictResponse)
async def predict_demand(
    req: ForecastPredictRequest,
    db: AsyncSession = Depends(get_db)
):
    return await forecast_service.predict_demand(db=db, req=req)


@router.post("/simulate", response_model=WhatIfSimulateResponse)
async def simulate_what_if(req: WhatIfSimulateRequest):
    return forecast_service.simulate_what_if(req=req)


@router.get("/accuracy", response_model=ForecastAccuracyResponse)
async def get_forecast_accuracy(db: AsyncSession = Depends(get_db)):
    return await forecast_service.get_accuracy_metrics(db=db)


@router.get("/ml/metrics")
async def get_ml_model_metrics():
    """
    Returns the full model comparison report (XGBoost vs Random Forest vs Baseline)
    generated during training. Includes MAE, RMSE, R², latency, and model size.
    """
    return forecast_service.get_ml_metrics()


class OptimizeRequest(BaseModel):
    predicted_demand: int = Field(..., ge=50, le=2000,
                                  description="Expected meal count from ML prediction")
    available_inventory: float = Field(default=0.0, ge=0,
                                       description="Pre-cooked / carry-forward stock (meals)")
    portion_size_kg: float = Field(default=0.45, gt=0,
                                   description="Average portion weight in kg")
    safety_buffer_pct: float = Field(default=2.6, ge=0, le=20)
    max_kitchen_capacity: int = Field(default=900, ge=100)


@router.post("/optimize")
async def optimize_food_preparation(req: OptimizeRequest):
    """
    Food Preparation Optimizer.
    Takes an ML-predicted demand figure and returns the recommended cook quantity,
    projected surplus, estimated cost, waste risk, and NGO redistribution advice.
    """
    return forecast_service.optimize_preparation(
        predicted_demand=req.predicted_demand,
        available_inventory=req.available_inventory,
        portion_size_kg=req.portion_size_kg,
        safety_buffer_pct=req.safety_buffer_pct,
        max_kitchen_capacity=req.max_kitchen_capacity,
    )

