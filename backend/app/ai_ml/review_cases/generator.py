from typing import List
from backend.app.validation.base import ValidationIssueResult
from backend.app.models.enums import ReviewCaseType, ReviewDecision, IssueSeverity
from backend.app.schemas.review_case import ReviewCaseCreate


class ReviewCaseGenerator:
    """
    Subsystem for generating human-in-the-loop review cases from:
    1. Cross-institution clashes (R06) → ReviewCaseType.CLASH
    2. Fuzzy duplicate matches (R10)  → ReviewCaseType.DUPLICATE
    3. Severe statistical anomalies   → ReviewCaseType.ANOMALY
    """

    def generate_cases_from_issues(
        self,
        inst_id: str,
        academic_year: str,
        issues: List[ValidationIssueResult],
    ) -> List[ReviewCaseCreate]:
        cases: List[ReviewCaseCreate] = []

        for issue in issues:
            if issue.rule_id == "R06":
                cases.append(
                    ReviewCaseCreate(
                        case_type=ReviewCaseType.CLASH,
                        inst_id=inst_id,
                        academic_year=academic_year,
                        enrolment_ids=[str(issue.enrolment_id)] if issue.enrolment_id else [],
                        details={
                            "rule_id": "R06",
                            "severity": issue.severity.value,
                            "summary": issue.message,
                            "apaar_id": issue.raw_value,
                        },
                    )
                )
            elif issue.rule_id == "R10":
                cases.append(
                    ReviewCaseCreate(
                        case_type=ReviewCaseType.DUPLICATE,
                        inst_id=inst_id,
                        academic_year=academic_year,
                        enrolment_ids=[str(issue.enrolment_id)] if issue.enrolment_id else [],
                        details={
                            "rule_id": "R10",
                            "severity": issue.severity.value,
                            "summary": issue.message,
                            "name": issue.raw_value,
                        },
                    )
                )

        return cases

    def generate_anomaly_case(
        self,
        inst_id: str,
        academic_year: str,
        anomaly_score: float,
        reasons: List[str],
    ) -> ReviewCaseCreate:
        return ReviewCaseCreate(
            case_type=ReviewCaseType.ANOMALY,
            inst_id=inst_id,
            academic_year=academic_year,
            enrolment_ids=[],
            details={
                "anomaly_score": anomaly_score,
                "reasons": reasons,
            },
        )
