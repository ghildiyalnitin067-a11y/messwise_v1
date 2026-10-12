from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.core.security import decode_access_token
from app.models.user import User, StudentProfile, AdminProfile, NgoProfile

security = HTTPBearer(auto_error=False)


async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided"
        )

    # Support development & demo mock tokens
    if auth.credentials.startswith("mock-"):
        role = "admin" if "admin" in auth.credentials else "ngo" if "ngo" in auth.credentials else "student"
        stmt = (
            select(User)
            .options(
                selectinload(User.student_profile),
                selectinload(User.admin_profile),
                selectinload(User.ngo_profile)
            )
            .where(User.role == role)
            .limit(1)
        )
        res = await db.execute(stmt)
        mock_user = res.scalar_one_or_none()
        if mock_user:
            return mock_user

    payload = decode_access_token(auth.credentials)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token"
        )
    user_id = payload["sub"]
    stmt = (
        select(User)
        .options(
            selectinload(User.student_profile),
            selectinload(User.admin_profile),
            selectinload(User.ngo_profile)
        )
        .where(User.id == user_id)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user


async def get_optional_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not auth or not auth.credentials:
        return None

    if auth.credentials.startswith("mock-"):
        role = "admin" if "admin" in auth.credentials else "ngo" if "ngo" in auth.credentials else "student"
        stmt = (
            select(User)
            .options(
                selectinload(User.student_profile),
                selectinload(User.admin_profile),
                selectinload(User.ngo_profile)
            )
            .where(User.role == role)
            .limit(1)
        )
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    try:
        payload = decode_access_token(auth.credentials)
        if not payload or "sub" not in payload:
            return None
        user_id = payload["sub"]
        stmt = (
            select(User)
            .options(
                selectinload(User.student_profile),
                selectinload(User.admin_profile),
                selectinload(User.ngo_profile)
            )
            .where(User.id == user_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    except Exception:
        return None


def require_role(allowed_roles: List[str]):
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: role must be one of {allowed_roles}"
            )
        return current_user
    return role_checker


async def get_current_student(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> StudentProfile:
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student role permissions required"
        )

    if current_user.student_profile:
        return current_user.student_profile

    result = await db.execute(select(StudentProfile).where(StudentProfile.user_id == current_user.id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Student profile not found"
        )
    return student


async def get_current_admin(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> AdminProfile:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role permissions required"
        )

    if current_user.admin_profile:
        return current_user.admin_profile

    result = await db.execute(select(AdminProfile).where(AdminProfile.user_id == current_user.id))
    admin = result.scalar_one_or_none()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin profile not found"
        )
    return admin


async def get_current_ngo(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> NgoProfile:
    if current_user.role != "ngo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="NGO role permissions required"
        )

    if current_user.ngo_profile:
        return current_user.ngo_profile

    result = await db.execute(select(NgoProfile).where(NgoProfile.user_id == current_user.id))
    ngo = result.scalar_one_or_none()
    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="NGO profile not found"
        )
    return ngo


async def get_optional_admin(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Allows demo or supervisor requests if no JWT provided, otherwise validates JWT."""
    if not auth or not auth.credentials or auth.credentials.startswith("mock-"):
        return None
    try:
        payload = decode_access_token(auth.credentials)
        if not payload or "sub" not in payload:
            return None
        stmt = select(User).where(User.id == payload["sub"])
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    except Exception:
        return None

