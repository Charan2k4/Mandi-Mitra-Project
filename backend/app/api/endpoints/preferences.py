from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.user_preference import FarmerPreference

router = APIRouter()

class PreferenceSchema(BaseModel):
    session_id: Optional[str] = "default_farmer"
    default_radius_km: int = Field(100, ge=10, le=500)
    price_preference: str = Field("modal", pattern="^(modal|min|max)$")
    language: str = Field("en", pattern="^(en|te|hi)$")
    holding_period_days: int = Field(3, ge=1, le=14)
    min_profit_threshold_pct: float = Field(3.0, ge=0.0)
    max_acceptable_price_age_days: int = Field(7, ge=1)
    holding_cost_per_quintal_day: float = Field(5.0, ge=0.0)

@router.get("", response_model=PreferenceSchema, tags=["Preferences"])
def get_preferences(
    session_id: str = Query("default_farmer"),
    db: Session = Depends(get_db)
):
    """Retrieve saved farmer preferences or sensible defaults."""
    pref = db.query(FarmerPreference).filter(FarmerPreference.session_id == session_id).first()
    if not pref:
        return PreferenceSchema(session_id=session_id)
    return PreferenceSchema(
        session_id=pref.session_id,
        default_radius_km=pref.default_radius_km or 100,
        price_preference=pref.price_preference or "modal",
        language=pref.language or "en",
        holding_period_days=pref.holding_period_days or 3,
        min_profit_threshold_pct=float(pref.min_profit_threshold_pct or 3.0),
        max_acceptable_price_age_days=pref.max_acceptable_price_age_days or 7,
        holding_cost_per_quintal_day=float(pref.holding_cost_per_quintal_day or 5.0)
    )

@router.post("", response_model=PreferenceSchema, tags=["Preferences"])
def save_preferences(
    payload: PreferenceSchema,
    db: Session = Depends(get_db)
):
    """Save or update farmer preferences in the database."""
    pref = db.query(FarmerPreference).filter(FarmerPreference.session_id == payload.session_id).first()
    if not pref:
        pref = FarmerPreference(session_id=payload.session_id)
        db.add(pref)

    pref.default_radius_km = payload.default_radius_km
    pref.price_preference = payload.price_preference
    pref.language = payload.language
    pref.holding_period_days = payload.holding_period_days
    pref.min_profit_threshold_pct = payload.min_profit_threshold_pct
    pref.max_acceptable_price_age_days = payload.max_acceptable_price_age_days
    pref.holding_cost_per_quintal_day = payload.holding_cost_per_quintal_day

    db.commit()
    db.refresh(pref)
    return payload
