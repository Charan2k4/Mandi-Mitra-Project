import pytest
from backend.app.services.profit_calculator import (
    calculate_gross_revenue,
    calculate_transportation_cost,
    calculate_total_expenses,
    calculate_net_revenue,
    rank_mandi_results
)
from backend.app.schemas.advisor import MandiComparisonResult

def test_profit_calculation_known_values():
    """Test 4: Profit calculation with known reference mathematical values."""
    qty = 20.0 # 20 quintals
    price = 2500.0 # Rs 2,500/quintal
    dist = 50.0 # 50 km
    transport_rate = 15.0 # Rs 15/km
    other_exp = 500.0 # Rs 500

    gross = calculate_gross_revenue(qty, price)
    assert gross == 50000.0 # 20 * 2500 = 50,000

    trans_cost = calculate_transportation_cost(dist, transport_rate)
    assert trans_cost == 750.0 # 50 * 15 = 750

    total_exp = calculate_total_expenses(trans_cost, other_exp)
    assert total_exp == 1250.0 # 750 + 500 = 1,250

    net = calculate_net_revenue(gross, total_exp)
    assert net == 48750.0 # 50,000 - 1,250 = 48,750

def test_different_transportation_rates_affect_net_revenue():
    """Test 5: Different transportation rates produce different net revenues."""
    qty = 10.0
    price = 3000.0
    dist = 40.0
    gross = calculate_gross_revenue(qty, price) # 30,000

    cost_low_rate = calculate_transportation_cost(dist, 10.0) # 400
    cost_high_rate = calculate_transportation_cost(dist, 25.0) # 1000

    net_low = calculate_net_revenue(gross, cost_low_rate) # 29,600
    net_high = calculate_net_revenue(gross, cost_high_rate) # 29,000

    assert net_low > net_high
    assert net_low == 29600.0
    assert net_high == 29000.0
    assert net_low - net_high == 600.0

def test_changing_quantity_changes_gross_and_net_correctly():
    """Test 6: Changing quantity changes gross and net revenue proportionally."""
    price = 2000.0
    fixed_exp = 1000.0

    gross_10 = calculate_gross_revenue(10.0, price) # 20,000
    gross_20 = calculate_gross_revenue(20.0, price) # 40,000
    assert gross_20 == 2 * gross_10

    net_10 = calculate_net_revenue(gross_10, fixed_exp) # 19,000
    net_20 = calculate_net_revenue(gross_20, fixed_exp) # 39,000
    assert net_20 > net_10
    assert net_20 - net_10 == 20000.0 # Exactly equals additional gross revenue

def test_best_mandi_selected_by_net_revenue():
    """Test 7: Mandi with the highest net revenue is ranked #1 and marked recommended."""
    # Mandi A has higher gross price but high distance/expenses resulting in lower net
    mandi_a = MandiComparisonResult(
        mandi_id=1,
        mandi_name="Far Mandi High Price",
        district="Dist A",
        state="State A",
        latitude=18.0,
        longitude=79.0,
        distance_km=150.0,
        price_per_quintal=3200.0,
        price_date="2026-11-20",
        price_age_days=0,
        is_stale=False,
        gross_revenue=32000.0, # 10 qtl * 3200
        transportation_cost=4500.0, # 150 km * 30
        other_expenses=500.0,
        total_selling_expenses=5000.0,
        net_revenue=27000.0, # 32000 - 5000
        net_rate_per_quintal=2700.0,
        rank=0,
        is_recommended=False
    )

    # Mandi B has slightly lower gross price but very close distance, resulting in higher net!
    mandi_b = MandiComparisonResult(
        mandi_id=2,
        mandi_name="Near Mandi Moderate Price",
        district="Dist B",
        state="State A",
        latitude=18.1,
        longitude=79.1,
        distance_km=15.0,
        price_per_quintal=3000.0,
        price_date="2026-11-20",
        price_age_days=0,
        is_stale=False,
        gross_revenue=30000.0, # 10 qtl * 3000
        transportation_cost=450.0, # 15 km * 30
        other_expenses=200.0,
        total_selling_expenses=650.0,
        net_revenue=29350.0, # 30000 - 650 = 29350
        net_rate_per_quintal=2935.0,
        rank=0,
        is_recommended=False
    )

    ranked = rank_mandi_results([mandi_a, mandi_b])
    
    # Mandi B should be Rank 1 because its net revenue (29,350) > Mandi A (27,000)
    assert ranked[0].mandi_id == mandi_b.mandi_id
    assert ranked[0].rank == 1
    assert ranked[0].is_recommended is True
    assert ranked[1].mandi_id == mandi_a.mandi_id
    assert ranked[1].rank == 2
    assert ranked[1].is_recommended is False
