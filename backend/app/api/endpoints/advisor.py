from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from backend.app.database.session import get_db
from backend.app.models.location import District, State
from backend.app.models.mandi import Mandi
from backend.app.models.crop import Commodity, Variety
from backend.app.models.price import MarketPrice
from backend.app.models.user_preference import ComparisonLog
from backend.app.schemas.advisor import (
    ComparisonRequest,
    MandiComparisonResult,
    ComparisonResponse,
    SellOrHoldRequest,
    SellOrHoldResponse
)
from backend.app.services.distance_service import haversine_distance, is_valid_coordinate
from backend.app.utils.geo_coordinates import get_coordinates_for
from backend.app.services.profit_calculator import (
    calculate_gross_revenue,
    calculate_transportation_cost,
    calculate_total_expenses,
    calculate_net_revenue,
    rank_mandi_results
)
from backend.app.services.advisor_service import evaluate_sell_or_hold

router = APIRouter()

DISCLAIMER_TEXT = (
    "Distances shown are approximate straight-line Euclidean/geodesic estimates and not actual road distances. "
    "Net revenues are informational estimates based on reported mandi rates and user-entered transport costs. "
    "Verify market gate rates and operating schedules before dispatching produce."
)

@router.post("/compare", response_model=ComparisonResponse, tags=["Advisor"])
def compare_mandis(
    request: ComparisonRequest,
    db: Session = Depends(get_db)
):
    """
    Main farmer mandi comparison engine.
    Finds available mandis within search radius, retrieves active prices for the crop,
    computes transportation costs and net revenues, and ranks mandis.
    """
    # 1. Validate commodity
    commodity = db.query(Commodity).filter(Commodity.id == request.commodity_id).first()
    if not commodity:
        raise HTTPException(status_code=404, detail="Selected crop not found.")

    # 2. Resolve farmer coordinates safely
    dist_record = db.query(District).join(State).filter(
        District.name.ilike(request.district.strip())
    ).first()

    # Authentic district coordinates from database or fallback dictionary
    d_lat = dist_record.latitude if dist_record else None
    d_lng = dist_record.longitude if dist_record else None

    if not is_valid_coordinate(d_lat, d_lng):
        fallback_coords = get_coordinates_for(request.state, request.district)
        d_lat, d_lng = fallback_coords

    f_lat = request.farmer_lat
    f_lng = request.farmer_lng

    # Fallback to authentic district coordinates if coordinates were not supplied
    if not is_valid_coordinate(f_lat, f_lng):
        f_lat = d_lat
        f_lng = d_lng
    elif is_valid_coordinate(d_lat, d_lng):
        # Guard against stale coordinate retention across state lines in client browser sessions:
        # If coordinates are within India but >350km away from the user's selected district,
        # prioritize the authentic district centroid so a farmer in HP is never placed in Telangana.
        is_in_india = (6.0 <= f_lat <= 38.0) and (68.0 <= f_lng <= 98.0)
        if is_in_india:
            dist_to_district = haversine_distance(f_lat, f_lng, d_lat, d_lng)
            if dist_to_district > 350.0:
                f_lat = d_lat
                f_lng = d_lng

    # 3. Retrieve eligible mandis (using joinedload to eliminate N+1 queries)
    all_mandis = db.query(Mandi).options(
        joinedload(Mandi.district).joinedload(District.state)
    ).all()
    eligible_mandis = []

    for mandi in all_mandis:
        dist_km = None
        if is_valid_coordinate(f_lat, f_lng) and is_valid_coordinate(mandi.latitude, mandi.longitude):
            dist_km = haversine_distance(f_lat, f_lng, mandi.latitude, mandi.longitude)
            # Filter by search radius
            if dist_km > request.search_radius_km:
                continue
        elif mandi.district.name.lower() != request.district.strip().lower():
            # If coordinates are completely unavailable, fallback to district match
            continue

        eligible_mandis.append((mandi, dist_km))

    # 4. For each eligible mandi, fetch the latest price
    comparison_items: List[MandiComparisonResult] = []
    today = date.today()

    for mandi, dist_km in eligible_mandis:
        # Search for exact variety match first
        price_q = db.query(MarketPrice).filter(
            MarketPrice.mandi_id == mandi.id,
            MarketPrice.commodity_id == commodity.id
        )
        if request.variety_id is not None:
            price_q = price_q.filter(MarketPrice.variety_id == request.variety_id)

        latest_price_rec = price_q.order_by(desc(MarketPrice.price_date)).first()

        # Fallback to general commodity price at this mandi if specific variety not quoted
        if not latest_price_rec:
            latest_price_rec = db.query(MarketPrice).filter(
                MarketPrice.mandi_id == mandi.id,
                MarketPrice.commodity_id == commodity.id
            ).order_by(desc(MarketPrice.price_date)).first()

        # If still no price at this mandi, skip it (do not compare mandis with missing price)
        if not latest_price_rec:
            continue

        # Extract price based on preference
        if request.price_preference == "min":
            effective_price = float(latest_price_rec.min_price)
        elif request.price_preference == "max":
            effective_price = float(latest_price_rec.max_price)
        else:
            effective_price = float(latest_price_rec.modal_price)

        # Revenue and expense calculations
        gross_rev = calculate_gross_revenue(request.quantity_quintals, effective_price)
        trans_cost = calculate_transportation_cost(dist_km, request.transport_rate_per_km)
        total_exp = calculate_total_expenses(trans_cost, request.other_expenses)
        net_rev = calculate_net_revenue(gross_rev, total_exp)
        net_rate = round(net_rev / request.quantity_quintals, 2) if request.quantity_quintals > 0 else 0.0

        price_age = (today - latest_price_rec.price_date).days
        is_stale = price_age > 7

        comparison_items.append(MandiComparisonResult(
            mandi_id=mandi.id,
            mandi_name=mandi.name,
            district=mandi.district.name if mandi.district else "",
            state=mandi.district.state.name if (mandi.district and mandi.district.state) else "",
            latitude=mandi.latitude,
            longitude=mandi.longitude,
            distance_km=dist_km,
            distance_type="approximate_straight_line",
            price_per_quintal=effective_price,
            price_date=latest_price_rec.price_date.isoformat(),
            price_age_days=max(0, price_age),
            is_stale=is_stale,
            gross_revenue=gross_rev,
            transportation_cost=trans_cost,
            other_expenses=round(request.other_expenses, 2),
            total_selling_expenses=total_exp,
            net_revenue=net_rev,
            net_rate_per_quintal=net_rate,
            rank=0, # will be populated by rank_mandi_results
            is_recommended=False,
            data_source=latest_price_rec.data_source or "Agmarknet",
            data_classification=latest_price_rec.data_classification or "historical"
        ))

    # 5. Rank by Net Revenue descending
    ranked_results = rank_mandi_results(comparison_items)
    best_mandi = ranked_results[0] if ranked_results else None

    # 6. Log comparison request for analytics
    try:
        log_entry = ComparisonLog(
            farmer_state=request.state,
            farmer_district=request.district,
            farmer_lat=f_lat,
            farmer_lng=f_lng,
            commodity_name=commodity.name,
            quantity_quintals=request.quantity_quintals,
            transport_rate_per_km=request.transport_rate_per_km,
            other_expenses=request.other_expenses,
            recommended_mandi_id=best_mandi.mandi_id if best_mandi else None,
            estimated_best_net_revenue=best_mandi.net_revenue if best_mandi else None
        )
        db.add(log_entry)
        db.commit()
    except Exception:
        db.rollback()

    return ComparisonResponse(
        query=request,
        results=ranked_results,
        best_mandi=best_mandi,
        total_mandis_found=len(ranked_results),
        disclaimer=DISCLAIMER_TEXT
    )


