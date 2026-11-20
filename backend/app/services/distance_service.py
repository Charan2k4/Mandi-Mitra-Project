import math
from typing import Optional, Tuple

EARTH_RADIUS_KM = 6371.0088

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the approximate straight-line distance in kilometres between two points
    on the Earth using the Haversine formula.
    
    Returns approximate straight-line distance rounded to 2 decimal places.
    NOTE: This is NOT road distance. Road distance is typically 15-30% longer depending on terrain.
    """
    if not is_valid_coordinate(lat1, lon1) or not is_valid_coordinate(lat2, lon2):
        raise ValueError("Invalid geographic coordinates provided.")

    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    
    # Avoid domain errors due to floating point inaccuracies
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    distance = EARTH_RADIUS_KM * c
    return round(distance, 2)

def is_valid_coordinate(lat: Optional[float], lon: Optional[float]) -> bool:
    """Validate latitude (-90 to 90) and longitude (-180 to 180)."""
    if lat is None or lon is None:
        return False
    return -90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0
