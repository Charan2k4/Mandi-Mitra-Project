from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.crop import Commodity, Variety
from backend.app.schemas.crop import CommodityBase, VarietyBase, CommodityWithVarieties

router = APIRouter()

@router.get("", response_model=List[CommodityBase], tags=["Crops"])
def get_crops(db: Session = Depends(get_db)):
    """Retrieve all supported crops / agricultural commodities."""
    return db.query(Commodity).order_by(Commodity.name).all()

@router.get("/{crop_id}/varieties", response_model=List[VarietyBase], tags=["Crops"])
def get_crop_varieties(crop_id: int, db: Session = Depends(get_db)):
    """Retrieve all varieties for a specific crop."""
    crop = db.query(Commodity).filter(Commodity.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return db.query(Variety).filter(Variety.commodity_id == crop_id).order_by(Variety.name).all()
