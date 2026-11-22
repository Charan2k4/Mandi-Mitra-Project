import os
import json
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings

_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mandi Mitra API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    BACKEND_PORT: int = 8000
    
    # Supabase PostgreSQL database URL or SQLite fallback
    DATABASE_URL: str = ""
    
    # Official data.gov.in / Agmarknet API Key
    DATA_GOV_IN_API_KEY: str = ""
    
    # CORS Origins - supports comma-separated strings or JSON arrays in .env
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]
    
    @field_validator("CORS_ORIGINS")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            clean_str = v.strip()
            if clean_str.startswith("[") and clean_str.endswith("]"):
                try:
                    return json.loads(clean_str)
                except Exception:
                    pass
            return [origin.strip() for origin in clean_str.split(",") if origin.strip()]
        return v

    # Advisory & calculation defaults
    DEFAULT_RADIUS_KM: int = 100
    DEFAULT_MAX_PRICE_AGE_DAYS: int = 7
    DEFAULT_MIN_PROFIT_IMPROVEMENT_PCT: float = 3.0
    DEFAULT_HOLDING_COST_PER_QUINTAL_PER_DAY: float = 5.0

    class Config:
        env_file = [
            str(_PROJECT_ROOT / ".env"),
            str(_BACKEND_DIR / ".env"),
            ".env"
        ]
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
