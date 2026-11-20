from typing import Optional, List
from pydantic import BaseModel, Field

class ComparisonRequest(BaseModel):
    state: str = Field(..., description="Selected state name")
    district: str = Field(..., description="Selected district name")
    farmer_lat: Optional[float] = Field(None, description="Farmer latitude coordinate")
    farmer_lng: Optional[float] = Field(None, description="Farmer longitude coordinate")
    farmer_location: Optional[str] = Field(None, description="Village or landmark")
    commodity_id: int = Field(..., description="ID of crop to sell")
    variety_id: Optional[int] = Field(None, description="Specific variety ID if known")
    quantity_quintals: float = Field(..., gt=0, description="Crop quantity in quintals")
    transport_rate_per_km: float = Field(..., ge=0, description="Cost per km in Rs")
    other_expenses: float = Field(0.0, ge=0, description="Other expenses (loading/unloading/cess) in Rs")
    search_radius_km: int = Field(100, ge=25, le=500, description="Search radius in km")
    price_preference: str = Field("modal", pattern="^(modal|min|max)$", description="modal, min or max")

class MandiComparisonResult(BaseModel):
    mandi_id: int
    mandi_name: str
    district: str
    state: str
    latitude: float
    longitude: float
    distance_km: Optional[float] = None
    distance_type: str = "approximate_straight_line"
    price_per_quintal: float
    price_date: str
    price_age_days: int
    is_stale: bool
    gross_revenue: float
    transportation_cost: float
    other_expenses: float
    total_selling_expenses: float
    net_revenue: float
    net_rate_per_quintal: float
    rank: int
    is_recommended: bool
    data_source: str = "Agmarknet"
    data_classification: str = "historical" # 'live', 'historical', 'sample'

class ComparisonResponse(BaseModel):
    query: ComparisonRequest
    results: List[MandiComparisonResult]
    best_mandi: Optional[MandiComparisonResult] = None
    total_mandis_found: int
    disclaimer: str

class SellOrHoldRequest(BaseModel):
    commodity_id: int = Field(..., description="Crop ID")
    variety_id: Optional[int] = Field(None, description="Variety ID")
    mandi_id: Optional[int] = Field(None, description="Specific mandi ID or average")
    quantity_quintals: float = Field(10.0, gt=0, description="Volume for holding cost estimation")
    holding_period_days: int = Field(3, ge=1, le=14, description="Days to hold (1, 3, 7)")
    storage_cost_per_quintal_day: float = Field(5.0, ge=0, description="Rs per quintal per day")
    min_profit_threshold_pct: float = Field(3.0, ge=0, description="Minimum expected profit improvement %")
    max_acceptable_price_age_days: int = Field(7, ge=1, description="Staleness threshold")
    price_preference: str = Field("modal", pattern="^(modal|min|max)$")

class SellOrHoldResponse(BaseModel):
    commodity_name: str
    variety_name: Optional[str] = None
    mandi_name: Optional[str] = None
    recommendation: str # 'SELL NOW', 'CONSIDER HOLDING', 'CAUTION', 'INSUFFICIENT DATA'
    confidence_score: float # 0 - 100%
    summary: str
    reasons: List[str]
    risks_and_uncertainties: List[str]
    current_price: Optional[float] = None
    current_price_date: Optional[str] = None
    price_age_days: Optional[int] = None
    avg_price_7d: Optional[float] = None
    avg_price_30d: Optional[float] = None
    price_change_7d_pct: Optional[float] = None
    price_volatility_pct: Optional[float] = None
    estimated_holding_cost: float
    historical_data_points: int
    disclaimer: str
