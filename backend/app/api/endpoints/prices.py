from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.price import MarketPrice
from backend.app.models.crop import Commodity, Variety
from backend.app.models.mandi import Mandi
from backend.app.schemas.price import MarketPriceBase, PriceHistoryResponse, PriceHistoryItem
from backend.app.services.price_service import get_latest_price_for_mandi, get_price_history
from backend.app.services.agmarknet_service import agmarknet_service

router = APIRouter()

@router.get("/status", tags=["Prices"])
def get_prices_status(db: Session = Depends(get_db)):
    """Return live vs benchmark price data coverage statistics."""
    return agmarknet_service.get_data_coverage_stats(db)

@router.post("/sync", tags=["Prices"])
async def trigger_price_sync(
    state: Optional[str] = Query(None),
    commodity: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Trigger manual on-demand sync from official Agmarknet API into database."""
    return await agmarknet_service.sync_live_prices_to_db(db, state=state, commodity=commodity, limit=limit)

@router.get("", response_model=Optional[MarketPriceBase], tags=["Prices"])
def get_current_price(
    commodity_id: int = Query(...),
    variety_id: Optional[int] = Query(None),
    mandi_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Retrieve the latest price record for a given commodity and mandi."""
    price = get_latest_price_for_mandi(db, mandi_id=mandi_id, commodity_id=commodity_id, variety_id=variety_id)
    if not price:
        # Fallback to any variety if specific variety is not quoted
        price = get_latest_price_for_mandi(db, mandi_id=mandi_id, commodity_id=commodity_id, variety_id=None)
        
    if not price:
        return None

    return MarketPriceBase(
        id=price.id,
        mandi_id=price.mandi_id,
        commodity_id=price.commodity_id,
        variety_id=price.variety_id,
        price_date=price.price_date,
        min_price=price.min_price,
        max_price=price.max_price,
        modal_price=price.modal_price,
        price_unit=price.price_unit,
        arrivals_in_tonnes=price.arrivals_in_tonnes,
        data_source=price.data_source,
        data_classification=price.data_classification,
        mandi_name=price.mandi.name if price.mandi else None,
        commodity_name=price.commodity.name if price.commodity else None,
        variety_name=price.variety.name if price.variety else None
    )

@router.get("/history", response_model=PriceHistoryResponse, tags=["Prices"])
def get_prices_history(
    commodity_id: int = Query(...),
    variety_id: Optional[int] = Query(None),
    mandi_id: Optional[int] = Query(None),
    days: int = Query(35, ge=7, le=180),
    db: Session = Depends(get_db)
):
    """Retrieve price history records for trend charts."""
    commodity = db.query(Commodity).filter(Commodity.id == commodity_id).first()
    if not commodity:
        raise HTTPException(status_code=404, detail="Commodity not found")

    variety = db.query(Variety).filter(Variety.id == variety_id).first() if variety_id else None
    mandi = db.query(Mandi).filter(Mandi.id == mandi_id).first() if mandi_id else None

    items = get_price_history(db, commodity_id=commodity_id, variety_id=variety_id, mandi_id=mandi_id, days=days)
    
    # Sort chronological for charts (oldest to newest)
    sorted_items = sorted(items, key=lambda x: x.price_date)

    latest_date_str = sorted_items[-1].price_date if sorted_items else None
    latest_classification = sorted_items[-1].data_classification if sorted_items else "benchmark"
    data_source_label = "Agmarknet Official Live API" if latest_classification == "live" else "Agmarknet Benchmark Data"

    return PriceHistoryResponse(
        commodity_id=commodity.id,
        commodity_name=commodity.name,
        variety_id=variety.id if variety else None,
        variety_name=variety.name if variety else None,
        mandi_id=mandi.id if mandi else None,
        mandi_name=mandi.name if mandi else "Regional Average (All Mandis)",
        history=sorted_items,
        latest_date=latest_date_str,
        data_source=data_source_label
    )
