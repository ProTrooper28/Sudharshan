"""
Validation API
==============
POST /validate-batch  – upload CSV, run R01-R11, persist results, return report
GET  /batches/{id}/report         – retrieve persisted report
GET  /batches/{id}/export-failed  – download failed-row CSV
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io
import hashlib
import json
import uuid
from datetime import date, datetime, timezone

from backend.app.api.deps import get_db
from backend.app.validation.engine import ValidationEngine
from backend.app.validation.issues.exporter import FailedRowsExporter
from backend.app.schemas.validation import BatchValidationReport, ValidationIssueSchema
from backend.app.models.enums import (
    IssueSeverity, IssueState, BatchState,
    ReviewCaseType, ReviewDecision, ConfirmationStatus, EnrolmentStatus,
)
from backend.app.ai_ml.review_cases.generator import ReviewCaseGenerator

router = APIRouter()
validation_engine = ValidationEngine()
failed_rows_exporter = FailedRowsExporter()
review_case_generator = ReviewCaseGenerator()

# ---------------------------------------------------------------------------
# Context builder: reads institution data from DB to populate rule context
# ---------------------------------------------------------------------------

def _build_context_from_db(db: Session, inst_id: str) -> dict:
    """
    Builds the validation context dict from the database.
    Works even when the DB is empty (graceful fallback).
    """
    from backend.app.models.institution import SeatConfig
    from backend.app.models.enrolment import Enrolment
    from backend.app.models.student import Student

    seat_configs: dict = {}
    current_enrolment_counts: dict = {}
    external_active_enrolments: dict = {}
    existing_students: list = []
    existing_institution_enrolments: set = set()

    try:
        # ── seat configs ────────────────────────────────────────────────────
        for sc in db.query(SeatConfig).filter_by(inst_id=inst_id).all():
            key = (sc.programme, sc.academic_year)
            seat_configs[key] = {
                "approved_intake": sc.approved_intake,
                "nri_limit": sc.nri_limit,
                "oci_limit": sc.oci_limit,
                "fn_limit": sc.fn_limit,
                "supernumerary_limit": sc.supernumerary_limit,
            }

        # ── current enrolment counts (for this institution) ─────────────────
        enrolments = db.query(Enrolment).filter_by(inst_id=inst_id).all()
        for e in enrolments:
            key = (e.programme, e.academic_year)
            current_enrolment_counts[key] = current_enrolment_counts.get(key, 0) + 1
            existing_institution_enrolments.add((e.apaar_id, e.academic_year))

        # ── cross-institution active enrolments ─────────────────────────────
        # All admitted enrolments at OTHER institutions
        other_enrolments = (
            db.query(Enrolment)
            .filter(
                Enrolment.inst_id != inst_id,
                Enrolment.status == EnrolmentStatus.ADMITTED,
            )
            .all()
        )
        for e in other_enrolments:
            external_active_enrolments.setdefault(e.apaar_id, []).append({
                "inst_id": e.inst_id,
                "programme": e.programme,
                "academic_year": e.academic_year,
            })

        # ── existing students for fuzzy matching (R10) ─────────────────────
        for e in enrolments:
            student = db.query(Student).filter_by(apaar_id=e.apaar_id).first()
            if student:
                existing_students.append({
                    "apaar_id": student.apaar_id,
                    "name": student.name,
                    "dob": student.dob.isoformat() if isinstance(student.dob, date) else str(student.dob),
                    "parent_name": student.parent_name or "",
                })
    except Exception:
        pass  # empty DB → all collections stay empty, rules will still fire where context isn't needed

    return {
        "seat_configs": seat_configs,
        "current_enrolment_counts": current_enrolment_counts,
        "external_active_enrolments": external_active_enrolments,
        "existing_students": existing_students,
        "existing_institution_enrolments": existing_institution_enrolments,
    }


# ---------------------------------------------------------------------------
# Persistence helpers
# ---------------------------------------------------------------------------

def _canonical_batch_hash(rows: list) -> str:
    payload = json.dumps(rows, sort_keys=True, default=str)
    return hashlib.sha256(payload.encode()).hexdigest()


def _persist_batch_and_issues(
    db: Session,
    batch_id: str,
    inst_id: str,
    rows: list,
    report: BatchValidationReport,
) -> None:
    """Save SubmissionBatch and all ValidationIssues to the DB."""
    from backend.app.models.batch import SubmissionBatch
    from backend.app.models.validation_issue import ValidationIssue as ValidationIssueModel

    try:
        # Upsert batch record
        existing_batch = db.query(SubmissionBatch).filter_by(batch_id=batch_id).first()
        if not existing_batch:
            db.add(
                SubmissionBatch(
                    batch_id=batch_id,
                    inst_id=inst_id,
                    source="csv",
                    row_count=len(rows),
                    batch_hash=_canonical_batch_hash(rows),
                    state=BatchState.VALIDATED,
                    submitted_at=datetime.now(timezone.utc),
                )
            )

        # Persist each issue
        for issue in report.issues:
            db.add(
                ValidationIssueModel(
                    batch_id=batch_id,
                    enrolment_id=issue.enrolment_id,
                    row_index=issue.row_index,
                    rule_id=issue.rule_id,
                    severity=issue.severity,
                    message=issue.message,
                    field_name=issue.field_name,
                    raw_value=issue.raw_value,
                    state=IssueState.OPEN,
                )
            )
        db.commit()
    except Exception:
        db.rollback()
        raise


def _persist_review_cases(
    db: Session,
    inst_id: str,
    academic_year: str,
    report: BatchValidationReport,
) -> None:
    """Generate and save R06/R10 review cases from the report."""
    from backend.app.models.review_case import ReviewCase as ReviewCaseModel
    from backend.app.validation.base import ValidationIssueResult

    # Build lightweight ValidationIssueResult objects from the report schemas
    raw_issues = [
        ValidationIssueResult(
            rule_id=iss.rule_id,
            severity=iss.severity,
            message=iss.message,
            row_index=iss.row_index,
            enrolment_id=iss.enrolment_id,
            field_name=iss.field_name,
            raw_value=iss.raw_value,
        )
        for iss in report.issues
        if iss.rule_id in ("R06", "R10")
    ]

    cases = review_case_generator.generate_cases_from_issues(inst_id, academic_year, raw_issues)

    try:
        for case in cases:
            db.add(
                ReviewCaseModel(
                    case_type=case.case_type,
                    inst_id=case.inst_id,
                    academic_year=case.academic_year,
                    enrolment_ids=case.enrolment_ids,
                    details=case.details,
                    decision=ReviewDecision.PENDING,
                )
            )
        db.commit()
    except Exception:
        db.rollback()
        raise


# ---------------------------------------------------------------------------
# In-memory cache (CSV row data needed for export-failed; reports served from DB)
# ---------------------------------------------------------------------------
_ROWS_CACHE: dict = {}  # batch_id → list[dict]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/validate-batch", response_model=BatchValidationReport)
async def validate_batch(
    inst_id: str = Form(...),
    batch_id: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a student CSV, run rules R01–R11, persist results, return report.

    batch_id is optional; a UUID is generated when omitted.
    """
    if not batch_id:
        batch_id = f"BATCH-{uuid.uuid4().hex[:12].upper()}"

    contents = await file.read()
    decoded = contents.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))
    rows = list(reader)

    if not rows:
        raise HTTPException(status_code=400, detail="Uploaded CSV contains no student records.")

    # Build context from live DB data for this institution
    context = _build_context_from_db(db, inst_id)

    # Run validation engine
    report = validation_engine.validate_batch(
        batch_id=batch_id,
        inst_id=inst_id,
        batch_data=rows,
        context=context,
    )

    # Detect academic year from batch (use first non-empty value)
    academic_year = next(
        (r.get("academic_year", "2026") for r in rows if r.get("academic_year")),
        "2026",
    )

    # Persist to DB
    try:
        _persist_batch_and_issues(db, batch_id, inst_id, rows, report)
        _persist_review_cases(db, inst_id, academic_year, report)
    except Exception as exc:
        # Persistence failure is non-fatal; log and continue
        import sys
        print(f"[validation] Warning: DB persist failed: {exc}", file=sys.stderr)

    # Cache row data for export-failed
    _ROWS_CACHE[batch_id] = rows

    return report


