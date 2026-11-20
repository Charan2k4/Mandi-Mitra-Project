import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, date
import httpx
from backend.app.core.config import settings

logger = logging.getLogger("mandi_mitra.agmarknet")

# Official data.gov.in resource endpoint for daily mandi prices
AGMARKNET_API_ENDPOINT = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

class AgmarknetService:
    """
    Agmarknet / Data.gov.in API Adapter.
    Fetches official daily mandi market prices when API key is configured.
    Handles network errors, rate limits, schema variations, and provides
    clear classification ('live' vs 'historical' vs 'sample').
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.DATA_GOV_IN_API_KEY
        self.is_live_enabled = bool(self.api_key and self.api_key.strip())
        if self.is_live_enabled:
            logger.info("Agmarknet live API integration is enabled with configured API key.")
        else:
            logger.info("Agmarknet API key not configured. Operating in benchmark/sample fallback mode.")

    async def fetch_live_prices(
        self,
        state: Optional[str] = None,
        commodity: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Query data.gov.in resource for current daily prices.
        Returns list of normalized records or empty list on error.
        """
        if not self.is_live_enabled:
            logger.warning("Attempted to fetch live Agmarknet data without API key.")
            return []

        params = {
            "api-key": self.api_key,
            "format": "json",
            "limit": limit
        }
        if state:
            params["filters[state]"] = state
        if commodity:
            params["filters[commodity]"] = commodity

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(AGMARKNET_API_ENDPOINT, params=params)
                if response.status_code == 200:
                    data = response.json()
                    records = data.get("records", [])
                    return self._normalize_records(records, data_classification="live")
                elif response.status_code == 429:
                    logger.error("Data.gov.in rate limit exceeded (HTTP 429).")
                elif response.status_code == 403:
                    logger.error("Invalid or expired Data.gov.in API key (HTTP 403).")
                else:
                    logger.error(f"Data.gov.in returned error status HTTP {response.status_code}: {response.text}")
        except httpx.RequestError as exc:
            logger.error(f"Network error communicating with Agmarknet API: {exc}")
        except Exception as exc:
            logger.error(f"Unexpected error processing Agmarknet API response: {exc}")

        return []

    def _normalize_records(
        self,
        raw_records: List[Dict[str, Any]],
        data_classification: str = "live"
    ) -> List[Dict[str, Any]]:
        """
        Normalizes raw Agmarknet records into consistent mandi price schema.
        Units normalized to Rs/Quintal.
        """
        normalized = []
        for r in raw_records:
            try:
                state_val = str(r.get("state", "")).strip().title()
                district_val = str(r.get("district", "")).strip().title()
                market_val = str(r.get("market", "")).strip().title()
                commodity_val = str(r.get("commodity", "")).strip().title()
                variety_val = str(r.get("variety", "")).strip().title() or "Common"
                
                # Parse arrival date (usually DD/MM/YYYY or YYYY-MM-DD)
                raw_date = str(r.get("arrival_date", "")).strip()
                parsed_date = self._parse_date(raw_date)

                # Parse prices
                min_price = float(r.get("min_price", 0.0))
                max_price = float(r.get("max_price", 0.0))
                modal_price = float(r.get("modal_price", 0.0))

                # If modal price is 0, estimate from min and max
                if modal_price <= 0 and (min_price > 0 or max_price > 0):
                    modal_price = (min_price + max_price) / 2.0

                if modal_price <= 0:
                    continue # Skip invalid price records

                arrivals = float(r.get("arrivals", 0.0) or 0.0)

                normalized.append({
                    "state": state_val,
                    "district": district_val,
                    "market": market_val,
                    "commodity": commodity_val,
                    "variety": variety_val,
                    "price_date": parsed_date,
                    "min_price": round(min_price, 2),
                    "max_price": round(max_price, 2),
                    "modal_price": round(modal_price, 2),
                    "price_unit": "Rs/Quintal",
                    "arrivals_in_tonnes": arrivals,
                    "data_source": "Agmarknet Official API" if data_classification == "live" else "Agmarknet Benchmark Data",
                    "data_classification": data_classification,
                    "fetched_at": datetime.now().isoformat()
                })
            except (ValueError, TypeError) as err:
                logger.debug(f"Skipping malformed Agmarknet record: {r} - {err}")
                continue

        return normalized

    def _parse_date(self, date_str: str) -> str:
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(date_str, fmt).date().isoformat()
            except ValueError:
                pass
        return date.today().isoformat()

agmarknet_service = AgmarknetService()
