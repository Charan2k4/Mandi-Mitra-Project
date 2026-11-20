from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.models.price import MarketPrice
from backend.app.schemas.price import MarketPriceBase, PriceHistoryItem, PriceHistoryResponse

def get_latest_price_for_mandi(
    db: Session,
    mandi_id: int,
    commodity_id: int,
    variety_id: Optional[int] = None
) -> Optional[MarketPrice]:
    """Retrieve the most recent price record for a given mandi, commodity, and optional variety."""
    query = db.query(MarketPrice).filter(
        MarketPrice.mandi_id == mandi_id,
        MarketPrice.commodity_id == commodity_id
    )
    if variety_id is not None:
        query = query.filter(MarketPrice.variety_id == variety_id)
    
    return query.order_by(desc(MarketPrice.price_date)).first()

def get_price_history(
    db: Session,
    commodity_id: int,
    variety_id: Optional[int] = None,
    mandi_id: Optional[int] = None,
    days: int = 45
) -> List[MarketPrice]:
    """Retrieve price history records up to `days` days."""
    query = db.query(MarketPrice).filter(
        MarketPrice.commodity_id == commodity_id
    )
    if variety_id is not None:
        query = query.filter(MarketPrice.variety_id == variety_id)
    if mandi_id is not None:
        query = query.filter(MarketPrice.mandi_id == mandi_id)
        
    return query.order_by(desc(MarketPrice.price_date)).limit(days).all()
