"""
Standalone script to sync daily market prices from data.gov.in / Agmarknet API.
Usage:
    python scripts/sync_agmarknet.py [--state "Telangana"] [--commodity "Paddy (Dhan)"]
"""

import sys
import os
import argparse
import asyncio
import logging

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.config import settings
from backend.app.services.agmarknet_service import agmarknet_service
from backend.app.database.session import SessionLocal
from backend.app.models.location import State, District
from backend.app.models.crop import Commodity, Variety
from backend.app.models.mandi import Mandi
from backend.app.models.price import MarketPrice

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sync_agmarknet")

async def sync(state_filter=None, commodity_filter=None):
    logger.info("Starting Agmarknet data synchronization...")
    if not agmarknet_service.is_live_enabled:
        logger.warning(
            "DATA_GOV_IN_API_KEY is not configured in .env. "
            "Please register at https://data.gov.in to acquire an API key. "
            "The system will continue using authentic benchmark seed data."
        )
        return

    records = await agmarknet_service.fetch_live_prices(
        state=state_filter,
        commodity=commodity_filter,
        limit=100
    )

    if not records:
        logger.warning("No records returned from data.gov.in API. Check parameters or quota.")
        return

    logger.info(f"Received {len(records)} price records from Agmarknet API. Syncing to database...")
    db = SessionLocal()
    inserted = 0
    updated = 0

    try:
        for r in records:
            # Match state or create
            state_rec = db.query(State).filter(State.name.ilike(r["state"])).first()
            if not state_rec:
                state_rec = State(name=r["state"], code=r["state"][:2].upper())
                db.add(state_rec)
                db.flush()

            # Match district or create
            dist_rec = db.query(District).filter(
                District.name.ilike(r["district"]),
                District.state_id == state_rec.id
            ).first()
            if not dist_rec:
                dist_rec = District(state_id=state_rec.id, name=r["district"])
                db.add(dist_rec)
                db.flush()

            # Match mandi or create
            mandi_rec = db.query(Mandi).filter(
                Mandi.name.ilike(r["market"]),
                Mandi.district_id == dist_rec.id
            ).first()
            if not mandi_rec:
                mandi_rec = Mandi(
                    district_id=dist_rec.id,
                    name=r["market"],
                    latitude=dist_rec.latitude or 18.0,
                    longitude=dist_rec.longitude or 79.0,
                    address=f"{r['market']}, {r['district']}, {r['state']}"
                )
                db.add(mandi_rec)
                db.flush()

            # Match commodity or create
            comm_rec = db.query(Commodity).filter(Commodity.name.ilike(r["commodity"])).first()
            if not comm_rec:
                comm_rec = Commodity(name=r["commodity"], category="General")
                db.add(comm_rec)
                db.flush()

            # Match variety
            var_rec = None
            if r["variety"]:
                var_rec = db.query(Variety).filter(
                    Variety.name.ilike(r["variety"]),
                    Variety.commodity_id == comm_rec.id
                ).first()
                if not var_rec:
                    var_rec = Variety(commodity_id=comm_rec.id, name=r["variety"])
                    db.add(var_rec)
                    db.flush()

            # Check existing price record
            price_rec = db.query(MarketPrice).filter(
                MarketPrice.mandi_id == mandi_rec.id,
                MarketPrice.commodity_id == comm_rec.id,
                MarketPrice.variety_id == (var_rec.id if var_rec else None),
                MarketPrice.price_date == r["price_date"]
            ).first()

            if price_rec:
                price_rec.min_price = r["min_price"]
                price_rec.max_price = r["max_price"]
                price_rec.modal_price = r["modal_price"]
                price_rec.data_classification = "live"
                price_rec.data_source = "Agmarknet Live API"
                updated += 1
            else:
                new_price = MarketPrice(
                    mandi_id=mandi_rec.id,
                    commodity_id=comm_rec.id,
                    variety_id=var_rec.id if var_rec else None,
                    price_date=r["price_date"],
                    min_price=r["min_price"],
                    max_price=r["max_price"],
                    modal_price=r["modal_price"],
                    price_unit=r["price_unit"],
                    arrivals_in_tonnes=r["arrivals_in_tonnes"],
                    data_source="Agmarknet Live API",
                    data_classification="live"
                )
                db.add(new_price)
                inserted += 1

        db.commit()
        logger.info(f"Sync complete! Inserted: {inserted}, Updated: {updated}.")
    except Exception as exc:
        db.rollback()
        logger.error(f"Error during synchronization: {exc}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync live market prices from Agmarknet")
    parser.add_argument("--state", help="Filter by state name", default=None)
    parser.add_argument("--commodity", help="Filter by commodity name", default=None)
    args = parser.parse_args()

    asyncio.run(sync(state_filter=args.state, commodity_filter=args.commodity))
