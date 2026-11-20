def test_health_endpoint(client):
    """Test 1: Backend health endpoint responds with healthy status and database status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "healthy" in data["database"]
    assert "service" in data
    assert data["service"] == "Mandi Mitra API"

def test_database_connectivity(db_session):
    """Test 2: Direct database connection query executes cleanly."""
    from sqlalchemy import text
    result = db_session.execute(text("SELECT 1")).scalar()
    assert result == 1
