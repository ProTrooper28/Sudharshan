import unittest
import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.validation.rules.r01_missing_apaar import RuleMissingApaar
from backend.app.validation.rules.r02_invalid_apaar import RuleInvalidApaarFormat
from backend.app.validation.rules.r04_file_duplicates import RuleFileDuplicates
from backend.app.validation.rules.r06_cross_clash import RuleCrossInstitutionClash
from backend.app.ai_ml.fuzzy_matching.matcher import FuzzyDuplicateMatcher
from backend.app.ai_ml.risk_scoring.calculator import InstitutionRiskScorer
from backend.app.ai_ml.review_cases.generator import ReviewCaseGenerator
from backend.app.models.enums import IssueSeverity
from dataclasses import dataclass

@dataclass
class MockValidationIssue:
    batch_id: str
    enrolment_id: str
    rule_id: str
    severity: IssueSeverity
    message: str
    raw_value: str

class TestValidationAndML(unittest.TestCase):
    def test_r01_missing_apaar(self):
        rule = RuleMissingApaar()
        data = [{"apaar_id": ""}, {"apaar_id": "123456789012"}]
        issues = rule.validate(data, {})
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0].rule_id, "R01")
        self.assertEqual(issues[0].severity, IssueSeverity.BLOCK)

    def test_r02_invalid_apaar(self):
        rule = RuleInvalidApaarFormat()
        data = [{"apaar_id": "12345"}, {"apaar_id": "123456789012"}]
        issues = rule.validate(data, {})
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0].rule_id, "R02")

    def test_r04_file_duplicate(self):
        rule = RuleFileDuplicates()
        data = [
            {"apaar_id": "123456789012", "programme": "CSE", "academic_year": "2026"},
            {"apaar_id": "123456789012", "programme": "CSE", "academic_year": "2026"}
        ]
        issues = rule.validate(data, {})
        self.assertEqual(len(issues), 2)
        self.assertEqual(issues[0].rule_id, "R04")

    def test_r06_cross_institution_clash(self):
        rule = RuleCrossInstitutionClash()
        data = [{"apaar_id": "123456789012", "academic_year": "2026"}]
        ctx = {
            "inst_id": "COLLEGE_A",
            "external_active_enrolments": {
                "123456789012": [{"inst_id": "COLLEGE_B", "programme": "IT", "academic_year": "2026"}]
            }
        }
        issues = rule.validate(data, ctx)
        self.assertEqual(len(issues), 1)
        self.assertEqual(issues[0].rule_id, "R06")
        self.assertEqual(issues[0].severity, IssueSeverity.CRITICAL)

    def test_fuzzy_matching(self):
        matcher = FuzzyDuplicateMatcher()
        is_match, score, details = matcher.compute_match_score(
            name1="Aarav Sharma", dob1="2004-05-12", parent1="Ramesh Sharma",
            name2="Aarav Sharma", dob2="2004-05-12", parent2="Ramesh Sharma"
        )
        self.assertTrue(is_match)
        self.assertGreater(score, 75.0)

    def test_risk_scoring(self):
        scorer = InstitutionRiskScorer()
        metrics = {
            "rule_violation_rate": 0.20,
            "anomaly_score": 0.50,
            "unconfirmed_rate": 0.30,
            "intake_pressure": 0.95,
            "post_submission_edits": 0.05
        }
        res = scorer.calculate_risk_score("INST-001", "2026", metrics)
        self.assertTrue(0.0 <= res.score <= 100.0)
        self.assertGreater(len(res.top_three_reasons), 0)
        self.assertEqual(len(res.factors), 5)

    def test_review_case_generation(self):
        generator = ReviewCaseGenerator()
        issue = MockValidationIssue(
            batch_id="BATCH-01",
            enrolment_id="ENR-1",
            rule_id="R06",
            severity=IssueSeverity.CRITICAL,
            message="Cross clash",
            raw_value="123456789012"
        )
        cases = generator.generate_cases_from_issues("INST-01", "2026", [issue])
        self.assertEqual(len(cases), 1)
        self.assertEqual(cases[0].case_type.value, "clash")

if __name__ == "__main__":
    unittest.main()
