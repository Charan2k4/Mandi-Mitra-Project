from sqlalchemy import Column, Integer, String, Float, DateTime, func
from backend.app.database.base import Base

class FarmerPreference(Base):
    __tablename__ = "farmer_preferences"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=True)
    default_radius_km = Column(Integer, default=100)
    price_preference = Column(String(20), default="modal") # 'modal', 'min', 'max'
    language = Column(String(10), default="en") # 'en', 'te'
    holding_period_days = Column(Integer, default=3)
    min_profit_threshold_pct = Column(Float, default=3.0)
    max_acceptable_price_age_days = Column(Integer, default=7)
    holding_cost_per_quintal_day = Column(Float, default=5.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ComparisonLog(Base):
    __tablename__ = "comparison_logs"

    id = Column(Integer, primary_key=True, index=True)
    farmer_state = Column(String(100), nullable=True)
    farmer_district = Column(String(100), nullable=True)
    farmer_lat = Column(Float, nullable=True)
    farmer_lng = Column(Float, nullable=True)
    commodity_name = Column(String(100), nullable=True)
    variety_name = Column(String(100), nullable=True)
    quantity_quintals = Column(Float, nullable=True)
    transport_rate_per_km = Column(Float, nullable=True)
    other_expenses = Column(Float, nullable=True)
    recommended_mandi_id = Column(Integer, nullable=True)
    estimated_best_net_revenue = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
