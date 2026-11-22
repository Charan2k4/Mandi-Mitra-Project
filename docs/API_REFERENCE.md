# API Reference — Mandi Mitra REST API

Base URL: `http://localhost:8000/api`  
Interactive OpenAPI / Swagger Documentation: `http://localhost:8000/docs`

---

## 1. System Health

### `GET /health`
Returns the operational health of the backend, database connection status, and Agmarknet data mode.

- **Query Parameters**: None
- **Response (200 OK)**:
```json
{
  "status": "healthy",
  "service": "Mandi Mitra API",
  "version": "1.0.0",
  "database": "healthy",
  "database_type": "sqlite",
  "is_custom_database": false,
  "agmarknet_live_mode": false,
  "data_classification": "benchmark_verified",
  "server_timestamp": "2026-11-21T13:30:00.000Z"
}
```

---

## 2. Locations

### `GET /locations/states`
Retrieves all supported Indian agricultural states.

- **Response (200 OK)**:
```json
[
  { "id": 1, "name": "Telangana", "code": "TS" },
  { "id": 2, "name": "Andhra Pradesh", "code": "AP" }
]
```

### `GET /locations/districts`
Retrieves agricultural districts, optionally filtered by state.

- **Query Parameters**:
  - `state_id` (optional, integer): Filter districts by parent state ID.
- **Response (200 OK)**:
```json
[
  { "id": 1, "state_id": 1, "name": "Warangal", "latitude": 17.9784, "longitude": 79.5941 },
  { "id": 2, "state_id": 1, "name": "Khammam", "latitude": 17.2473, "longitude": 80.1514 }
]
```

---

## 3. Crops & Varieties

### `GET /crops`
Retrieves all supported agricultural commodities.

- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Paddy (Dhan)",
    "category": "Cereals",
    "unit": "Quintal",
    "shelf_life_days": 180
  }
]
```

### `GET /crops/{crop_id}/varieties`
Retrieves commercial varieties belonging to a specific crop.

- **Path Parameters**: `crop_id` (integer)
- **Response (200 OK)**:
```json
[
  { "id": 1, "commodity_id": 1, "name": "Sona Masuri", "grade": "Standard" },
  { "id": 2, "commodity_id": 1, "name": "Basmati", "grade": "Standard" }
]
```

---

## 4. APMC Mandis

### `GET /mandis`
Retrieves all APMC mandis with coordinates.

- **Query Parameters**:
  - `district_id` (optional, integer)
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "district_id": 1,
    "name": "Enumamula Cotton Market (Warangal)",
    "code": "TS_WGL_01",
    "latitude": 17.9944,
    "longitude": 79.6231,
    "address": "Enumamula, Warangal, Telangana",
    "contact_phone": "0870-2424100",
    "district_name": "Warangal",
    "state_name": "Telangana"
  }
]
```

### `GET /mandis/nearby`
Finds mandis within a geodesic radius from given GPS coordinates.

- **Query Parameters**:
  - `lat` (required, float): Farmer latitude.
  - `lng` (required, float): Farmer longitude.
  - `radius_km` (optional, float, default: 100.0).
