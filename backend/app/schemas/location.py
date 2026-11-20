from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class DistrictBase(BaseModel):
    id: int
    name: str
    state_id: int
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)

class StateBase(BaseModel):
    id: int
    name: str
    code: str

    model_config = ConfigDict(from_attributes=True)

class StateWithDistricts(StateBase):
    districts: List[DistrictBase] = []
