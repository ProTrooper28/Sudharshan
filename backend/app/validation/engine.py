from typing import List, Dict, Any, Optional
from backend.app.validation.base import BaseRule, ValidationIssueResult
from backend.app.validation.rules import ALL_RULES
from backend.app.validation.issues.manager import ValidationIssueManager
from backend.app.schemas.validation import BatchValidationReport

class ValidationEngine:
    """
    Core Deterministic Validation Pipeline Orchestrator for Sudarshan.
    Executes rules R01 through R11 in sequence, validates against context constraints,
    and produces structured validation reports.
    """
    def __init__(self, rules: Optional[List[BaseRule]] = None):
        self.rules = rules or ALL_RULES
        self.issue_manager = ValidationIssueManager()

    def validate_batch(
        self,
        batch_id: str,
        inst_id: str,
        batch_data: List[Dict[str, Any]],
        context: Optional[Dict[str, Any]] = None
    ) -> BatchValidationReport:
        ctx = context or {}
        ctx["inst_id"] = inst_id
        ctx["batch_id"] = batch_id

        all_issues: List[ValidationIssueResult] = []

        for rule in self.rules:
            try:
                rule_issues = rule.validate(batch_data, ctx)
                all_issues.extend(rule_issues)
            except Exception as e:
                # Catch rule failures safely
                print(f"[ValidationEngine] Warning: Rule {rule.rule_id} failed: {e}")

        summary = self.issue_manager.summarize(batch_id, all_issues, len(batch_data))
        issue_schemas = self.issue_manager.to_schemas(batch_id, all_issues)

        return BatchValidationReport(
            batch_id=batch_id,
            inst_id=inst_id,
            summary=summary,
            issues=issue_schemas
        )