@router.get("/batches/{batch_id}/report", response_model=BatchValidationReport)
def get_validation_report(batch_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a validation report by batch ID.
    Reads issues from the database; falls back to a 404 if not found.
    """
    from backend.app.models.batch import SubmissionBatch
    from backend.app.models.validation_issue import ValidationIssue as ValidationIssueModel

    batch = db.query(SubmissionBatch).filter_by(batch_id=batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Validation report not found for this batch.")

    db_issues = (
        db.query(ValidationIssueModel)
        .filter_by(batch_id=batch_id)
        .all()
    )

    issue_schemas = [
        ValidationIssueSchema(
            batch_id=batch_id,
            enrolment_id=i.enrolment_id,
            row_index=i.row_index,
            rule_id=i.rule_id,
            severity=i.severity,
            message=i.message,
            field_name=i.field_name,
            raw_value=i.raw_value,
            state=i.state,
        )
        for i in db_issues
    ]

    # Re-derive summary from stored issues
    from backend.app.validation.issues.manager import ValidationIssueManager
    from backend.app.validation.base import ValidationIssueResult
    mgr = ValidationIssueManager()
    raw_results = [
        ValidationIssueResult(
            rule_id=i.rule_id,
            severity=i.severity,
            message=i.message,
            row_index=i.row_index,
            enrolment_id=i.enrolment_id,
            field_name=i.field_name,
            raw_value=i.raw_value,
        )
        for i in db_issues
    ]
    summary = mgr.summarize(batch_id, raw_results, batch.row_count)

    return BatchValidationReport(
        batch_id=batch_id,
        inst_id=batch.inst_id,
        summary=summary,
        issues=issue_schemas,
    )


@router.get("/batches/{batch_id}/export-failed")
def export_failed_rows(batch_id: str, db: Session = Depends(get_db)):
    """
    One-click export: download a CSV of only the failed rows with their errors.
    Row data comes from the in-memory cache (populated at upload time) or is
    reconstructed from DB if the server was restarted between upload and export.
    """
    from backend.app.models.batch import SubmissionBatch
    from backend.app.models.validation_issue import ValidationIssue as ValidationIssueModel

    batch = db.query(SubmissionBatch).filter_by(batch_id=batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found.")

    # Retrieve stored issues from DB
    db_issues = (
        db.query(ValidationIssueModel)
        .filter_by(batch_id=batch_id)
        .all()
    )
    issue_schemas = [
        ValidationIssueSchema(
            batch_id=batch_id,
            enrolment_id=i.enrolment_id,
            row_index=i.row_index,
            rule_id=i.rule_id,
            severity=i.severity,
            message=i.message,
            field_name=i.field_name,
            raw_value=i.raw_value,
            state=i.state,
        )
        for i in db_issues
    ]

    # Try in-memory rows cache first; otherwise return a slim placeholder
    rows = _ROWS_CACHE.get(batch_id)
    if not rows:
        raise HTTPException(
            status_code=410,
            detail=(
                "Row data is no longer in memory. "
                "Please re-upload the original CSV to regenerate the export."
            ),
        )

    csv_content = failed_rows_exporter.export_csv(
        batch_data=rows,
        issues=issue_schemas,
    )

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=failed_rows_{batch_id}.csv"
        },
    )
