"""
Institution Metrics Pipeline
============================
Calculates the five normalised (0-1) inputs that the Risk Scorer needs,
reading directly from the database.  When no database rows exist yet it
falls back to conservative defaults so the endpoint stays usable during
the demo.
"""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.ai_ml.anomaly_detection.model import InstitutionalAnomalyDetector

# Singleton anomaly model – fitted once, reused
_anomaly_detector: Optional[InstitutionalAnomalyDetector] = None


def _get_anomaly_detector() -> InstitutionalAnomalyDetector:
    global _anomaly_detector
    if _anomaly_detector is None:
        _anomaly_detector = InstitutionalAnomalyDetector()
        _anomaly_detector.fit_synthetic_baseline()
    return _anomaly_detector


def compute_institution_metrics(
    db: Session,
    inst_id: str,
    academic_year: str,
) -> Dict[str, Any]:
    """
    Returns a dict with keys:
        rule_violation_rate, anomaly_score, unconfirmed_rate,
        intake_pressure, post_submission_edits
    All values are floats in [0.0, 1.0].
    """
    # ── import here to avoid circular imports at module level ────────────────
    from backend.app.models.enrolment import Enrolment
    from backend.app.models.validation_issue import ValidationIssue
    from backend.app.models.institution import SeatConfig
    from backend.app.models.batch import SubmissionBatch
    from backend.app.models.enums import ConfirmationStatus, IssueSeverity

    # 1. Rule violation rate ─────────────────────────────────────────────────
    #    = issues with BLOCK/CRITICAL/ERROR / total rows in latest validated batch
    batch_rows = (
        db.query(SubmissionBatch)
        .filter_by(inst_id=inst_id)
        .order_by(SubmissionBatch.created_at.desc())
        .first()
    )
    total_rows = batch_rows.row_count if batch_rows else 0
    batch_id = batch_rows.batch_id if batch_rows else None

    if batch_id and total_rows > 0:
        blocking_issues = (
            db.query(ValidationIssue)
            .filter(
                ValidationIssue.batch_id == batch_id,
                ValidationIssue.severity.in_([
                    IssueSeverity.BLOCK,
                    IssueSeverity.CRITICAL,
                    IssueSeverity.ERROR,
                ]),
            )
            .count()
        )
        rule_violation_rate = min(1.0, blocking_issues / total_rows)
    else:
        rule_violation_rate = 0.0

    # 2. Unconfirmed rate ────────────────────────────────────────────────────
    enrolments = (
        db.query(Enrolment)
        .filter_by(inst_id=inst_id, academic_year=academic_year)
        .all()
    )
    total_enrolments = len(enrolments)
    if total_enrolments > 0:
        confirmed = sum(
            1 for e in enrolments
            if e.confirmation_status == ConfirmationStatus.CONFIRMED
        )
        unconfirmed_rate = 1.0 - (confirmed / total_enrolments)
    else:
        unconfirmed_rate = 0.0

    # 3. Intake pressure ─────────────────────────────────────────────────────
    seat_configs = (
        db.query(SeatConfig)
        .filter_by(inst_id=inst_id, academic_year=academic_year)
        .all()
    )
    total_approved = sum(s.approved_intake for s in seat_configs)
    if total_approved > 0:
        admitted = sum(1 for e in enrolments)
        intake_pressure = min(1.0, admitted / total_approved)
    else:
        intake_pressure = 0.0

    # 4. Post-submission edits ───────────────────────────────────────────────
    if total_enrolments > 0:
        modified = sum(1 for e in enrolments if e.modified_flag)
        post_submission_edits = min(1.0, modified / total_enrolments)
    else:
        post_submission_edits = 0.0

    # 5. NRI ratio (needed by Isolation Forest feature extractor) ────────────
    nri_count = sum(1 for e in enrolments if (e.quota or "").lower() == "nri")
    nri_ratio = (nri_count / total_enrolments) if total_enrolments > 0 else 0.0

    # 6. Anomaly score via Isolation Forest ─────────────────────────────────
    detector = _get_anomaly_detector()
    anomaly_score = detector.compute_anomaly_score({
        "nri_ratio": nri_ratio,
        "intake_hugging": intake_pressure,
        "edit_rate": post_submission_edits,
        "unconfirmed_rate": unconfirmed_rate,
    })

    return {
        "rule_violation_rate": round(rule_violation_rate, 4),
        "anomaly_score": round(anomaly_score, 4),
        "unconfirmed_rate": round(unconfirmed_rate, 4),
        "intake_pressure": round(intake_pressure, 4),
        "post_submission_edits": round(post_submission_edits, 4),
        # extras surfaced in the response for transparency
        "total_enrolments": total_enrolments,
        "nri_ratio": round(nri_ratio, 4),
    }

