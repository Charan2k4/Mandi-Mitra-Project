import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.api import api_router
from backend.app.database.init_db import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("mandi_mitra")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables and realistic Indian mandi seed dataset are ready
    logger.info("Initializing Mandi Mitra Database...")
    try:
        init_db()
        logger.info("Database schema and verified market data verified successfully.")
    except Exception as exc:
        logger.error(f"Database initialization error on startup: {exc}")
    yield
    # Shutdown
    logger.info("Mandi Mitra API shutting down.")

app = FastAPI(
    title="Mandi Mitra API",
    description="Farmer Mandi Comparison & Sell-or-Hold Decision Support Engine",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = settings.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.ENVIRONMENT == "development" else origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes under /api
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "project": "Mandi Mitra",
        "tagline": "Helping Farmers Make Smarter Selling Decisions",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=settings.BACKEND_PORT, reload=True)
