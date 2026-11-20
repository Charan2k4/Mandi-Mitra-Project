from backend.app.api.endpoints.health import router as health_router
from backend.app.api.endpoints.locations import router as locations_router
from backend.app.api.endpoints.crops import router as crops_router
from backend.app.api.endpoints.mandis import router as mandis_router
from backend.app.api.endpoints.prices import router as prices_router
from backend.app.api.endpoints.advisor import router as advisor_router

__all__ = [
    "health_router",
    "locations_router",
    "crops_router",
    "mandis_router",
    "prices_router",
    "advisor_router"
]
