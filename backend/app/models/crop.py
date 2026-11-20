from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from backend.app.database.base import Base

class Commodity(Base):
    __tablename__ = "commodities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False) # Cereals, Pulses, Oilseeds, Spices, Vegetables, Fibres
    unit = Column(String(20), default="Quintal")
    shelf_life_days = Column(Integer, default=60)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    varieties = relationship("Variety", back_populates="commodity", cascade="all, delete-orphan")
    prices = relationship("MarketPrice", back_populates="commodity")


class Variety(Base):
    __tablename__ = "varieties"

    id = Column(Integer, primary_key=True, index=True)
    commodity_id = Column(Integer, ForeignKey("commodities.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)
    grade = Column(String(50), default="Standard")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    commodity = relationship("Commodity", back_populates="varieties")
    prices = relationship("MarketPrice", back_populates="variety")
