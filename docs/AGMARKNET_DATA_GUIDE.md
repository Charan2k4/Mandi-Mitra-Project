# Agmarknet Data Guide & Provenance — Mandi Mitra

## 1. Official Government Data Source

Mandi Mitra is designed to interface with the official Agricultural Marketing Information Network (**Agmarknet**), published by the Directorate of Marketing & Inspection (DMI), Ministry of Agriculture and Farmers Welfare, Government of India.

Public API Access Resource:
- **Catalog Resource**: `Variety-wise Daily Market Prices Data of Commodity`
- **Official URL**: [https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi](https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi)
- **API Endpoint**: `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`

---

## 2. API Key Configuration

To enable live fetching from Data.gov.in:

1. Register for an account at [data.gov.in](https://data.gov.in/).
2. Navigate to your user profile and generate an **API Key**.
3. Open your `.env` file and set:
   ```env
   DATA_GOV_IN_API_KEY=your_registered_api_key_here
   ```
4. Restart the FastAPI backend. The `/api/health` endpoint will confirm:
   ```json
   {
     "agmarknet_live_mode": true
   }
   ```

---

## 3. Data Classification & Provenance

Mandi Mitra strictly adheres to honest data labeling. In both the API and database, every price record carries a `data_classification` tag:

| Classification | Meaning | UI Representation |
| :--- | :--- | :--- |
| **`live`** | Genuinely retrieved from the official Data.gov.in live API using an active API key on today's date. | Green "Live Gov Data" badge with fetch timestamp. |
| **`historical`** | Verified previous trading records from prior days (up to 45 days) used for trend analysis. | "Historical APMC Record" with exact price date. |
| **`benchmark`** | Pre-seeded baseline records modeled on historical seasonal averages and authentic APMC coordinates. | "Agmarknet Benchmark Data". |

> [!CAUTION]
> Mandi Mitra **never** fabricates prices or falsely labels benchmark data as live government prices.

---

## 4. Normalization & Sanitization Pipeline

When raw government records are ingested via `backend/app/services/agmarknet_service.py`, the following normalization pipeline executes:

1. **Unit Standardization**: All prices are validated and normalized to **Rupees per Quintal (₹/qtl)**.
2. **Date Parsing**: Date strings formatted as `DD/MM/YYYY`, `YYYY-MM-DD`, or `DD-MM-YYYY` are standardized into ISO format `YYYY-MM-DD`.
3. **Missing Value Recovery**: If `modal_price` is missing or 0 while `min_price` and `max_price` exist, the modal price is estimated as:
   $$\text{Modal Price} = \frac{\text{Min Price} + \text{Max Price}}{2}$$
   Records with 0 for all prices are rejected.
4. **Deduplication**: Records are uniquely keyed by `(mandi_id, commodity_id, variety_id, price_date)` to prevent duplicate entries.
5. **Arrivals Normalization**: Market arrival volumes are parsed as tonnes.

---

## 5. Live Data Synchronization Script

A standalone synchronization script is provided at `scripts/sync_agmarknet.py`:

```powershell
# Sync all available market records
python scripts/sync_agmarknet.py

# Sync records filtered by state
python scripts/sync_agmarknet.py --state "Telangana"

# Sync records filtered by commodity
python scripts/sync_agmarknet.py --commodity "Paddy (Dhan)"
```

### Rate Limits & Network Failure Handling:
- If Data.gov.in returns `HTTP 429` (Rate Limit Exceeded) or `HTTP 403` (Invalid Key), the service logs an explicit error and falls back gracefully to benchmark records without interrupting the user experience.
- Network timeouts are caught after 10.0 seconds using asynchronous HTTPX client pooling.
