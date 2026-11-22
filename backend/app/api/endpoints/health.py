from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database.session import get_db, is_postgres_configured
from backend.app.services.agmarknet_service import agmarknet_service

router = APIRouter()

@router.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint verifying backend, database connectivity, and data mode."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = f"unhealthy: {str(exc)}"

    db_type = "postgresql" if is_postgres_configured() else "sqlite"
    coverage = {}
    if db_status == "healthy":
        try:
            coverage = agmarknet_service.get_data_coverage_stats(db)
        except Exception:
            pass

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": "Mandi Mitra API",
        "version": "1.0.0",
        "database": db_status,
        "database_type": db_type,
        "is_custom_database": is_postgres_configured(),
        "agmarknet_live_mode": agmarknet_service.is_live_enabled,
        "data_classification": "live" if coverage.get("live_records", 0) > 0 else "benchmark_verified",
        "live_records_count": coverage.get("live_records", 0),
        "total_records_count": coverage.get("total_records", 0),
        "server_timestamp": datetime.utcnow().isoformat() + "Z"
    }
