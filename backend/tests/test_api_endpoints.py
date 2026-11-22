def test_get_crops_and_mandis_retrieval(client):
    """Test 3: Crop and mandi data retrieval via API."""
    crops_res = client.get("/api/crops")
    assert crops_res.status_code == 200
    crops = crops_res.json()
    assert len(crops) > 0
    paddy = next((c for c in crops if "Paddy" in c["name"]), None)
    assert paddy is not None

    varieties_res = client.get(f"/api/crops/{paddy['id']}/varieties")
    assert varieties_res.status_code == 200
    varieties = varieties_res.json()
    assert len(varieties) > 0

    mandis_res = client.get("/api/mandis")
    assert mandis_res.status_code == 200
    mandis = mandis_res.json()
    assert len(mandis) > 0

def test_incompatible_crop_varieties_are_not_compared(client):
    """Test 8: Incompatible crop IDs return appropriate error or empty list."""
    payload = {
        "state": "Telangana",
        "district": "Warangal",
        "farmer_lat": 17.9784,
        "farmer_lng": 79.5941,
        "commodity_id": 999999, # Non-existent crop
        "quantity_quintals": 10.0,
        "transport_rate_per_km": 15.0,
        "other_expenses": 200.0,
        "search_radius_km": 100,
        "price_preference": "modal"
    }
    response = client.post("/api/advisor/compare", json=payload)
    assert response.status_code == 404

def test_missing_prices_handled_safely(client):
    """Test 9: Request with out-of-range radius or missing mandis handles safely."""
    payload = {
        "state": "Telangana",
        "district": "Warangal",
        "farmer_lat": 0.0, # In the middle of ocean
        "farmer_lng": 0.0,
        "commodity_id": 1,
        "quantity_quintals": 10.0,
        "transport_rate_per_km": 15.0,
        "other_expenses": 200.0,
        "search_radius_km": 25, # Very small radius in ocean -> 0 mandis
        "price_preference": "modal"
    }
    response = client.post("/api/advisor/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_mandis_found"] == 0
    assert data["best_mandi"] is None
    assert data["results"] == []

def test_preferences_get_and_post(client):
    """Test farmer preferences GET and POST."""
    res_get = client.get("/api/preferences?session_id=test_farmer_pref")
    assert res_get.status_code == 200
    assert res_get.json()["default_radius_km"] == 100

    res_post = client.post("/api/preferences", json={
        "session_id": "test_farmer_pref",
        "default_radius_km": 150,
        "price_preference": "modal",
        "language": "hi",
        "holding_period_days": 7,
        "min_profit_threshold_pct": 5.0,
        "max_acceptable_price_age_days": 10,
        "holding_cost_per_quintal_day": 8.0
    })
    assert res_post.status_code == 200
    assert res_post.json()["default_radius_km"] == 150
    assert res_post.json()["language"] == "hi"

def test_prices_status_endpoint(client):
    """Test prices status coverage endpoint."""
    res = client.get("/api/prices/status")
    assert res.status_code == 200
    data = res.json()
    assert "total_records" in data
    assert "live_records" in data
    assert "benchmark_records" in data

def test_reverse_geocode_endpoint(client):
    """Test reverse geocode GPS coordinates to place, state, and nearest district."""
    # Test coordinates for Rajahmundry, Andhra Pradesh
    res = client.get("/api/locations/reverse-geocode?lat=17.0056&lng=81.7876")
    assert res.status_code == 200
    data = res.json()
    assert "location_name" in data
    assert data["state_name"] == "Andhra Pradesh"
    assert data["district_name"] is not None
    assert data["latitude"] == 17.0056