@router.post("/sell-or-hold", response_model=SellOrHoldResponse, tags=["Advisor"])
def get_sell_or_hold_advice(
    request: SellOrHoldRequest,
    db: Session = Depends(get_db)
):
    """
    Transparent rule-based Sell-or-Hold advisory engine.
    Evaluates price trends, momentum, historical volatility, and holding costs.
    """
    commodity = db.query(Commodity).filter(Commodity.id == request.commodity_id).first()
    if not commodity:
        raise HTTPException(status_code=404, detail="Commodity not found.")

    variety = db.query(Variety).filter(Variety.id == request.variety_id).first() if request.variety_id else None
    mandi = db.query(Mandi).filter(Mandi.id == request.mandi_id).first() if request.mandi_id else None

    # Query historical prices (up to 45 records) with hierarchical fallback
    # Level 1: Exact Mandi + Exact Variety
    price_q = db.query(MarketPrice).filter(MarketPrice.commodity_id == commodity.id)
    if request.variety_id is not None:
        price_q = price_q.filter(MarketPrice.variety_id == request.variety_id)
    if request.mandi_id is not None:
        price_q = price_q.filter(MarketPrice.mandi_id == request.mandi_id)

    prices = price_q.order_by(desc(MarketPrice.price_date)).limit(45).all()

    # Level 2: Fallback to all varieties of this crop at the selected mandi if specific variety not quoted
    if len(prices) < 5 and request.variety_id is not None and request.mandi_id is not None:
        prices = db.query(MarketPrice).filter(
            MarketPrice.commodity_id == commodity.id,
            MarketPrice.mandi_id == request.mandi_id
        ).order_by(desc(MarketPrice.price_date)).limit(45).all()

    # Level 3: Fallback to regional market prices for this crop if specific mandi has no quotes
    effective_mandi_name = mandi.name if mandi else "Regional APMC Benchmark"
    if len(prices) < 5:
        prices = db.query(MarketPrice).filter(
            MarketPrice.commodity_id == commodity.id
        ).order_by(desc(MarketPrice.price_date)).limit(45).all()
        if mandi:
            effective_mandi_name = f"{mandi.name} (Regional Benchmark)"

    return evaluate_sell_or_hold(
        request=request,
        commodity_name=commodity.name,
        variety_name=variety.name if variety else None,
        mandi_name=effective_mandi_name,
        prices=prices,
        reference_date=date.today()
    )
