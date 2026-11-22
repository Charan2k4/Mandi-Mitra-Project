"""
Standalone script to sync daily market prices from data.gov.in / Agmarknet API into the database.
Usage:
    python scripts/sync_agmarknet.py [--state "Telangana"] [--commodity "Paddy (Dhan)"] [--limit 50]
"""

import sys
import os
import argparse
import asyncio
import logging

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.services.agmarknet_service import agmarknet_service
from backend.app.database.session import SessionLocal

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sync_agmarknet")

async def sync(state_filter=None, commodity_filter=None, limit=50):
    logger.info("Starting Agmarknet data synchronization...")
    if not agmarknet_service.is_live_enabled:
        logger.warning(
            "DATA_GOV_IN_API_KEY is not configured in .env. "
            "Please register at https://data.gov.in to acquire an API key. "
            "The system will continue using authentic benchmark seed data."
        )
        return

    db = SessionLocal()
    try:
        initial_stats = agmarknet_service.get_data_coverage_stats(db)
        logger.info(f"Database coverage before sync: {initial_stats['live_records']} live, {initial_stats['benchmark_records']} benchmark records.")

        result = await agmarknet_service.sync_live_prices_to_db(
            db=db,
            state=state_filter,
            commodity=commodity_filter,
            limit=limit
        )

        logger.info(f"Sync result: {result['message']}")
        updated_stats = agmarknet_service.get_data_coverage_stats(db)
        logger.info(
            f"Database coverage after sync: {updated_stats['live_records']} live records, "
            f"{updated_stats['benchmark_records']} benchmark records, "
            f"Latest record date: {updated_stats['latest_price_date']}."
        )
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Sync live prices from Agmarknet API into Mandi Mitra database")
    parser.add_argument("--state", type=str, default=None, help="Filter by state name")
    parser.add_argument("--commodity", type=str, default=None, help="Filter by commodity name")
    parser.add_argument("--limit", type=int, default=50, help="Max records to retrieve (default: 50)")

    args = parser.parse_args()
    asyncio.run(sync(state_filter=args.state, commodity_filter=args.commodity, limit=args.limit))

if __name__ == "__main__":
    main()
