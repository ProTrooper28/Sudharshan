from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.api.deps import get_db
from backend.app.ai_ml.risk_scoring.calculator import InstitutionRiskScorer
from backend.app.ai_ml.risk_scoring.metrics_pipeline import compute_institution_metrics
from backend.app.schemas.risk_score import RiskScoreResponse

router = APIRouter()
risk_scorer = InstitutionRiskScorer()


@router.get("/institutions/{inst_id}/risk", response_model=RiskScoreResponse)
def get_institution_risk_score(
    inst_id: str,
    academic_year: str = Query("2026"),
    db: Session = Depends(get_db),
):
    """
    Computes explainable Per-Institution Risk Score (0–100) using live data
    pulled from the database for this institution + academic year.

    Five weighted components (Team Bible formula):
      - Rule violation rate    (35%)
      - Isolation Forest score (25%)
      - Unconfirmed enrolments (20%)
      - Intake pressure         (10%)
      - Post-submission edits   (10%)
    """
    try:
        metrics = compute_institution_metrics(db, inst_id, academic_year)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to compute institution metrics: {exc}",
        )

    return risk_scorer.calculate_risk_score(
        inst_id=inst_id,
        academic_year=academic_year,
        metrics=metrics,
    )
