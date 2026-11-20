from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db
from backend.app.services.agmarknet_service import agmarknet_service

router = APIRouter()

@router.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint verifying backend and database connectivity."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "Mandi Mitra API",
        "version": "1.0.0",
        "database": db_status,
        "agmarknet_live_mode": agmarknet_service.is_live_enabled,
        "server_timestamp": datetime.utcnow().isoformat() + "Z"
    }
