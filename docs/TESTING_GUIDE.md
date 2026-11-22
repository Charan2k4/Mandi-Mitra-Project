# Testing & Quality Assurance Guide — Mandi Mitra

This document outlines how to execute tests, understand test coverage, and troubleshoot failures in Mandi Mitra.

---

## 1. Running Backend Tests

Mandi Mitra uses `pytest` for backend unit, integration, and regression testing.

### Execution Command:
```powershell
python -m pytest backend/tests -v
```

### Complete Test Catalog (16 Tests):

| Test File | Test Name | What It Checks |
| :--- | :--- | :--- |
| `test_health.py` | `test_health_endpoint` | Verifies `/api/health` returns `HTTP 200`, service name, and healthy database status. |
| `test_health.py` | `test_database_connectivity` | Directly executes `SELECT 1` on the SQLAlchemy session. |
| `test_api_endpoints.py` | `test_get_crops_and_mandis_retrieval` | Confirms crops, varieties, and APMC mandis are retrievable. |
| `test_api_endpoints.py` | `test_incompatible_crop_varieties_are_not_compared` | Asserts `HTTP 404` when an invalid commodity ID is submitted. |
| `test_api_endpoints.py` | `test_missing_prices_handled_safely` | Submits coordinates in the middle of the ocean; confirms safe empty results without crashing. |
| `test_profit_calculator.py` | `test_profit_calculation_known_values` | Mathematical verification of Gross, Transport, and Net Revenue against known reference values. |
| `test_profit_calculator.py` | `test_different_transportation_rates_affect_net_revenue` | Asserts higher transport rate strictly lowers net revenue. |
| `test_profit_calculator.py` | `test_changing_quantity_changes_gross_and_net_correctly` | Asserts doubling harvest volume doubles gross return and accurately scales net profits. |
| `test_profit_calculator.py` | `test_best_mandi_selected_by_net_revenue` | Mandi with higher net revenue is selected as Rank #1 even if a farther mandi has a higher gross price. |
| `test_advisor_service.py` | `test_insufficient_price_history_produces_insufficient_data` | Confirms $<3$ historical records safely output `INSUFFICIENT DATA`. |
| `test_advisor_service.py` | `test_stale_prices_trigger_insufficient_data_or_warning` | Confirms prices older than freshness threshold yield `INSUFFICIENT DATA`. |
| `test_advisor_service.py` | `test_advisory_never_promises_guaranteed_future_prices` | Asserts the legal disclaimer is present and forbids words claiming 100% guaranteed prices. |
| `test_distance_service.py` | `test_haversine_distance_known_coordinates` | Validates geodesic calculation between Warangal and Hyderabad (~135 km). |
| `test_distance_service.py` | `test_coordinate_validation` | Asserts boundary checking (latitude $\pm90$, longitude $\pm180$). |
| `test_data_integrity.py` | `test_data_integrity_and_seed_coverage` | Validates multi-state seed records and price history retrieval. |
| `test_idempotent_init.py` | `test_init_db_idempotency_regression` | Regression test verifying calling `init_db()` repeatedly creates zero duplicate records and causes no date collision errors. |

---

## 2. End-to-End System Verification Script

A standalone system verification script runs a 6-step end-to-end check:

```powershell
python scripts/verify_system.py
```

### What It Verifies:
1. **Database Schema & Seed State**: Confirms table creation and seed data availability.
2. **Backend Health API**: Checks `/api/health` response and database connectivity.
3. **Master Data Retrieval**: Confirms states, crops, varieties, and mandis are retrievable.
4. **Profit Comparison Engine**: Simulates farmer query and verifies net revenue deduction and ranking.
5. **Sell-or-Hold Engine**: Simulates advisory request and checks rule evaluation and disclaimer presence.
6. **Price History API**: Verifies 30-day time series points for charting.

---

## 3. Frontend Build Verification

To verify that the frontend compiles cleanly with all translations and components:

```powershell
cd frontend
npm run build
```
The build creates optimized production artifacts in `frontend/dist/` without JSX or TypeScript errors.
