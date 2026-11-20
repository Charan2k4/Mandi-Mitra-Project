from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.mandi import Mandi
from backend.app.models.location import District, State
from backend.app.schemas.mandi import MandiBase, MandiNearby
from backend.app.services.mandi_service import get_all_mandis, find_nearby_mandis

router = APIRouter()

@router.get("", response_model=List[MandiBase], tags=["Mandis"])
def list_mandis(
    district_id: Optional[int] = Query(None, description="Filter by district"),
    db: Session = Depends(get_db)
):
    """Retrieve all APMC mandis with coordinates."""
    mandis = db.query(Mandi).join(District).join(State).all()
    if district_id:
        mandis = [m for m in mandis if m.district_id == district_id]
        
    results = []
    for m in mandis:
        m_dict = {
            "id": m.id,
            "district_id": m.district_id,
            "name": m.name,
            "code": m.code,
            "latitude": m.latitude,
            "longitude": m.longitude,
            "address": m.address,
            "contact_phone": m.contact_phone,
            "operating_days": m.operating_days,
            "district_name": m.district.name if m.district else None,
            "state_name": m.district.state.name if (m.district and m.district.state) else None
        }
        results.append(MandiBase(**m_dict))
    return results

@router.get("/nearby", response_model=List[MandiNearby], tags=["Mandis"])
def get_nearby_mandis(
    lat: float = Query(..., description="Farmer latitude"),
    lng: float = Query(..., description="Farmer longitude"),
    radius_km: float = Query(100.0, description="Search radius in km"),
    db: Session = Depends(get_db)
):
    """Find APMC mandis within a given radius using approximate straight-line distance."""
    nearby_data = find_nearby_mandis(db, farmer_lat=lat, farmer_lng=lng, radius_km=radius_km)
    
    response = []
    for item in nearby_data:
        m = item["mandi"]
        response.append(MandiNearby(
            id=m.id,
            district_id=m.district_id,
            name=m.name,
            code=m.code,
            latitude=m.latitude,
            longitude=m.longitude,
            address=m.address,
            contact_phone=m.contact_phone,
            operating_days=m.operating_days,
            district_name=item["district_name"],
            state_name=item["state_name"],
            distance_km=item["distance_km"],
            distance_type="approximate_straight_line"
        ))
    return response
