from fastapi import APIRouter
from backend.app.api.endpoints import (
    health_router,
    locations_router,
    crops_router,
    mandis_router,
    prices_router,
    advisor_router,
    preferences_router
)

api_router = APIRouter()
api_router.include_router(health_router, prefix="", tags=["Health"])
api_router.include_router(locations_router, prefix="/locations", tags=["Locations"])
api_router.include_router(crops_router, prefix="/crops", tags=["Crops"])
api_router.include_router(mandis_router, prefix="/mandis", tags=["Mandis"])
api_router.include_router(prices_router, prefix="/prices", tags=["Prices"])
api_router.include_router(advisor_router, prefix="/advisor", tags=["Advisor"])
api_router.include_router(preferences_router, prefix="/preferences", tags=["Preferences"])
