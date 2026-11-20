from typing import List, Optional
from backend.app.schemas.advisor import MandiComparisonResult

def calculate_gross_revenue(quantity_quintals: float, price_per_quintal: float) -> float:
    """
    Gross Revenue = Quantity in quintals * Price per quintal
    """
    if quantity_quintals < 0 or price_per_quintal < 0:
        raise ValueError("Quantity and price must be non-negative.")
    return round(quantity_quintals * price_per_quintal, 2)

def calculate_transportation_cost(distance_km: Optional[float], rate_per_km: float) -> float:
    """
    Transportation Cost = Distance in km * Rate per km
    If distance is unavailable, returns 0.0
    """
    if rate_per_km < 0:
        raise ValueError("Transportation rate must be non-negative.")
    if distance_km is None or distance_km < 0:
        return 0.0
    return round(distance_km * rate_per_km, 2)

def calculate_total_expenses(transportation_cost: float, other_expenses: float) -> float:
    """
    Total Selling Expenses = Transportation Cost + Other Expenses
    """
    if transportation_cost < 0 or other_expenses < 0:
        raise ValueError("Expenses must be non-negative.")
    return round(transportation_cost + other_expenses, 2)

def calculate_net_revenue(gross_revenue: float, total_expenses: float) -> float:
    """
    Estimated Net Revenue = Gross Revenue - Total Selling Expenses
    """
    return round(gross_revenue - total_expenses, 2)

def rank_mandi_results(results: List[MandiComparisonResult]) -> List[MandiComparisonResult]:
    """
    Ranks mandis strictly by Net Revenue in descending order.
    The highest net revenue receives Rank 1 and is marked as recommended.
    """
    if not results:
        return []
    
    # Sort descending by net_revenue. Tiebreaker: shorter distance, then higher gross revenue
    sorted_results = sorted(
        results,
        key=lambda r: (
            r.net_revenue,
            -(r.distance_km if r.distance_km is not None else 99999),
            r.gross_revenue
        ),
        reverse=True
    )
    
    ranked: List[MandiComparisonResult] = []
    for idx, item in enumerate(sorted_results, start=1):
        item_dict = item.model_dump()
        item_dict["rank"] = idx
        item_dict["is_recommended"] = (idx == 1)
        ranked.append(MandiComparisonResult(**item_dict))
        
    return ranked
