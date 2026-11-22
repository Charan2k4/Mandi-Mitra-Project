import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

logger = logging.getLogger("mandi_mitra.database")

def is_postgres_configured() -> bool:
    """Returns True if DATABASE_URL was explicitly provided in environment or settings."""
    raw_url = os.getenv("DATABASE_URL") or settings.DATABASE_URL
    return bool(raw_url and raw_url.strip())

def get_database_url() -> str:
    """
    Resolves the SQLAlchemy database connection URL.
    - If DATABASE_URL is set, normalizes and returns the PostgreSQL connection string.
    - If DATABASE_URL is not set, falls back to the local development SQLite database.
    NOTE: If DATABASE_URL is explicitly provided, failures will NOT fall back to SQLite.
    """
    raw_url = os.getenv("DATABASE_URL") or settings.DATABASE_URL
    if raw_url and raw_url.strip():
        db_url = raw_url.strip()
        # Handle postgres:// to postgresql:// migration for SQLAlchemy
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
            db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        logger.info("Using explicitly configured PostgreSQL/Supabase database.")
        return db_url
    
    # Local fallback to SQLite for zero-friction local development & testing
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "mandi_mitra.db"))
    logger.info(f"DATABASE_URL not configured. Operating in local SQLite fallback mode: {db_path}")
    return f"sqlite:///{db_path}"

SQLALCHEMY_DATABASE_URL = get_database_url()

# SQLite needs check_same_thread=False
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
else:
    # Production-grade PostgreSQL / Supabase pool configuration
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={
            "connect_timeout": 10,
            "keepalives": 1,
            "keepalives_idle": 30,
            "keepalives_interval": 10,
            "keepalives_count": 5
        },
        pool_pre_ping=True,      # Tests connection liveness with SELECT 1 before each checkout
        pool_recycle=300,        # Automatically recycles connections every 5 min to prevent stale pooler disconnects
        pool_size=10,            # Sensible persistent pool for concurrent requests
        max_overflow=20,         # Allows burst capacity
        pool_timeout=15          # Max wait time for an available connection from pool
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify_database_connection():
    """
    Verifies that the database engine can connect.
    If PostgreSQL is explicitly configured and fails, raises RuntimeError rather than silently failing.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as exc:
        if is_postgres_configured():
            err_msg = (
                f"CRITICAL DATABASE ERROR: Explicitly configured DATABASE_URL failed to connect to PostgreSQL/Supabase: {exc}. "
                "Please verify your database credentials, password, and connection pooler settings. "
                "Mandi Mitra will NOT fall back to SQLite when DATABASE_URL is explicitly configured."
            )
            logger.error(err_msg)
            raise RuntimeError(err_msg) from exc
        else:
            logger.error(f"Local SQLite database connection failed: {exc}")
            raise

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
