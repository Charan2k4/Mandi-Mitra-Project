import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["ENVIRONMENT"] = "testing"

from backend.app.main import app
from backend.app.database.base import Base
from backend.app.database.session import get_db
from backend.app.database.init_db import (
    SEED_DATA, COMMODITIES_DATA, State, District, Mandi, Commodity, Variety, _generate_price_history
)

# Use StaticPool so all connections share the same in-memory SQLite database
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        for state_name, state_data in SEED_DATA.items():
            state = State(name=state_name, code=state_data["code"])
            db.add(state)
            db.flush()
            for dist_name, dist_data in state_data["districts"].items():
                dist = District(state_id=state.id, name=dist_name, latitude=dist_data["lat"], longitude=dist_data["lng"])
                db.add(dist)
                db.flush()
                for m_item in dist_data["mandis"]:
                    m = Mandi(
                        district_id=dist.id,
                        name=m_item["name"],
                        code=m_item.get("code"),
                        latitude=m_item["lat"],
                        longitude=m_item["lng"],
                        contact_phone=m_item.get("phone"),
                        address=f"{m_item['name']}, {dist_name}"
                    )
                    db.add(m)
                    db.flush()

        for c_data in COMMODITIES_DATA:
            c = Commodity(name=c_data["name"], category=c_data["category"], unit=c_data["unit"], shelf_life_days=c_data["shelf_life_days"])
            db.add(c)
            db.flush()
            for v_name in c_data["varieties"]:
                v = Variety(commodity_id=c.id, name=v_name)
                db.add(v)
                db.flush()

        db.commit()
        _generate_price_history(db)
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client():
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
