import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database.base import Base
from backend.app.database.init_db import init_db
from backend.app.models.price import MarketPrice
from backend.app.models.location import State
from backend.app.models.mandi import Mandi

def test_init_db_idempotency_regression():
    """
    Regression Test for Task 2:
    Verifies that repeatedly calling init_db() does NOT attempt to mutate
    or duplicate historical records and does NOT raise sqlite3.IntegrityError
    due to unique date collisions.
    """
    # 1. First initialization (creates and seeds if empty)
    init_db()

    from backend.app.database.session import SessionLocal
    db = SessionLocal()
    try:
        initial_states_count = db.query(State).count()
        initial_mandis_count = db.query(Mandi).count()
        initial_prices_count = db.query(MarketPrice).count()

        assert initial_states_count > 0
        assert initial_mandis_count > 0
        assert initial_prices_count > 0

        # 2. Second initialization (must be completely idempotent)
        init_db()

        # 3. Third initialization
        init_db()

        # Check counts remain identical and no duplicates were created
        final_states_count = db.query(State).count()
        final_mandis_count = db.query(Mandi).count()
        final_prices_count = db.query(MarketPrice).count()

        assert final_states_count == initial_states_count
        assert final_mandis_count == initial_mandis_count
        assert final_prices_count == initial_prices_count
    finally:
        db.close()
