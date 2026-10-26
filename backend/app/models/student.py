from sqlalchemy import Column, String, Date, DateTime, JSON
from sqlalchemy.sql import func
from backend.app.core.database import Base

class Student(Base):
    __tablename__ = "students"

    apaar_id = Column(String(32), primary_key=True, index=True) # Primary Key across AICTE
    name = Column(String(255), nullable=False, index=True)
    dob = Column(Date, nullable=False)
    gender = Column(String(16), nullable=False)
    parent_name = Column(String(255), nullable=True) # Matching helper for fuzzy duplicate check
    nationality = Column(String(32), default="Indian") # Indian, NRI, OCI, FN
    encrypted_pii = Column(JSON, nullable=True) # Masked/Encrypted mobile, email at rest
    created_at = Column(DateTime(timezone=True), server_default=func.now())
