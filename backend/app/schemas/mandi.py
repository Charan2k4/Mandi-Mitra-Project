from typing import Optional
from pydantic import BaseModel, ConfigDict

class MandiBase(BaseModel):
    id: int
    district_id: int
    name: str
    code: Optional[str] = None
    latitude: float
    longitude: float
    address: Optional[str] = None
    contact_phone: Optional[str] = None
    operating_days: Optional[str] = "Mon-Sat"
    district_name: Optional[str] = None
    state_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class MandiNearby(MandiBase):
    distance_km: float
    distance_type: str = "approximate_straight_line"
