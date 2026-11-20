import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mandi Mitra API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    BACKEND_PORT: int = 8000
    
    # Supabase PostgreSQL database URL or SQLite fallback
    DATABASE_URL: str = ""
    
    # Official data.gov.in / Agmarknet API Key
    DATA_GOV_IN_API_KEY: str = ""
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    # Advisory & calculation defaults
    DEFAULT_RADIUS_KM: int = 100
    DEFAULT_MAX_PRICE_AGE_DAYS: int = 7
    DEFAULT_MIN_PROFIT_IMPROVEMENT_PCT: float = 3.0
    DEFAULT_HOLDING_COST_PER_QUINTAL_PER_DAY: float = 5.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
