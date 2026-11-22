from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from backend.app.models.mandi import Mandi
from backend.app.models.location import District, State
from backend.app.services.distance_service import haversine_distance, is_valid_coordinate

def get_all_mandis(db: Session, district_id: Optional[int] = None) -> List[Mandi]:
    query = db.query(Mandi).options(joinedload(Mandi.district).joinedload(District.state))
    if district_id:
        query = query.filter(Mandi.district_id == district_id)
    return query.all()

def find_nearby_mandis(
    db: Session,
    farmer_lat: float,
    farmer_lng: float,
    radius_km: float = 100.0
) -> List[dict]:
    """
    Find all mandis within radius_km of the farmer coordinates.
    Returns list of dicts with mandi model and distance_km.
    """
    if not is_valid_coordinate(farmer_lat, farmer_lng):
        return []
        
    mandis = db.query(Mandi).options(joinedload(Mandi.district).joinedload(District.state)).all()
    results = []
    
    for m in mandis:
        if is_valid_coordinate(m.latitude, m.longitude):
            dist = haversine_distance(farmer_lat, farmer_lng, m.latitude, m.longitude)
            if dist <= radius_km:
                results.append({
                    "mandi": m,
                    "distance_km": dist,
                    "district_name": m.district.name if m.district else "Unknown",
                    "state_name": m.district.state.name if (m.district and m.district.state) else "Unknown"
                })
                
    # Sort by nearest distance first
    results.sort(key=lambda x: x["distance_km"])
    return results
