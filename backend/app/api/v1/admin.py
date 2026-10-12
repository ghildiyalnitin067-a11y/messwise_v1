from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_user, require_role
from app.models.user import User
from app.models.surplus import SurplusRequest
from app.services.admin_service import admin_service
from app.services.forecast_service import forecast_service
from app.schemas.admin import (
    AdminStatsResponse,
    ProductionLogRequest,
    ProductionLogResponse,
    WasteLogRequest,
    WasteLogResponse,
    WasteHeatmapResponse,
    SurplusPublishRequest,
    SurplusPublishResponse,
    HandoverVerifyRequest,
    HandoverVerifyResponse,
    MenuUpdateRequest,
    AdminMenuResponse
)
from app.schemas.ml import ForecastPredictRequest, ForecastPredictResponse

router = APIRouter(prefix="/admin", tags=["Mess Administration & Kitchen Operations"])


@router.get("/stats", response_model=AdminStatsResponse)
@router.get("/dashboard/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    hostel_id = current_user.admin_profile.hostel_id if current_user.admin_profile else None
    return await admin_service.get_dashboard_stats(db=db, hostel_id=hostel_id)


@router.post("/forecast/predict", response_model=ForecastPredictResponse)
async def admin_forecast_predict(
    req: ForecastPredictRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    return await forecast_service.predict_demand(db=db, req=req)


@router.post("/production/log", response_model=ProductionLogResponse, status_code=status.HTTP_201_CREATED)
async def log_production(
    req: ProductionLogRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    supervisor = current_user.admin_profile.name if current_user.admin_profile else "Rajesh Kumar"
    return await admin_service.log_production(db=db, req=req, supervisor_name=supervisor)


@router.post("/waste/log", response_model=WasteLogResponse, status_code=status.HTTP_201_CREATED)
async def log_waste(
    req: WasteLogRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    return await admin_service.log_waste(db=db, req=req)


@router.get("/waste/heatmap", response_model=WasteHeatmapResponse)
async def get_waste_heatmap(
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    return await admin_service.get_waste_heatmap(db=db)


@router.post("/publish-surplus", response_model=SurplusPublishResponse, status_code=status.HTTP_201_CREATED)
@router.post("/surplus/publish", response_model=SurplusPublishResponse, status_code=status.HTTP_201_CREATED)
async def publish_surplus(
    req: SurplusPublishRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    return await admin_service.publish_surplus(db=db, req=req)


@router.post("/verify-handover", response_model=HandoverVerifyResponse)
@router.post("/handover/verify", response_model=HandoverVerifyResponse)
async def verify_handover(
    req: HandoverVerifyRequest,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    verifier = current_user.admin_profile.name if current_user.admin_profile else "Rajesh Kumar"
    return await admin_service.verify_handover(db=db, req=req, verifier=verifier)


@router.post("/requests/{request_id}/approve")
async def approve_surplus_request(
    request_id: str,
    current_user: User = Depends(require_role(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SurplusRequest).where(SurplusRequest.id == request_id)
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()
    if req:
        req.status = "Approved"
        await db.commit()
    return {"message": "Request approved successfully", "request_id": request_id, "status": "Approved"}


@router.get("/menu", response_model=AdminMenuResponse)
async def get_daily_menu(
    db: AsyncSession = Depends(get_db)
):
    return await admin_service.get_daily_menu(db=db)


@router.post("/menu", response_model=AdminMenuResponse)
@router.post("/menu/push", response_model=AdminMenuResponse)
async def update_daily_menu(
    req: MenuUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    return await admin_service.update_daily_menu(db=db, req=req)