- **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "name": "Narsampet Mandi",
    "latitude": 17.925,
    "longitude": 79.897,
    "distance_km": 32.59,
    "distance_type": "approximate_straight_line"
  }
]
```

---

## 5. Prices & Trends

### `GET /prices/status`
Returns live vs benchmark price data coverage statistics in the database.

- **Response (200 OK)**:
```json
{
  "is_live_api_configured": true,
  "total_records": 8280,
  "live_records": 7,
  "benchmark_records": 8273,
  "latest_price_date": "2026-11-21",
  "latest_data_source": "Agmarknet Official API",
  "latest_classification": "live"
}
```

### `POST /prices/sync`
Triggers an on-demand synchronization of live market prices from the Data.gov.in Agmarknet API into the database.

- **Query Parameters**:
  - `state` (optional, string): e.g. "Telangana"
  - `commodity` (optional, string): e.g. "Tomato"
  - `limit` (optional, integer, default: 50)
- **Response (200 OK)**:
```json
{
  "success": true,
  "status": "synced",
  "message": "Successfully synced 7 live market prices from Agmarknet API.",
  "synced_count": 7,
  "data_classification": "live",
  "timestamp": "2026-11-21T15:02:39.539497"
}
```

### `GET /prices`
Retrieves the latest price record for a mandi/crop pair.

- **Query Parameters**:
  - `commodity_id` (required, integer)
  - `mandi_id` (required, integer)
  - `variety_id` (optional, integer)

### `GET /prices/history`
Retrieves chronological daily price points for charting.

- **Query Parameters**:
  - `commodity_id` (required, integer)
  - `mandi_id` (optional, integer)
  - `variety_id` (optional, integer)
  - `days` (optional, integer, default: 35)
- **Response (200 OK)**:
```json
{
  "commodity_id": 1,
  "commodity_name": "Paddy (Dhan)",
  "mandi_id": 1,
  "mandi_name": "Enumamula Cotton Market",
  "latest_date": "2026-11-20",
  "data_source": "Agmarknet Benchmark Data",
  "history": [
    {
      "price_date": "2026-11-19",
      "modal_price": 2420.0,
      "min_price": 2270.0,
      "max_price": 2570.0,
      "arrivals_in_tonnes": 34.5
    }
  ]
}
```

---

## 6. Decision & Comparison Engine

### `POST /advisor/compare`
The primary farmer mandi comparison and net profit ranking engine.

- **Request Body (JSON)**:
```json
{
  "state": "Telangana",
  "district": "Warangal",
  "farmer_lat": 17.9784,
  "farmer_lng": 79.5941,
  "commodity_id": 1,
  "variety_id": 1,
  "quantity_quintals": 25.0,
  "transport_rate_per_km": 15.0,
  "other_expenses": 300.0,
  "search_radius_km": 100,
  "price_preference": "modal"
}
```

- **Response (200 OK)**:
```json
{
  "query": { ... },
  "total_mandis_found": 2,
  "best_mandi": {
    "mandi_id": 2,
    "mandi_name": "Narsampet Mandi",
    "district": "Warangal",
    "state": "Telangana",
    "distance_km": 32.59,
    "price_per_quintal": 2470.0,
    "price_date": "2026-11-20",
    "gross_revenue": 61750.0,
    "transportation_cost": 488.85,
    "other_expenses": 300.0,
    "total_selling_expenses": 788.85,
    "net_revenue": 60961.15,
    "net_rate_per_quintal": 2438.45,
    "rank": 1,
    "is_recommended": true
  },
  "results": [ ... ],
  "disclaimer": "Distances shown are approximate straight-line estimates..."
}
```

### `POST /advisor/sell-or-hold`
Evaluates historical moving averages and storage costs to yield an explainable recommendation.

- **Request Body (JSON)**:
```json
{
  "commodity_id": 1,
  "variety_id": 1,
  "mandi_id": 2,
  "quantity_quintals": 25.0,
  "holding_period_days": 3,
  "storage_cost_per_quintal_day": 5.0,
  "min_profit_threshold_pct": 3.0,
  "max_acceptable_price_age_days": 7,
  "price_preference": "modal"
}
```

- **Response (200 OK)**:
```json
{
  "commodity_name": "Paddy (Dhan)",
  "variety_name": "Sona Masuri",
  "mandi_name": "Narsampet Mandi",
  "recommendation": "SELL NOW",
  "confidence_score": 92.4,
  "summary": "Current price is near recent peak levels. Favorable condition to lock in gains.",
  "reasons": [
    "Current price of Rs 2470/qtl is within 2.5% of the 30-day peak (Rs 2530).",
    "Holding for 3 day(s) adds Rs 375 in storage costs without clear upward room."
  ],
  "risks_and_uncertainties": [
    "Delaying sale may expose produce to post-peak downward mean reversion."
  ],
  "current_price": 2470.0,
  "avg_price_7d": 2445.0,
  "avg_price_30d": 2410.0,
  "price_change_7d_pct": 1.02,
  "price_volatility_pct": 3.4,
  "estimated_holding_cost": 375.0,
  "historical_data_points": 35,
  "disclaimer": "DISCLAIMER: This advice is an informational rule-based decision support tool..."
}
```

---

## 7. Farmer Preferences

### `GET /preferences`
Retrieves the farmer's stored preferences or default settings.

- **Query Parameters**:
  - `session_id` (optional, string, default: "default_farmer")
- **Response (200 OK)**:
```json
{
  "session_id": "default_farmer",
  "default_radius_km": 100,
  "price_preference": "modal",
  "language": "en",
  "holding_period_days": 3,
  "min_profit_threshold_pct": 3.0,
  "max_acceptable_price_age_days": 7,
  "holding_cost_per_quintal_day": 5.0
}
```

### `POST /preferences`
Persists the farmer's preferences to the database.

- **Request Body (JSON)**:
```json
{
  "session_id": "default_farmer",
  "default_radius_km": 120,
  "price_preference": "modal",
  "language": "te",
  "holding_period_days": 5,
  "min_profit_threshold_pct": 4.0,
  "max_acceptable_price_age_days": 10,
  "holding_cost_per_quintal_day": 6.0
}
```
- **Response (200 OK)**: Same JSON schema as GET.
