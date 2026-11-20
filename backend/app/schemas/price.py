from typing import Optional
from datetime import date
from pydantic import BaseModel, ConfigDict

class MarketPriceBase(BaseModel):
    id: int
    mandi_id: int
    commodity_id: int
    variety_id: Optional[int] = None
    price_date: date
    min_price: float
    max_price: float
    modal_price: float
    price_unit: str = "Rs/Quintal"
    arrivals_in_tonnes: Optional[float] = 0.0
    data_source: str = "Agmarknet"
    data_classification: str = "historical"
    mandi_name: Optional[str] = None
    commodity_name: Optional[str] = None
    variety_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PriceHistoryItem(BaseModel):
    price_date: str
    modal_price: float
    min_price: float
    max_price: float
    arrivals_in_tonnes: float = 0.0
    mandi_name: Optional[str] = None
    data_classification: str = "historical"

class PriceHistoryResponse(BaseModel):
    commodity_id: int
    commodity_name: str
    variety_id: Optional[int] = None
    variety_name: Optional[str] = None
    mandi_id: Optional[int] = None
    mandi_name: Optional[str] = None
    history: list[PriceHistoryItem] = []
    latest_date: Optional[str] = None
    data_source: str = "Agmarknet Official / Benchmark"
