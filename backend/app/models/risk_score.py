from sqlalchemy import Column, String, Integer, Float, DateTime, JSON
from sqlalchemy.sql import func
from backend.app.core.database import Base

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    inst_id = Column(String(64), nullable=False, index=True)
    academic_year = Column(String(16), nullable=False, index=True)
    score = Column(Float, nullable=False)  # 0.0 to 100.0
    factors = Column(JSON, nullable=False)  # Top contributing factors breakdown with weights & values
    computed_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
