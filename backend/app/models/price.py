from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.database.base import Base

class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    mandi_id = Column(Integer, ForeignKey("mandis.id", ondelete="CASCADE"), nullable=False, index=True)
    commodity_id = Column(Integer, ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False, index=True)
    variety_id = Column(Integer, ForeignKey("varieties.id", ondelete="SET NULL"), nullable=True, index=True)
    
    price_date = Column(Date, nullable=False, index=True)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    price_unit = Column(String(30), default="Rs/Quintal")
    arrivals_in_tonnes = Column(Float, default=0.0)
    data_source = Column(String(50), default="Agmarknet")
    data_classification = Column(String(30), default="historical") # 'live', 'historical', 'sample'
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())

    mandi = relationship("Mandi", back_populates="prices")
    commodity = relationship("Commodity", back_populates="prices")
    variety = relationship("Variety", back_populates="prices")

    __table_args__ = (
        UniqueConstraint('mandi_id', 'commodity_id', 'variety_id', 'price_date', name='uq_mandi_commodity_variety_date'),
    )
