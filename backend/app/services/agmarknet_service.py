import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, date
import httpx
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.core.config import settings
from backend.app.models.crop import Commodity, Variety
from backend.app.models.mandi import Mandi
from backend.app.models.location import District, State
from backend.app.models.price import MarketPrice

logger = logging.getLogger("mandi_mitra.agmarknet")

# Official data.gov.in resource endpoint for daily mandi prices
AGMARKNET_API_ENDPOINT = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"

# Standard browser User-Agent required by data.gov.in reverse proxy
HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

COMMODITY_ALIASES = {
    "tomato": "Tomato",
    "paddy": "Paddy (Dhan)",
    "dhan": "Paddy (Dhan)",
    "maize": "Maize (Makka)",
    "makka": "Maize (Makka)",
    "corn": "Maize (Makka)",
    "cotton": "Cotton (Kapas)",
    "kapas": "Cotton (Kapas)",
    "chilli": "Red Chilli (Mirchi)",
    "mirchi": "Red Chilli (Mirchi)",
    "red chilli": "Red Chilli (Mirchi)",
    "soyabean": "Soybean",
    "soybean": "Soybean",
    "wheat": "Wheat (Gehun)",
    "gehun": "Wheat (Gehun)",
    "onion": "Onion (Pyaz)",
    "pyaz": "Onion (Pyaz)",
    "gram": "Bengal Gram (Chana)",
    "chana": "Bengal Gram (Chana)",
    "bengal gram": "Bengal Gram (Chana)",
    "turmeric": "Turmeric (Haldi)",
    "haldi": "Turmeric (Haldi)"
}

