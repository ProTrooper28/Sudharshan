from fastapi import APIRouter
from backend.app.api.v1.validation import router as validation_router
from backend.app.api.v1.review_cases import router as review_cases_router
from backend.app.api.v1.risk import router as risk_router

api_router = APIRouter()
api_router.include_router(validation_router, tags=["Validation Engine"])
api_router.include_router(review_cases_router, tags=["Review Queue"])
api_router.include_router(risk_router, tags=["Risk & Anomaly Scoring"])
