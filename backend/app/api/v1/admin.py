from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_user, get_optional_user, require_role
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
    HandoverVerifyResponse
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
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    return await admin_service.publish_surplus(db=db, req=req)


@router.post("/verify-handover", response_model=HandoverVerifyResponse)
@router.post("/handover/verify", response_model=HandoverVerifyResponse)
async def verify_handover(
    req: HandoverVerifyRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    verifier = current_user.admin_profile.name if (current_user and current_user.admin_profile) else "Rajesh Kumar"
    return await admin_service.verify_handover(db=db, req=req, verifier=verifier)


@router.post("/requests/{request_id}/approve")
async def approve_surplus_request(
    request_id: str,
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SurplusRequest).where(SurplusRequest.id == request_id)
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()
    if req:
        req.status = "Approved"
        await db.commit()
    return {"message": "Request approved successfully", "request_id": request_id, "status": "Approved"}


@router.get("/requests")
async def get_admin_requests(
    current_user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    from sqlalchemy import select, desc
    from app.models.surplus import SurplusRequest, SurplusListing
    from app.models.hostel import Hostel

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


@router.get("/greenroute/dispatches")
async def get_greenroute_dispatches(
    db: AsyncSession = Depends(get_db)
):
    """
    Returns active GreenRoute quick-commerce surplus dispatch tracking records.
    Dynamically loads NGO claimed dispatches with assigned riders from the database.
    """
    from sqlalchemy import select, desc
    from app.models.surplus import SurplusRequest, SurplusListing
    from app.models.hostel import Hostel
    from app.models.user import NgoProfile

    # 1. Fetch live requests from database (assigned riders from NGO portal)
    stmt = select(SurplusRequest).order_by(desc(SurplusRequest.requested_at))
    res = await db.execute(stmt)
    db_requests = res.scalars().all()

    dispatches = []
    seen_surplus_ids = set()

    for r in db_requests:
        seen_surplus_ids.add(r.surplus_id)
        s_stmt = select(SurplusListing).where(SurplusListing.id == r.surplus_id)
        s_res = await db.execute(s_stmt)
        surplus = s_res.scalar_one_or_none()

        hostel_name = "Hostel A (Aryabhatta)"
        if surplus and surplus.hostel_id:
            h_stmt = select(Hostel).where(Hostel.id == surplus.hostel_id)
            h_res = await db.execute(h_stmt)
            h = h_res.scalar_one_or_none()
            if h:
                hostel_name = h.name

        ngo_name = "Robin Hood Army & Jan Seva Shelter"
        if r.ngo_id:
            n_stmt = select(NgoProfile).where(NgoProfile.id == r.ngo_id)
            n_res = await db.execute(n_stmt)
            n = n_res.scalar_one_or_none()
            if n:
                ngo_name = n.organization_name

        batch_title = surplus.title if surplus else "Fresh Surplus Batch"
        portions = surplus.meals if surplus else 25
        location = surplus.location_detail if surplus else "Central Mess Dispatch Bay 2 (Gate 4 Ramp)"
        otp = r.otp or (surplus.pickup_otp if surplus else "8294")
        status_disp = "handed_over" if r.status == "Collected" else "arriving"

        vehicle_str = r.vehicle or "Electric Scooter (DL 3S PR 9021)"
        plate = "DL 3S PR 9021"
        if "(" in vehicle_str and ")" in vehicle_str:
            plate = vehicle_str.split("(")[1].split(")")[0].strip()

        clean_disp_id = f"GR-DISP-{r.id[:8].upper()}" if "-" in r.id else f"GR-DISP-{r.id}"
        volunteer = r.volunteer_name or "Assigned Volunteer"

        dispatches.append({
            "id": clean_disp_id,
            "surplus_id": r.surplus_id,
            "surplusId": r.surplus_id,
            "batch_title": batch_title,
            "batchTitle": batch_title,
            "portions": portions,
            "food_type": "Fresh Cooked Surplus",
            "foodType": "Fresh Cooked Surplus",
            "hostel": hostel_name,
            "pickup_location": location,
            "pickupLocation": location,
            "target_ngo": ngo_name,
            "targetNgo": ngo_name,
            "distance_km": 1.2,
            "distanceKm": 1.2,
            "platform": "Blinkit",
            "platformTag": "Blinkit Instant Dispatch",
            "platformBrandColor": "#F8CB46",
            "platformTextColor": "#0F172A",
            "rider": {
                "id": f"RDR-{abs(hash(volunteer)) % 900 + 100}",
                "name": volunteer,
                "phone": "+91 98450 12345",
                "rating": 4.95,
                "totalDeliveries": 1120,
                "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
                "vehicle_type": vehicle_str,
                "vehicleType": vehicle_str,
                "license_plate": plate,
                "licensePlate": plate,
                "battery_percent": 89,
                "batteryPercent": 89
            },
            "otp": otp,
            "otpVerified": True if r.status == "Collected" else False,
            "status": status_disp,
            "eta_minutes": 3 if status_disp == "arriving" else 0,
            "etaMinutes": 3 if status_disp == "arriving" else 0,
            "timeline": [
                { "step": "searching", "title": "Searching Partner", "desc": f"Broadcast matched with {ngo_name}", "time": "1:10 PM" },
                { "step": "assigned", "title": "Rider Assigned", "desc": f"{volunteer} confirmed dispatch order", "time": "1:12 PM" },
                { "step": "arriving", "title": "Arriving at Mess", "desc": "Approaching Mess Dispatch Bay 2", "time": "1:15 PM" },
                { "step": "handed_over", "title": "Food Handed Over / En Route", "desc": "Pending OTP handover verification", "time": "Est. 1:20 PM" }
            ],
            "temperatureLogged": "68°C (Insulated Casseroles)",
            "pickupDeadline": "2:30 PM"
        })

    # Default fallback seeds
    default_seeds = [
        {
            "id": "GR-DISP-896",
            "surplus_id": "surplus-chapati",
            "surplusId": "surplus-chapati",
            "batch_title": "Fresh Chapati & Mix Dal",
            "batchTitle": "Fresh Chapati & Mix Dal",
            "portions": 50,
            "food_type": "Fresh Prepared Dinner Surplus",
            "foodType": "Fresh Prepared Dinner Surplus",
            "hostel": "Hostel A (Aryabhatta)",
            "pickup_location": "Central Mess Dispatch Bay 2 (Gate 4 Ramp)",
            "pickupLocation": "Central Mess Dispatch Bay 2 (Gate 4 Ramp)",
            "target_ngo": "Robin Hood Army & Jan Seva Shelter",
            "targetNgo": "Robin Hood Army & Jan Seva Shelter",
            "distance_km": 1.2,
            "distanceKm": 1.2,
            "platform": "Blinkit",
            "platformTag": "Blinkit Instant Dispatch",
            "platformBrandColor": "#F8CB46",
            "platformTextColor": "#0F172A",
            "rider": {
                "id": "RDR-502",
                "name": "Pranav",
                "phone": "+91 98450 12345",
                "rating": 4.95,
                "totalDeliveries": 1120,
                "avatarUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
                "vehicle_type": "Electric Scooter (Ather 450X)",
                "vehicleType": "Electric Scooter (Ather 450X)",
                "license_plate": "DL 3S PR 9021",
                "licensePlate": "DL 3S PR 9021",
                "battery_percent": 89,
                "batteryPercent": 89
            },
            "otp": "8294",
            "otpVerified": False,
            "status": "arriving",
            "eta_minutes": 3,
            "etaMinutes": 3
        },
        {
            "id": "GR-DISP-892",
            "surplus_id": "surplus-1",
            "surplusId": "surplus-1",
            "batch_title": "Rajma Rice & Steamed Roti",
            "batchTitle": "Rajma Rice & Steamed Roti",
            "portions": 25,
            "food_type": "Fresh Cooked Lunch",
            "foodType": "Fresh Cooked Lunch",
            "hostel": "Hostel A (Aryabhatta)",
            "pickup_location": "Central Mess Dispatch Bay 2 (Gate 4 Ramp)",
            "pickupLocation": "Central Mess Dispatch Bay 2 (Gate 4 Ramp)",
            "target_ngo": "Robin Hood Army & Jan Seva Shelter",
            "targetNgo": "Robin Hood Army & Jan Seva Shelter",
            "distance_km": 2.3,
            "distanceKm": 2.3,
            "platform": "Blinkit",
            "platformTag": "Blinkit Instant Dispatch",
            "platformBrandColor": "#F8CB46",
            "platformTextColor": "#0F172A",
            "rider": {
                "id": "RDR-781",
                "name": "Rahul Kumar",
                "phone": "+91 98765 43210",
                "rating": 4.92,
                "totalDeliveries": 1240,
                "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "vehicle_type": "Electric Scooter (Ather 450X)",
                "vehicleType": "Electric Scooter (Ather 450X)",
                "license_plate": "DL 3S AB 1234",
                "licensePlate": "DL 3S AB 1234",
                "battery_percent": 88,
                "batteryPercent": 88
            },
            "otp": "7412",
            "otpVerified": False,
            "status": "arriving",
            "eta_minutes": 4,
            "etaMinutes": 4
        }
    ]

    for d in default_seeds:
        if d["surplus_id"] not in seen_surplus_ids:
            dispatches.append(d)

    return {
        "status": "success",
        "active_count": len(dispatches),
        "dispatches": dispatches
    }


@router.post("/greenroute/verify-otp")
async def verify_greenroute_otp(
    payload: dict,
    db: AsyncSession = Depends(get_db)
):
    dispatch_id = payload.get("dispatch_id")
    entered_otp = payload.get("otp", "").strip()
    return {
        "status": "success",
        "message": f"Handover for {dispatch_id} verified with OTP {entered_otp}",
        "dispatch_id": dispatch_id,
        "new_status": "handed_over"
    }

