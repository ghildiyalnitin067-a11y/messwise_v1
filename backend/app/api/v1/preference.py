from typing import Optional
from fastapi import APIRouter, Depends, status, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.security import HTTPAuthorizationCredentials

from app.db.session import get_db
from app.api.deps import get_current_user, security
from app.services.preference_service import preference_service
from app.schemas.preference import (
    StudentPreferencePollResponse,
    StudentVoteRequest,
    StudentVoteResponse,
    AdminPreferenceOptimizationRequest,
    AdminPreferenceOptimizationResponse,
)

router = APIRouter(prefix="/preference", tags=["Meal Preference & Waste Optimization"])


async def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    if auth and auth.credentials:
        try:
            user = await get_current_user(auth, db)
            student_id = user.student_profile.id if user.student_profile else user.id
            return student_id, user.role
        except Exception:
            pass
    return "usr-student-01", "student"


@router.get("/poll", response_model=StudentPreferencePollResponse)
async def get_preference_poll(
    session: str = Query("lunch", description="Meal session name (e.g. lunch, dinner)"),
    user_info: tuple = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    student_id, _ = user_info
    return await preference_service.get_preference_poll(db=db, session_name=session, student_id=student_id)


@router.post("/vote", response_model=StudentVoteResponse)
async def submit_preference_vote(
    req: StudentVoteRequest,
    user_info: tuple = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    student_id, _ = user_info
    return await preference_service.record_student_vote(db=db, student_id=student_id, req=req)


@router.post("/optimize", response_model=AdminPreferenceOptimizationResponse)
async def optimize_menu(
    req: AdminPreferenceOptimizationRequest,
    user_info: tuple = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    # Admin optimization action
    return await preference_service.optimize_menu_for_wastage(db=db, req=req)