class AgmarknetService:
    """
    Agmarknet / Data.gov.in API Adapter.
    Fetches official daily mandi market prices when API key is configured.
    Handles network errors, rate limits, schema variations, and provides
    clear classification ('live' vs 'benchmark').
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
            async with httpx.AsyncClient(timeout=25.0, headers=HTTP_HEADERS) as client:
                response = await client.get(AGMARKNET_API_ENDPOINT, params=params)
                if response.status_code == 200:
                    data = response.json()
                    records = data.get("records", [])
                    logger.info(f"Successfully retrieved {len(records)} live records from Agmarknet API.")
                    return self._normalize_records(records, data_classification="live")
                elif response.status_code == 429:
                    logger.error("Data.gov.in rate limit exceeded (HTTP 429).")
                elif response.status_code == 403:
                    logger.error("Invalid or expired Data.gov.in API key (HTTP 403).")
                else:
                    logger.error(f"Data.gov.in returned error status HTTP {response.status_code}: {response.text}")
        except httpx.RequestError as exc:
            logger.warning(f"Network issue communicating with Agmarknet API: {exc}. Operating with existing data safely.")
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
                commodity_val = str(r.get("commodity", "")).strip()
                variety_val = str(r.get("variety", "")).strip().title() or "Common"
                
                raw_date = str(r.get("arrival_date", "")).strip()
                parsed_date = self._parse_date(raw_date)

                min_price = float(r.get("min_price", 0.0))
                max_price = float(r.get("max_price", 0.0))
                modal_price = float(r.get("modal_price", 0.0))

                if modal_price <= 0 and (min_price > 0 or max_price > 0):
                    modal_price = (min_price + max_price) / 2.0

                if modal_price <= 0:
                    continue

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
                    "fetched_at": datetime.utcnow().isoformat()
                })
            except (ValueError, TypeError) as err:
                logger.debug(f"Skipping malformed Agmarknet record: {r} - {err}")
                continue

        return normalized

    def _parse_date(self, date_str: str) -> date:
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(date_str, fmt).date()
            except ValueError:
                pass
        return date.today()

    def resolve_commodity_match(self, raw_name: str, db_commodities: List[Commodity]) -> Optional[Commodity]:
        """Maps Agmarknet commodity strings (e.g. 'Paddy(Fine/Superfine/Grade A)') to standard commodity models."""
        raw_lower = raw_name.lower()
        for alias, standard_name in COMMODITY_ALIASES.items():
            if alias in raw_lower:
                for c in db_commodities:
                    if standard_name.lower() in c.name.lower():
                        return c
        for c in db_commodities:
            if c.name.lower() in raw_lower or raw_lower in c.name.lower():
                return c
        return None

    async def sync_live_prices_to_db(
        self,
        db: Session,
        state: Optional[str] = None,
        commodity: Optional[str] = None,
        limit: int = 50
    ) -> Dict[str, Any]:
        """
        Fetches live records from Agmarknet API and idempotently syncs them into the database.
        Uses in-memory tracking to prevent any duplicate key collisions within the batch.
        """
        if not self.is_live_enabled:
            return {
                "success": False,
                "status": "disabled",
                "message": "Agmarknet API key not configured. Operating in benchmark mode.",
                "synced_count": 0,
                "data_classification": "benchmark"
            }

        live_records = await self.fetch_live_prices(state=state, commodity=commodity, limit=limit)
        if not live_records:
            return {
                "success": False,
                "status": "no_records_or_offline",
                "message": "No live records returned or external API was unreachable. Existing prices preserved.",
                "synced_count": 0,
                "data_classification": "benchmark"
            }

        db_commodities = db.query(Commodity).all()
        db_mandis = db.query(Mandi).join(District).join(State).all()
        
        synced_count = 0
        now_dt = datetime.utcnow()
        # In-memory dictionary tracking pending upserts in this session to prevent unique constraint collisions
        pending_upserts = {}

        for rec in live_records:
            matched_commodity = self.resolve_commodity_match(rec["commodity"], db_commodities)
            if not matched_commodity:
                continue

            target_mandis = []
            rec_market_lower = rec["market"].lower()
            rec_district_lower = rec["district"].lower()
            rec_state_lower = rec["state"].lower()

            for m in db_mandis:
                m_name_lower = m.name.lower()
                m_dist_lower = m.district.name.lower() if m.district else ""
                m_state_lower = m.district.state.name.lower() if (m.district and m.district.state) else ""

                if rec_market_lower in m_name_lower or m_name_lower in rec_market_lower:
                    target_mandis.append(m)
                elif m_dist_lower and (m_dist_lower in rec_district_lower or rec_district_lower in m_dist_lower):
                    target_mandis.append(m)

            if not target_mandis:
                for m in db_mandis:
                    m_state_lower = m.district.state.name.lower() if (m.district and m.district.state) else ""
                    if m_state_lower and (m_state_lower in rec_state_lower or rec_state_lower in m_state_lower):
                        target_mandis.append(m)
                        break

            if not target_mandis:
                continue

            for target_mandi in target_mandis:
                varieties = db.query(Variety).filter(Variety.commodity_id == matched_commodity.id).all()
                primary_variety = varieties[0] if varieties else None
                var_id = primary_variety.id if primary_variety else None
                key = (target_mandi.id, matched_commodity.id, var_id, rec["price_date"])

                # If this combination was already created or updated in this batch, update it in place
                if key in pending_upserts:
                    existing = pending_upserts[key]
                    existing.min_price = rec["min_price"]
                    existing.max_price = rec["max_price"]
                    existing.modal_price = rec["modal_price"]
                    existing.arrivals_in_tonnes = rec["arrivals_in_tonnes"]
                    existing.data_source = "Agmarknet Official API"
                    existing.data_classification = "live"
                    existing.fetched_at = now_dt
                    synced_count += 1
                    continue

                # Otherwise check the database
                existing = db.query(MarketPrice).filter(
                    MarketPrice.mandi_id == target_mandi.id,
                    MarketPrice.commodity_id == matched_commodity.id,
                    MarketPrice.variety_id == var_id,
                    MarketPrice.price_date == rec["price_date"]
                ).first()

                if existing:
                    existing.min_price = rec["min_price"]
                    existing.max_price = rec["max_price"]
                    existing.modal_price = rec["modal_price"]
                    existing.arrivals_in_tonnes = rec["arrivals_in_tonnes"]
                    existing.data_source = "Agmarknet Official API"
                    existing.data_classification = "live"
                    existing.fetched_at = now_dt
                    pending_upserts[key] = existing
                else:
                    new_price = MarketPrice(
                        mandi_id=target_mandi.id,
                        commodity_id=matched_commodity.id,
                        variety_id=var_id,
                        price_date=rec["price_date"],
                        min_price=rec["min_price"],
                        max_price=rec["max_price"],
                        modal_price=rec["modal_price"],
                        price_unit="Rs/Quintal",
                        arrivals_in_tonnes=rec["arrivals_in_tonnes"],
                        data_source="Agmarknet Official API",
                        data_classification="live",
                        fetched_at=now_dt
                    )
                    db.add(new_price)
                    pending_upserts[key] = new_price
                synced_count += 1

        db.commit()
        logger.info(f"Successfully synced {synced_count} live market price records into database.")
        return {
            "success": True,
            "status": "synced",
            "message": f"Successfully synced {synced_count} live market prices from Agmarknet API.",
            "synced_count": synced_count,
            "data_classification": "live",
            "timestamp": now_dt.isoformat()
        }

    def get_data_coverage_stats(self, db: Session) -> Dict[str, Any]:
        """Provides statistics on live vs benchmark records in the database."""
        total_records = db.query(MarketPrice).count()
        live_records = db.query(MarketPrice).filter(MarketPrice.data_classification == "live").count()
        benchmark_records = db.query(MarketPrice).filter(MarketPrice.data_classification == "benchmark").count()
        historical_records = db.query(MarketPrice).filter(MarketPrice.data_classification == "historical").count()

        latest_record = db.query(MarketPrice).order_by(MarketPrice.price_date.desc()).first()

        return {
            "is_live_api_configured": self.is_live_enabled,
            "total_records": total_records,
            "live_records": live_records,
            "benchmark_records": benchmark_records,
            "historical_records": historical_records,
            "latest_price_date": latest_record.price_date.isoformat() if latest_record else None,
            "latest_data_source": latest_record.data_source if latest_record else None,
            "latest_classification": latest_record.data_classification if latest_record else None
        }

agmarknet_service = AgmarknetService()
