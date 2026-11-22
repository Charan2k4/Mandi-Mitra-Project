from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

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
        v_query = query.filter(MarketPrice.variety_id == variety_id)
        res = v_query.order_by(desc(MarketPrice.price_date)).first()
        if res:
            return res
    
    # Fallback to any variety at this mandi
    return query.order_by(desc(MarketPrice.price_date)).first()

def get_price_history(
    db: Session,
    commodity_id: int,
    variety_id: Optional[int] = None,
    mandi_id: Optional[int] = None,
    days: int = 45
) -> List[PriceHistoryItem]:
    """
    Retrieve daily price history records up to `days` days.
    - If variety_id has no records, gracefully falls back to available records for the commodity.
    - If mandi_id is None (Regional Average), computes daily aggregates across all mandis (1 point per day).
    - If mandi_id is specified, retrieves daily prices for that mandi (or regional aggregate if mandi has 0 records).
    """
    # 1. Determine effective variety_id
    effective_variety_id = variety_id
    if variety_id is not None:
        has_variety_records = db.query(MarketPrice.id).filter(
            MarketPrice.commodity_id == commodity_id,
            MarketPrice.variety_id == variety_id
        ).first() is not None
        if not has_variety_records:
            effective_variety_id = None

    # 2. If mandi_id is specified, query that mandi's records
    if mandi_id is not None:
        mandi_query = db.query(MarketPrice).filter(
            MarketPrice.commodity_id == commodity_id,
            MarketPrice.mandi_id == mandi_id
        )
        if effective_variety_id is not None:
            mandi_query = mandi_query.filter(MarketPrice.variety_id == effective_variety_id)

        records = mandi_query.order_by(desc(MarketPrice.price_date)).limit(days).all()
        if records:
            return [
                PriceHistoryItem(
                    price_date=r.price_date.isoformat(),
                    modal_price=float(r.modal_price),
                    min_price=float(r.min_price),
                    max_price=float(r.max_price),
                    arrivals_in_tonnes=float(r.arrivals_in_tonnes or 0.0),
                    mandi_name=r.mandi.name if r.mandi else None,
                    data_classification=r.data_classification or "benchmark"
                )
                for r in records
            ]

    # 3. Regional Daily Aggregates (group by price_date across all mandis)
    agg_query = db.query(
        MarketPrice.price_date,
        func.avg(MarketPrice.modal_price).label("modal_price"),
        func.min(MarketPrice.min_price).label("min_price"),
        func.max(MarketPrice.max_price).label("max_price"),
        func.sum(MarketPrice.arrivals_in_tonnes).label("arrivals_in_tonnes"),
        func.max(MarketPrice.data_classification).label("data_classification")
    ).filter(
        MarketPrice.commodity_id == commodity_id
    )
    if effective_variety_id is not None:
        agg_query = agg_query.filter(MarketPrice.variety_id == effective_variety_id)

    daily_rows = agg_query.group_by(
        MarketPrice.price_date
    ).order_by(
        desc(MarketPrice.price_date)
    ).limit(days).all()

    return [
        PriceHistoryItem(
            price_date=row.price_date.isoformat(),
            modal_price=round(float(row.modal_price), 2),
            min_price=round(float(row.min_price), 2),
            max_price=round(float(row.max_price), 2),
            arrivals_in_tonnes=round(float(row.arrivals_in_tonnes or 0.0), 2),
            mandi_name="Regional Average (All Mandis)",
            data_classification=row.data_classification or "benchmark"
        )
        for row in daily_rows
    ]
