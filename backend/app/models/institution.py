from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from backend.app.core.database import Base

class Institution(Base):
    __tablename__ = "institutions"

    inst_id = Column(String(64), primary_key=True, index=True)
    aicte_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    state = Column(String(64), nullable=False, index=True)
    type = Column(String(64), default="Engineering") # e.g. Management, Engineering
    status = Column(String(32), default="active")

class SeatConfig(Base):
    __tablename__ = "seat_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    inst_id = Column(String(64), index=True, nullable=False)
    programme = Column(String(128), index=True, nullable=False)
    academic_year = Column(String(16), index=True, nullable=False)
    approved_intake = Column(Integer, nullable=False)
    supernumerary_limit = Column(Integer, default=0, nullable=False)
    nri_limit = Column(Integer, default=0, nullable=False)
    oci_limit = Column(Integer, default=0, nullable=False)
    fn_limit = Column(Integer, default=0, nullable=False)
