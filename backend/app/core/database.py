from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sudarshan.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Create all tables defined via SQLAlchemy models.
    Called once at server startup from main.py.
    Import order matters: models must be imported so Base knows about them
    before create_all() is called.
    """
    # Import every model module so their classes register with Base.metadata
    from backend.app.models import (  # noqa: F401
        Student, Enrolment, Institution, SeatConfig,
        SubmissionBatch, ValidationIssue, ReviewCase, RiskScore,
    )
    # AuditRecord is in its own module; import explicitly
    from backend.app.models.audit_log import AuditRecord  # noqa: F401

    Base.metadata.create_all(bind=engine)
