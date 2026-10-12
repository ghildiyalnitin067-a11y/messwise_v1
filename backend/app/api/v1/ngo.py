from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.db.session import get_db
from app.api.deps import get_optional_user
from app.models.user import User
from app.models.surplus import SurplusRequest, SurplusListing
from app.models.hostel import Hostel
from app.services.ngo_service import ngo_service
from app.schemas.ngo import (
    SurplusFeedResponse,
    SurplusRequestCreate,
    SurplusRequestOut,
    DistributionLogRequest,
    DistributionRecordOut,
    NgoDemandCreate,
    NgoDemandOut,
    SmartMatchResponse
)

router = APIRouter(prefix="/ngo", tags=["NGO Food Rescue Logistics"])


@router.get("/surplus-feed", response_model=SurplusFeedResponse)
@router.get("/surplus/available", response_model=SurplusFeedResponse)
async def get_surplus_feed(
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else None
    return await ngo_service.get_surplus_feed(db=db, ngo_id=ngo_id)


@router.get("/requests")
async def get_my_requests(
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SurplusRequest).order_by(desc(SurplusRequest.requested_at))
    res = await db.execute(stmt)
    requests = res.scalars().all()
    out = []
    for r in requests:
        s_title = "Fresh Surplus Batch"
        hostel_name = "Hostel A"
        meals_count = 25
        if r.surplus_id:
            s_stmt = select(SurplusListing).where(SurplusListing.id == r.surplus_id)
            s_res = await db.execute(s_stmt)
            s_obj = s_res.scalar_one_or_none()
            if s_obj:
                s_title = s_obj.title
                meals_count = s_obj.meals
                if s_obj.hostel_id:
                    h_stmt = select(Hostel).where(Hostel.id == s_obj.hostel_id)
                    h_res = await db.execute(h_stmt)
                    h = h_res.scalar_one_or_none()
                    if h:
                        hostel_name = h.name
        out.append({
            "id": r.id,
            "surplus_id": r.surplus_id,
            "food_title": s_title,
            "meals": meals_count,
            "hostel": hostel_name,
            "volunteer_name": r.volunteer_name or "Pranav",
            "vehicle": r.vehicle or "Electric Scooter (DL 3S PR 9021)",
            "status": r.status or "Approved",
            "pickup_time_estimated": r.eta or "Within 15 mins",
            "otp": r.otp or "8294"
        })
    return out


@router.post("/demands", response_model=NgoDemandOut)
async def register_demand(
    req: NgoDemandCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else "usr-ngo-01"
    return await ngo_service.register_demand(db=db, ngo_id=ngo_id, req=req)


@router.get("/smart-matches", response_model=SmartMatchResponse)
async def get_smart_matches(
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else "usr-ngo-01"
    return await ngo_service.get_smart_matches(db=db, ngo_id=ngo_id)


@router.post("/claim-surplus/{surplus_id}", response_model=SurplusRequestOut, status_code=status.HTTP_201_CREATED)
@router.post("/surplus/{surplus_id}/request", response_model=SurplusRequestOut, status_code=status.HTTP_201_CREATED)
async def claim_surplus(
    surplus_id: str,
    req: SurplusRequestCreate,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else "usr-ngo-01"
    ngo_org = current_user.ngo_profile.organization_name if (current_user and current_user.ngo_profile) else "Helping Hands NGO"
    return await ngo_service.create_surplus_request(
        db=db,
        surplus_id=surplus_id,
        ngo_id=ngo_id,
        req=req,
        ngo_org_name=ngo_org
    )


@router.post("/log-distribution", response_model=DistributionRecordOut, status_code=status.HTTP_201_CREATED)
@router.post("/distribution/log", response_model=DistributionRecordOut, status_code=status.HTTP_201_CREATED)
async def log_distribution(
    req: DistributionLogRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    ngo_id = current_user.ngo_profile.id if (current_user and current_user.ngo_profile) else "usr-ngo-01"
    ngo_org = current_user.ngo_profile.organization_name if (current_user and current_user.ngo_profile) else "Helping Hands NGO"
    return await ngo_service.log_distribution(
        db=db,
        ngo_id=ngo_id,
        req=req,
        ngo_org_name=ngo_org
    )
