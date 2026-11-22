import logging
import urllib.request
import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.location import State, District
from backend.app.services.distance_service import haversine_distance, is_valid_coordinate

logger = logging.getLogger("mandi_mitra.geocode")

def reverse_geocode_location(lat: float, lng: float, db: Session) -> Dict[str, Any]:
    """
    Reverse geocodes coordinates to a human-readable location name,
    and maps it to the closest supported State and District in the database.
    """
    raw_location_name = None
    raw_state_name = None
    raw_district_name = None

    # 1. Attempt reverse geocoding via OpenStreetMap Nominatim
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json&addressdetails=1"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "MandiMitra/1.0 (contact@mandimitra.in)"}
        )
        with urllib.request.urlopen(req, timeout=4.0) as response:
            data = json.loads(response.read().decode())
            addr = data.get("address", {})

            # Extract specific local city/town/village/neighbourhood name
            raw_location_name = (
                addr.get("city") or
                addr.get("town") or
                addr.get("village") or
                addr.get("suburb") or
                addr.get("neighbourhood") or
                addr.get("county") or
                data.get("name")
            )
            raw_state_name = addr.get("state")
            raw_district_name = addr.get("state_district") or addr.get("county") or addr.get("district")
    except Exception as err:
        logger.warning(f"Nominatim reverse geocode lookup failed or timed out: {err}")

    # 2. Match with State in our database
    all_states = db.query(State).all()
    matched_state: Optional[State] = None

    if raw_state_name:
        for s in all_states:
            if s.name.lower() in raw_state_name.lower() or raw_state_name.lower() in s.name.lower():
                matched_state = s
                break

    # 3. Match or find nearest District in our database
    all_districts = db.query(District).all()
    matched_district: Optional[District] = None

    # If state was found, match within that state
    if matched_state:
        state_districts = [d for d in all_districts if d.state_id == matched_state.id]
        if raw_district_name:
            clean_raw_dist = raw_district_name.lower().replace("district", "").strip()
            for d in state_districts:
                if d.name.lower() in clean_raw_dist or clean_raw_dist in d.name.lower():
                    matched_district = d
                    break

        # If no exact district match in that state, find geographically closest district in that state
        if not matched_district and state_districts:
            min_dist = float("inf")
            for d in state_districts:
                if is_valid_coordinate(d.latitude, d.longitude):
                    dist = haversine_distance(lat, lng, d.latitude, d.longitude)
                    if dist < min_dist:
                        min_dist = dist
                        matched_district = d
    else:
        # Fallback if state couldn't be resolved via Nominatim:
        # Find closest district across the entire database!
        min_dist = float("inf")
        for d in all_districts:
            if is_valid_coordinate(d.latitude, d.longitude):
                dist = haversine_distance(lat, lng, d.latitude, d.longitude)
                if dist < min_dist:
                    min_dist = dist
                    matched_district = d
        if matched_district and matched_district.state:
            matched_state = matched_district.state

    # Clean display location name
    if not raw_location_name:
        if matched_district:
            raw_location_name = matched_district.name
        elif matched_state:
            raw_location_name = matched_state.name
        else:
            raw_location_name = f"Location ({lat:.4f}, {lng:.4f})"

    return {
        "location_name": raw_location_name,
        "state_name": matched_state.name if matched_state else None,
        "state_id": matched_state.id if matched_state else None,
        "district_name": matched_district.name if matched_district else None,
        "district_id": matched_district.id if matched_district else None,
        "latitude": lat,
        "longitude": lng,
    }
