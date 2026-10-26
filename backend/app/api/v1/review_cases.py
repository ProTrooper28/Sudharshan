from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from backend.app.api.deps import get_db
from backend.app.schemas.review_case import ReviewCaseResponse, ReviewCaseDecisionRequest
from backend.app.models.enums import ReviewCaseType, ReviewDecision
from backend.app.models.audit_log import AuditRecord, compute_audit_hash

router = APIRouter()

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _case_to_response(case) -> ReviewCaseResponse:
    return ReviewCaseResponse(
        id=case.id,
        case_type=case.case_type,
        inst_id=case.inst_id,
        academic_year=case.academic_year,
        enrolment_ids=case.enrolment_ids or [],
        details=case.details,
        decision=case.decision,
        decided_by=case.decided_by,
        decided_at=case.decided_at,
        note=case.note,
        created_at=case.created_at,
    )


def _last_audit_hash(db: Session) -> str:
    from backend.app.models.audit_log import AuditRecord
    last = (
        db.query(AuditRecord)
        .order_by(AuditRecord.id.desc())
        .first()
    )
    return last.record_hash if last else "genesis"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.get("/review-cases", response_model=List[ReviewCaseResponse])
def get_review_cases(
    case_type: Optional[ReviewCaseType] = Query(None),
    status: Optional[ReviewDecision] = Query(None),
    inst_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    Retrieves review cases from the database.
    Supports filtering by case_type, decision status, and institution.
    """
    from backend.app.models.review_case import ReviewCase

    query = db.query(ReviewCase)
    if case_type:
        query = query.filter(ReviewCase.case_type == case_type)
    if status:
        query = query.filter(ReviewCase.decision == status)
    if inst_id:
        query = query.filter(ReviewCase.inst_id == inst_id)

    cases = query.order_by(ReviewCase.created_at.desc()).all()
    return [_case_to_response(c) for c in cases]


@router.post("/review-cases/{case_id}/decision", response_model=ReviewCaseResponse)
def decide_review_case(
    case_id: int,
    request: ReviewCaseDecisionRequest,
    db: Session = Depends(get_db),
):
    """
    AICTE/Institution Officer approves or rejects a suspected conflict.
    The decision is persisted to the ReviewCase table and recorded in the
    hash-chained audit log for non-repudiation.
    """
    from backend.app.models.review_case import ReviewCase

    case = db.query(ReviewCase).filter_by(id=case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Review case not found.")

    now = datetime.now(timezone.utc)
    case.decision = request.decision
    case.decided_by = request.decided_by
    case.decided_at = now
    case.note = request.note

    # Compute audit hash and persist to audit log
    prev_hash = _last_audit_hash(db)
    event_details = {
        "case_id": case_id,
        "case_type": case.case_type.value,
        "decision": request.decision.value,
        "note": request.note,
        "inst_id": case.inst_id,
    }
    record_hash = compute_audit_hash(
        prev_hash=prev_hash,
        event_type="REVIEW_DECISION",
        entity_id=str(case_id),
        actor=request.decided_by,
        details=event_details,
        timestamp_str=now.isoformat(),
    )

    audit_entry = AuditRecord(
        event_type="REVIEW_DECISION",
        entity_id=str(case_id),
        actor=request.decided_by,
        details=event_details,
        prev_hash=prev_hash,
        record_hash=record_hash,
        created_at=now,
    )
    case.audit_hash = record_hash

    db.add(audit_entry)
    db.commit()
    db.refresh(case)

    return _case_to_response(case)


@router.get("/audit-log")
def get_audit_log(
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db),
):
    """
    Returns the hash-chained audit log for AICTE review decisions.
    Clients can verify chain integrity by checking each record_hash.
    """
    from backend.app.models.audit_log import AuditRecord
    records = (
        db.query(AuditRecord)
        .order_by(AuditRecord.id.asc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "event_type": r.event_type,
            "entity_id": r.entity_id,
            "actor": r.actor,
            "details": r.details,
            "prev_hash": r.prev_hash,
            "record_hash": r.record_hash,
            "created_at": r.created_at,
        }
        for r in records
    ]
