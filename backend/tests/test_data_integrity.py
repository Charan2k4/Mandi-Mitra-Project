def test_data_integrity_and_seed_coverage(client):
    """Test that all key states and APMC mandis are accurately mapped."""
    states_res = client.get("/api/locations/states")
    assert states_res.status_code == 200
    states = states_res.json()
    state_names = [s["name"] for s in states]
    assert "Telangana" in state_names
    assert "Andhra Pradesh" in state_names
    assert "Maharashtra" in state_names

    # Check price history endpoint
    crops_res = client.get("/api/crops")
    crop_id = crops_res.json()[0]["id"]
    history_res = client.get(f"/api/prices/history?commodity_id={crop_id}&days=30")
    assert history_res.status_code == 200
    history_data = history_res.json()
    assert len(history_data["history"]) > 0
