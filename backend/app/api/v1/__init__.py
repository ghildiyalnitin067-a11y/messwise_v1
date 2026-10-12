from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.student import router as student_router
from app.api.v1.admin import router as admin_router
from app.api.v1.ngo import router as ngo_router
from app.api.v1.forecast import router as forecast_router
from app.api.v1.impact import router as impact_router
from app.api.v1.websocket import router as ws_router
from app.api.v1.stock import router as stock_router
from app.api.v1.uco import router as uco_router
from app.api.v1.preference import router as preference_router
from app.api.v1.analytics import router as analytics_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(student_router)
api_router.include_router(admin_router)
api_router.include_router(ngo_router)
api_router.include_router(forecast_router)
api_router.include_router(impact_router)
api_router.include_router(ws_router)
api_router.include_router(stock_router)
api_router.include_router(uco_router)
api_router.include_router(preference_router)
api_router.include_router(analytics_router)
