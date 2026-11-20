from datetime import date, timedelta
from backend.app.schemas.advisor import SellOrHoldRequest
from backend.app.services.advisor_service import evaluate_sell_or_hold
from backend.app.models.price import MarketPrice

def test_insufficient_price_history_produces_insufficient_data():
    """Test 11: Insufficient price history (<3 records) yields INSUFFICIENT DATA."""
    req = SellOrHoldRequest(
        commodity_id=1,
        quantity_quintals=10.0,
        holding_period_days=3
    )
    
    # 0 records
    res_empty = evaluate_sell_or_hold(req, "Paddy", None, "Mandi", [])
    assert res_empty.recommendation == "INSUFFICIENT DATA"
    assert res_empty.historical_data_points == 0

    # 1 record only
    p1 = MarketPrice(
        mandi_id=1, commodity_id=1, price_date=date.today(),
        min_price=2000, max_price=2200, modal_price=2100
    )
    res_one = evaluate_sell_or_hold(req, "Paddy", None, "Mandi", [p1])
    assert res_one.recommendation == "INSUFFICIENT DATA"
    assert res_one.historical_data_points == 1

def test_stale_prices_trigger_insufficient_data_or_warning():
    """Test 10: Stale prices (older than acceptable threshold) are detected and flagged."""
    req = SellOrHoldRequest(
        commodity_id=1,
        max_acceptable_price_age_days=5
    )
    stale_date = date.today() - timedelta(days=12)
    p_stale = [
        MarketPrice(mandi_id=1, commodity_id=1, price_date=stale_date - timedelta(days=i),
                    min_price=2000, max_price=2200, modal_price=2100)
        for i in range(5)
    ]
    res = evaluate_sell_or_hold(req, "Cotton", None, "Mandi", p_stale)
    assert res.recommendation == "INSUFFICIENT DATA"
    assert res.price_age_days == 12
    assert "days old" in res.summary.lower() or "exceeding" in res.summary.lower()

def test_advisory_never_promises_guaranteed_future_prices():
    """Test 12: Advisory output includes explicit disclaimer and does not promise guaranteed prices."""
    req = SellOrHoldRequest(commodity_id=1)
    today = date.today()
    prices = [
        MarketPrice(mandi_id=1, commodity_id=1, price_date=today - timedelta(days=i),
                    min_price=2000, max_price=2400, modal_price=2200 + (i * 20))
        for i in range(10)
    ]
    res = evaluate_sell_or_hold(req, "Chilli", None, "Mandi", prices)
    
    # Check disclaimer exists
    assert "DISCLAIMER" in res.disclaimer
    assert "DOES NOT" in res.disclaimer or "not" in res.disclaimer.lower()
    assert "guarantee" in res.disclaimer.lower()

    # Verify no wording claims 100% guarantee in reasons or summary
    for r in res.reasons:
        assert "guaranteed profit" not in r.lower()
        assert "100% certain" not in r.lower()
