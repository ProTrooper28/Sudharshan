from typing import Dict, Any, List
from backend.app.schemas.risk_score import RiskScoreResponse, RiskFactor
from backend.app.ai_ml.risk_scoring.explainability import RiskExplainabilityEngine
from datetime import datetime, timezone

class InstitutionRiskScorer:
    """
    Computes explainable Per-Institution Risk Score (0 to 100) according to Team Bible formula:
    risk = 100 * (
        0.35 * rule_violation_rate +
        0.25 * anomaly_score +
        0.20 * unconfirmed_rate +
        0.10 * intake_pressure +
        0.10 * post_submission_edits
    )
    """
    def __init__(self):
        self.explainability_engine = RiskExplainabilityEngine()

    def calculate_risk_score(
        self,
        inst_id: str,
        academic_year: str,
        metrics: Dict[str, Any]
    ) -> RiskScoreResponse:
        # Extract normalized components (0.0 to 1.0)
        rule_violation_rate = min(1.0, max(0.0, float(metrics.get("rule_violation_rate", 0.0))))
        anomaly_score = min(1.0, max(0.0, float(metrics.get("anomaly_score", 0.0))))
        unconfirmed_rate = min(1.0, max(0.0, float(metrics.get("unconfirmed_rate", 0.0))))
        intake_pressure = min(1.0, max(0.0, float(metrics.get("intake_pressure", 0.0))))
        post_submission_edits = min(1.0, max(0.0, float(metrics.get("post_submission_edits", 0.0))))

        # Compute weighted sum
        score = 100.0 * (
            0.35 * rule_violation_rate +
            0.25 * anomaly_score +
            0.20 * unconfirmed_rate +
            0.10 * intake_pressure +
            0.10 * post_submission_edits
        )
        score = round(min(100.0, max(0.0, score)), 2)

        # Categorize risk level
        if score >= 75.0:
            level = "CRITICAL"
        elif score >= 50.0:
            level = "HIGH"
        elif score >= 25.0:
            level = "MEDIUM"
        else:
            level = "LOW"

        factors: List[RiskFactor] = [
            RiskFactor(
                name="Rule Violation Rate",
                weight=0.35,
                raw_value=rule_violation_rate,
                contribution=round(rule_violation_rate * 35.0, 2),
                rationale=self.explainability_engine.explain_rule_violations(rule_violation_rate)
            ),
            RiskFactor(
                name="Statistical Anomaly (Isolation Forest)",
                weight=0.25,
                raw_value=anomaly_score,
                contribution=round(anomaly_score * 25.0, 2),
                rationale=self.explainability_engine.explain_anomaly(anomaly_score)
            ),
            RiskFactor(
                name="Student Unconfirmed Enrolment Rate",
                weight=0.20,
                raw_value=unconfirmed_rate,
                contribution=round(unconfirmed_rate * 20.0, 2),
                rationale=self.explainability_engine.explain_unconfirmed(unconfirmed_rate)
            ),
            RiskFactor(
                name="Intake Capacity Pressure",
                weight=0.10,
                raw_value=intake_pressure,
                contribution=round(intake_pressure * 10.0, 2),
                rationale=self.explainability_engine.explain_intake(intake_pressure)
            ),
            RiskFactor(
                name="Post-Submission Batch Modifications",
                weight=0.10,
                raw_value=post_submission_edits,
                contribution=round(post_submission_edits * 10.0, 2),
                rationale=self.explainability_engine.explain_edits(post_submission_edits)
            ),
        ]

        # Determine top 3 contributing reasons
        top_factors = sorted(factors, key=lambda f: f.contribution, reverse=True)[:3]
        top_reasons = [f"{f.name}: {f.rationale}" for f in top_factors if f.contribution > 0]

        return RiskScoreResponse(
            inst_id=inst_id,
            academic_year=academic_year,
            score=score,
            risk_level=level,
            factors=factors,
            top_three_reasons=top_reasons,
            computed_at=datetime.now(timezone.utc)
        )
