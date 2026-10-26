from __future__ import annotations

from typing import List, Dict, Any

from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.models.enums import IssueSeverity
from backend.app.ai_ml.fuzzy_matching.matcher import FuzzyDuplicateMatcher


class RuleFuzzyDuplicate(BaseRule):
    rule_id = "R10"
    name = "Fuzzy Duplicate Candidate"
    default_severity = IssueSeverity.WARN
    description = (
        "Flags records that look like the same person (Name + DOB + Parent, "
        "supported by APAAR ID typos) despite different or missing APAAR IDs. "
        "Checks the upload against itself AND against existing students. "
        "Also flags one APAAR ID shared by two different people."
    )

    def __init__(self, matcher: FuzzyDuplicateMatcher = None):
        self.matcher = matcher or FuzzyDuplicateMatcher()

    def validate(self, batch_data: List[Dict[str, Any]], context: Dict[str, Any]) -> List[ValidationIssueResult]:
        existing_students = context.get("existing_students", []) or []

        # Same-APAAR duplicates are already reported by R04/R05, so skip them here.
        # Same APAAR but DIFFERENT person (ID_CONFLICT) is still reported.
        findings = self.matcher.find_duplicates(
            batch_data, existing=existing_students, include_same_id=False
        )

        issues: List[ValidationIssueResult] = []
        flagged_rows = set()  # flag each row once (findings are sorted best first)

        for f in findings:
            # Decide which uploaded row to flag and what it was matched with
            if f["source_a"] == "batch" and f["source_b"] == "batch":
                row_idx = max(f["index_a"], f["index_b"])
                other_idx = min(f["index_a"], f["index_b"])
                other_text = f"earlier row {other_idx + 1} in this upload"
            elif f["source_a"] == "batch":
                row_idx = f["index_a"]
                other_text = f"existing student '{f['name_b']}' (APAAR: {f['apaar_id_b']})"
            elif f["source_b"] == "batch":
                row_idx = f["index_b"]
                other_text = f"existing student '{f['name_a']}' (APAAR: {f['apaar_id_a']})"
            else:
                continue

            if row_idx in flagged_rows:
                continue
            flagged_rows.add(row_idx)

            row = batch_data[row_idx]
            if f["verdict"] == "ID_CONFLICT":
                severity = IssueSeverity.ERROR
                message = (
                    f"Row {row_idx + 1}: APAAR ID is shared with a different person "
                    f"({other_text}). {f['reason_text']}."
                )
                field = "apaar_id"
                raw = str(row.get("apaar_id"))
            else:
                severity = self.default_severity
                message = (
                    f"Row {row_idx + 1}: Suspected duplicate identity "
                    f"(similarity: {f['score']}%, {f['confidence']} confidence). "
                    f"Matches {other_text}. {f['reason_text']}. Routed to Review Queue."
                )
                field = "name"
                raw = str(row.get("name"))

            issues.append(
                ValidationIssueResult(
                    rule_id=self.rule_id,
                    severity=severity,
                    message=message,
                    row_index=row_idx,
                    enrolment_id=str(row.get("enrolment_id") or f"row-{row_idx + 1}"),
                    field_name=field,
                    raw_value=raw,
                )
            )
        return issues