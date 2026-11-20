import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

def get_database_url() -> str:
    db_url = os.getenv("DATABASE_URL") or settings.DATABASE_URL
    if db_url and db_url.strip():
        # Handle postgres:// to postgresql:// migration for SQLAlchemy
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return db_url
    # Local fallback to SQLite for zero-friction local development & testing
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "mandi_mitra.db"))
    return f"sqlite:///{db_path}"

SQLALCHEMY_DATABASE_URL = get_database_url()

# SQLite needs check_same_thread=False
connect_args = {"check_same_thread": False} if "sqlite" in SQLALCHEMY_DATABASE_URL else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
