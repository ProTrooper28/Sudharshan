from sqlalchemy import Column, String, Integer, Date, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from backend.app.core.database import Base
from backend.app.models.enums import EnrolmentStatus, ConfirmationStatus

class Enrolment(Base):
    __tablename__ = "enrolments"

    id = Column(String(64), primary_key=True, index=True)
    apaar_id = Column(String(32), ForeignKey("students.apaar_id"), index=True, nullable=False)
    inst_id = Column(String(64), index=True, nullable=False)
    programme = Column(String(128), index=True, nullable=False)
    academic_year = Column(String(16), index=True, nullable=False)
    quota = Column(String(32), default="regular") # regular, management, nri, supernumerary, oci, fn
    admission_date = Column(Date, nullable=False)
    status = Column(SQLEnum(EnrolmentStatus), default=EnrolmentStatus.ADMITTED, nullable=False)
    confirmation_status = Column(SQLEnum(ConfirmationStatus), default=ConfirmationStatus.PENDING, nullable=False)
    batch_id = Column(String(64), index=True, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    modified_flag = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
