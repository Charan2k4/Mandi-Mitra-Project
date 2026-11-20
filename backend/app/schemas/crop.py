from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class VarietyBase(BaseModel):
    id: int
    commodity_id: int
    name: str
    grade: Optional[str] = "Standard"

    model_config = ConfigDict(from_attributes=True)

class CommodityBase(BaseModel):
    id: int
    name: str
    category: str
    unit: str = "Quintal"
    shelf_life_days: int = 60

    model_config = ConfigDict(from_attributes=True)

class CommodityWithVarieties(CommodityBase):
    varieties: List[VarietyBase] = []
