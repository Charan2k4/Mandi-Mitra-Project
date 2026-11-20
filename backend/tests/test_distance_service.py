import pytest
from backend.app.services.distance_service import haversine_distance, is_valid_coordinate

def test_haversine_distance_known_coordinates():
    """Test distance calculation between known Indian geographic landmarks."""
    # Warangal (17.9784, 79.5941) to Hyderabad (17.3850, 78.4867) ~ 135-140 km straight line
    dist = haversine_distance(17.9784, 79.5941, 17.3850, 78.4867)
    assert 130.0 <= dist <= 145.0

    # Same location must equal 0.0
    same_dist = haversine_distance(16.3067, 80.4365, 16.3067, 80.4365)
    assert same_dist == 0.0

def test_coordinate_validation():
    """Test latitude and longitude boundary checks."""
    assert is_valid_coordinate(17.5, 78.5) is True
    assert is_valid_coordinate(-91.0, 78.5) is False
    assert is_valid_coordinate(17.5, 185.0) is False
    assert is_valid_coordinate(None, 78.5) is False
