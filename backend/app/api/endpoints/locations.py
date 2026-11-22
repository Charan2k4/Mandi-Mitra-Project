from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.location import State, District
from backend.app.schemas.location import StateBase, DistrictBase, StateWithDistricts
from backend.app.services.geocode_service import reverse_geocode_location

router = APIRouter()

@router.get("/states", response_model=List[StateBase], tags=["Locations"])
def get_states(db: Session = Depends(get_db)):
    """Retrieve all Indian agricultural states."""
    return db.query(State).order_by(State.name).all()

@router.get("/districts", response_model=List[DistrictBase], tags=["Locations"])
def get_districts(
    state_id: Optional[int] = Query(None, description="Filter by state ID"),
    db: Session = Depends(get_db)
):
    """Retrieve districts, optionally filtered by state."""
    query = db.query(District)
    if state_id is not None:
        query = query.filter(District.state_id == state_id)
    return query.order_by(District.name).all()

@router.get("/reverse-geocode", tags=["Locations"])
def reverse_geocode(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude"),
    lng: float = Query(..., ge=-180.0, le=180.0, description="Longitude"),
    db: Session = Depends(get_db)
):
    """
    Reverse geocode GPS coordinates to a human-readable local name
    and match to the nearest supported State and District.
    """
    return reverse_geocode_location(lat, lng, db)
