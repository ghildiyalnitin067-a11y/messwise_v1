from typing import Optional
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi.security import HTTPAuthorizationCredentials
from app.db.session import get_db
from app.api.deps import get_current_user, require_role, security
from app.models.user import User
from app.services.student_service import student_service
from app.schemas.student import (
    TodayMealsResponse,
    WeeklyMenuResponse,
    ToggleBookingRequest,
    ToggleBookingResponse,
    FeedbackRequest,
    FeedbackResponse,
    BookingHistoryResponse,
    StudentImpactResponse,
    StudentLeaderboardResponse,
    PointsEarnRequest,
    PointsEarnResponse
)

router = APIRouter(prefix="/student", tags=["Student Portal Operations"])


async def get_optional_student_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    if auth and auth.credentials:
        user = await get_current_user(auth, db)
        if user.role != "student":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: role must be student"
            )
        student_id = user.student_profile.id if user.student_profile else user.id
        student_name = user.student_profile.name if user.student_profile else user.name
        return student_id, student_name

    # Unauthenticated / demo local fallback
    return "usr-student-01", "Nitin Sharma"


@router.get("/today-meals", response_model=TodayMealsResponse)
@router.get("/meals/today", response_model=TodayMealsResponse)
async def get_today_meals(
    student_info: tuple = Depends(get_optional_student_user),
    db: AsyncSession = Depends(get_db)
):
    student_id, _ = student_info
    return await student_service.get_today_meals(db=db, student_id=student_id)


@router.get("/menu/weekly", response_model=WeeklyMenuResponse)
@router.get("/meals/weekly", response_model=WeeklyMenuResponse)
async def get_weekly_dining_menu(
    db: AsyncSession = Depends(get_db)
):
    return await student_service.get_weekly_menu(db=db)


@router.post("/toggle-booking", response_model=ToggleBookingResponse)
@router.post("/meals/toggle", response_model=ToggleBookingResponse)
async def toggle_booking(
    req: ToggleBookingRequest,
    student_info: tuple = Depends(get_optional_student_user),
    db: AsyncSession = Depends(get_db)
):
    student_id, student_name = student_info
    return await student_service.toggle_booking(db=db, student_id=student_id, req=req, student_name=student_name)


@router.post("/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    req: FeedbackRequest,
    student_info: tuple = Depends(get_optional_student_user),
    db: AsyncSession = Depends(get_db)
):
    student_id, _ = student_info
    return await student_service.submit_feedback(db=db, student_id=student_id, req=req)


@router.get("/history", response_model=BookingHistoryResponse)
async def get_history(
    student_info: tuple = Depends(get_optional_student_user),
    db: AsyncSession = Depends(get_db)
):
    student_id, _ = student_info
    return await student_service.get_booking_history(db=db, student_id=student_id)


@router.get("/impact", response_model=StudentImpactResponse)
async def get_impact(
    student_info: tuple = Depends(get_optional_student_user),
    db: AsyncSession = Depends(get_db)
):
    student_id, _ = student_info
    return await student_service.get_student_impact(db=db, student_id=student_id)


@router.get("/leaderboard", response_model=StudentLeaderboardResponse)
async def get_leaderboard(
    student_info: tuple = Depends(get_optional_student_user),
    db: AsyncSession = Depends(get_db)
):
    student_id, _ = student_info
    return await student_service.get_leaderboard(db=db, student_id=student_id)


@router.post("/points/earn", response_model=PointsEarnResponse)
@router.post("/points/sync", response_model=PointsEarnResponse)
async def earn_eco_points(
    req: PointsEarnRequest,
    student_info: tuple = Depends(get_optional_student_user),
    db: AsyncSession = Depends(get_db)
):
    student_id, _ = student_info
    return await student_service.earn_points(db=db, req=req, student_id=student_id)
