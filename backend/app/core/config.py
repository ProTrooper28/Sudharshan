import os
from typing import List

class Settings:
    PROJECT_NAME: str = "Sudarshan - APAAR Data Management & Verification System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "sudarshan-hackathon-secure-key-2026")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sudarshan.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # Allowed CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # ML & Risk Thresholds
    FUZZY_NAME_SIMILARITY_THRESHOLD: float = 85.0
    FUZZY_PARENT_SIMILARITY_THRESHOLD: float = 80.0
    RISK_WEIGHT_RULE_VIOLATIONS: float = 0.35
    RISK_WEIGHT_ANOMALY: float = 0.25
    RISK_WEIGHT_UNCONFIRMED: float = 0.20
    RISK_WEIGHT_INTAKE_PRESSURE: float = 0.10
    RISK_WEIGHT_POST_SUBMISSION_EDITS: float = 0.10

settings = Settings()
