from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from backend.app.database.base import Base

class Mandi(Base):
    __tablename__ = "mandis"

    id = Column(Integer, primary_key=True, index=True)
    district_id = Column(Integer, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    code = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(Text, nullable=True)
    contact_phone = Column(String(50), nullable=True)
    operating_days = Column(String(100), default="Mon-Sat")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    district = relationship("District", back_populates="mandis")
    prices = relationship("MarketPrice", back_populates="mandi", cascade="all, delete-orphan")
