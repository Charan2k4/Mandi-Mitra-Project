from datetime import date, datetime
from typing import List, Optional
import numpy as np

from backend.app.schemas.advisor import SellOrHoldRequest, SellOrHoldResponse
from backend.app.models.price import MarketPrice

DISCLAIMER_TEXT = (
    "DISCLAIMER: This advice is an informational rule-based decision support tool based on historical "
    "modal price trends and holding costs. It DOES NOT constitute financial advice or guarantee future market prices. "
    "Agricultural market prices are subject to seasonal arrivals, weather events, export policies, and perishable crop conditions."
)

def evaluate_sell_or_hold(
    request: SellOrHoldRequest,
    commodity_name: str,
    variety_name: Optional[str],
    mandi_name: Optional[str],
    prices: List[MarketPrice],
    reference_date: Optional[date] = None
) -> SellOrHoldResponse:
    """
    Rule-based, explainable sell-or-hold advisory engine.
    Analyzes:
    - Current modal price and freshness
    - 7-day and 30-day moving averages
    - Price momentum and historical volatility
    - Farmer holding cost & selected holding period
    - Safeguards against insufficient or stale data
    """
    if reference_date is None:
        reference_date = date.today()

    total_holding_cost = round(
        request.quantity_quintals * request.storage_cost_per_quintal_day * request.holding_period_days,
        2
    )

    # 1. Check for missing or zero historical records
    if not prices or len(prices) == 0:
        return SellOrHoldResponse(
            commodity_name=commodity_name,
            variety_name=variety_name,
            mandi_name=mandi_name,
            recommendation="INSUFFICIENT DATA",
            confidence_score=20.0,
            summary="No historical price records found for this crop and market combination.",
            reasons=[
                "Zero historical price observations are available in the database for this crop.",
                "Cannot evaluate trend direction, momentum, or price stability without baseline data."
            ],
            risks_and_uncertainties=[
                "Extreme price unpredictability without market arrival trends.",
                "Local private traders may offer rates deviating significantly from MSP or regional benchmarks."
            ],
            current_price=None,
            current_price_date=None,
            price_age_days=None,
            avg_price_7d=None,
            avg_price_30d=None,
            price_change_7d_pct=None,
            price_volatility_pct=None,
            estimated_holding_cost=total_holding_cost,
            historical_data_points=0,
            disclaimer=DISCLAIMER_TEXT
        )

    # Sort prices descending by date (most recent first)
    sorted_prices = sorted(prices, key=lambda p: p.price_date, reverse=True)
    latest_record = sorted_prices[0]
    
    # Extract chosen price metric (modal, min, max)
    def get_price_val(p: MarketPrice) -> float:
        if request.price_preference == "min":
            return float(p.min_price)
        elif request.price_preference == "max":
            return float(p.max_price)
        return float(p.modal_price)

    current_price = get_price_val(latest_record)
    price_date_obj = latest_record.price_date
    if isinstance(price_date_obj, str):
        price_date_obj = datetime.strptime(price_date_obj, "%Y-%m-%d").date()
    
    price_age_days = (reference_date - price_date_obj).days
    if price_age_days < 0:
        price_age_days = 0

    price_values = [get_price_val(p) for p in sorted_prices]
    data_count = len(price_values)

    # 2. Check for stale data (price older than acceptable threshold)
    if price_age_days > request.max_acceptable_price_age_days:
        return SellOrHoldResponse(
            commodity_name=commodity_name,
            variety_name=variety_name,
            mandi_name=mandi_name,
            recommendation="INSUFFICIENT DATA",
            confidence_score=35.0,
            summary=f"Latest recorded price is {price_age_days} days old, exceeding your freshness limit ({request.max_acceptable_price_age_days} days).",
            reasons=[
                f"Most recent price is dated {price_date_obj.isoformat()} ({price_age_days} days ago).",
                "Agricultural spot market prices change daily based on arrivals and fresh harvests.",
                "Making a holding decision on outdated quotes risks severe unexpected market losses."
            ],
            risks_and_uncertainties=[
                "Recent market arrivals or government procurement announcements may have shifted spot rates.",
                "Storage expenses continue to accrue regardless of market delays."
            ],
            current_price=current_price,
            current_price_date=price_date_obj.isoformat(),
            price_age_days=price_age_days,
            avg_price_7d=None,
            avg_price_30d=None,
            price_change_7d_pct=None,
            price_volatility_pct=None,
            estimated_holding_cost=total_holding_cost,
            historical_data_points=data_count,
            disclaimer=DISCLAIMER_TEXT
        )

    # 3. Check for insufficient observations count (need at least 3 points for moving averages)
    if data_count < 3:
        return SellOrHoldResponse(
            commodity_name=commodity_name,
            variety_name=variety_name,
            mandi_name=mandi_name,
            recommendation="INSUFFICIENT DATA",
            confidence_score=40.0,
            summary=f"Only {data_count} price record(s) available. At least 3 records are required to identify price trends.",
            reasons=[
                f"Historical series has only {data_count} data point(s).",
                "A moving average or volatility metric requires consecutive historical observations."
            ],
            risks_and_uncertainties=[
                "Holding crops without verified historical support exposes farmers to unquantified downside risk."
            ],
            current_price=current_price,
            current_price_date=price_date_obj.isoformat(),
            price_age_days=price_age_days,
            avg_price_7d=None,
            avg_price_30d=None,
            price_change_7d_pct=None,
            price_volatility_pct=None,
            estimated_holding_cost=total_holding_cost,
            historical_data_points=data_count,
            disclaimer=DISCLAIMER_TEXT
        )

    # Compute Moving Averages & Volatility
    recent_7 = price_values[:min(7, data_count)]
    recent_30 = price_values[:min(30, data_count)]

    avg_7d = round(float(np.mean(recent_7)), 2)
    avg_30d = round(float(np.mean(recent_30)), 2)

    # 7-day momentum
    pct_change_7d = round(((current_price - avg_7d) / avg_7d) * 100.0, 2) if avg_7d > 0 else 0.0

    # Historical Volatility (standard deviation / mean)
    std_dev = float(np.std(recent_30))
    volatility_pct = round((std_dev / avg_30d) * 100.0, 2) if avg_30d > 0 else 0.0

    max_30d = max(recent_30)
    min_30d = min(recent_30)

    # Holding cost per quintal over the user's holding period
    holding_cost_per_qtl = request.storage_cost_per_quintal_day * request.holding_period_days
    holding_cost_impact_pct = (holding_cost_per_qtl / current_price) * 100.0 if current_price > 0 else 0.0

    reasons: List[str] = []
    risks: List[str] = []
    recommendation: str
    confidence: float

    # Core Rule-Based Decision Logic
    # Case A: Very High Volatility (> 15%) -> CAUTION
    if volatility_pct > 15.0:
        recommendation = "CAUTION"
        confidence = 65.0
        summary = "High market volatility detected. Price swings are unpredictable."
        reasons.append(f"Price volatility over recent records is high at {volatility_pct}% (threshold: 15%).")
        reasons.append(f"Prices swung between Rs {min_30d:.0f} and Rs {max_30d:.0f} per quintal in recent weeks.")
        reasons.append("Holding introduces high speculation risk unless you have access to moisture-controlled warehousing.")
        risks.append("Erratic arrival surges at mandis could trigger sharp intraday price corrections.")
        risks.append("Perishable produce may suffer weight loss or quality deterioration while waiting.")

    # Case B: Current price is near the 30-day top (> 94% of max or > 6% above 30d avg) -> SELL NOW
    elif current_price >= 0.94 * max_30d or pct_change_7d >= 6.0:
        recommendation = "SELL NOW"
        confidence = 85.0
        summary = "Current price is near recent peak levels. Favorable condition to lock in gains."
        reasons.append(f"Current price of Rs {current_price:.0f}/qtl is within {((1 - current_price/max_30d)*100):.1f}% of the 30-day peak (Rs {max_30d:.0f}).")
        reasons.append(f"Current price is {pct_change_7d}% higher than the 7-day average of Rs {avg_7d:.0f}/qtl.")
        reasons.append(f"Holding for {request.holding_period_days} day(s) adds Rs {total_holding_cost:.0f} in storage costs without clear upward room.")
        risks.append("Delaying sale may expose produce to post-peak downward mean reversion.")
        risks.append("Sudden increase in mandi arrivals could depress prices over the next 48-72 hours.")

    # Case C: Holding cost exceeds minimum expected profit improvement -> SELL NOW
    elif holding_cost_impact_pct > request.min_profit_threshold_pct:
        recommendation = "SELL NOW"
        confidence = 80.0
        summary = "Storage & holding costs erode potential gains over the selected holding timeframe."
        reasons.append(f"Holding cost of Rs {holding_cost_per_qtl:.1f}/qtl represents {holding_cost_impact_pct:.2f}% of current crop value.")
        reasons.append(f"This exceeds your minimum required profit improvement threshold of {request.min_profit_threshold_pct}%.")
        reasons.append("Net profitability will decline each day the crop remains in storage.")
        risks.append("Storage pests, moisture loss, and transit re-handling charges increase holding losses.")

    # Case D: Current price is in a temporary dip, momentum is recovering, and price is below 30-day avg -> CONSIDER HOLDING
    elif (current_price < avg_30d) and (pct_change_7d >= -1.0) and (volatility_pct <= 12.0):
        expected_rebound_per_qtl = avg_30d - current_price
        net_rebound_after_cost = expected_rebound_per_qtl - holding_cost_per_qtl

        if net_rebound_after_cost > 0:
            recommendation = "CONSIDER HOLDING"
            confidence = 72.0
            summary = f"Prices are currently discounted relative to the 30-day average (Rs {avg_30d:.0f}/qtl). Historical trend may support waiting {request.holding_period_days} days."
            reasons.append(f"Current price of Rs {current_price:.0f}/qtl is Rs {expected_rebound_per_qtl:.0f}/qtl below the 30-day benchmark average.")
            reasons.append(f"Estimated holding cost of Rs {holding_cost_per_qtl:.0f}/qtl allows an estimated theoretical recovery margin of Rs {net_rebound_after_cost:.0f}/qtl.")
            reasons.append(f"7-day price momentum is stabilizing ({pct_change_7d}%) with controlled volatility ({volatility_pct}%).")
            risks.append("Rebound is an observation of historical cyclicality, NEVER a guarantee.")
            risks.append("Inclement weather or regional transport strikes can disrupt mandi arrivals.")
            risks.append("If produce is high-moisture or lacks certified warehouse storage, do not hold.")
        else:
            recommendation = "SELL NOW"
            confidence = 75.0
            summary = "Potential price recovery does not sufficiently offset holding expenses."
            reasons.append(f"Holding cost of Rs {holding_cost_per_qtl:.0f}/qtl exceeds expected recovery margin.")
            reasons.append("Selling now eliminates holding risk and provides immediate liquidity.")
            risks.append("Commodity prices can remain subdued for longer than the anticipated holding window.")

    # Case E: Default to CAUTION or SELL NOW based on momentum
    elif pct_change_7d < -3.0:
        recommendation = "SELL NOW"
        confidence = 75.0
        summary = "Prices are in a clear downward trend over the past 7 days."
        reasons.append(f"Current price has dropped {abs(pct_change_7d):.1f}% below the 7-day average.")
        reasons.append("Holding during a persistent downtrend typically amplifies losses as harvest supply expands.")
        risks.append("Additional arrivals from competing production clusters could accelerate price softening.")
    else:
        recommendation = "CAUTION"
        confidence = 60.0
        summary = "Market signals are mixed. Price is near the historical equilibrium."
        reasons.append(f"Current price (Rs {current_price:.0f}) is aligned closely with the 7-day average (Rs {avg_7d:.0f}).")
        reasons.append(f"Holding cost of Rs {total_holding_cost:.0f} would require prices to increase by at least {holding_cost_impact_pct:.1f}% to break even.")
        risks.append("Evaluate your personal cash requirements and storage reliability before holding.")

    return SellOrHoldResponse(
        commodity_name=commodity_name,
        variety_name=variety_name,
        mandi_name=mandi_name,
        recommendation=recommendation,
        confidence_score=confidence,
        summary=summary,
        reasons=reasons,
        risks_and_uncertainties=risks,
        current_price=current_price,
        current_price_date=price_date_obj.isoformat(),
        price_age_days=price_age_days,
        avg_price_7d=avg_7d,
        avg_price_30d=avg_30d,
        price_change_7d_pct=pct_change_7d,
        price_volatility_pct=volatility_pct,
        estimated_holding_cost=total_holding_cost,
        historical_data_points=data_count,
        disclaimer=DISCLAIMER_TEXT
    )
