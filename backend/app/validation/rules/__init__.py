from backend.app.validation.rules.r01_missing_apaar import RuleMissingApaar
from backend.app.validation.rules.r02_invalid_apaar import RuleInvalidApaarFormat
from backend.app.validation.rules.r03_apaar_lookup import RuleApaarLookup
from backend.app.validation.rules.r04_file_duplicates import RuleFileDuplicates
from backend.app.validation.rules.r05_inst_duplicates import RuleInstitutionDuplicates
from backend.app.validation.rules.r06_cross_clash import RuleCrossInstitutionClash
from backend.app.validation.rules.r07_over_intake import RuleOverIntake
from backend.app.validation.rules.r08_category_limits import RuleCategoryLimits
from backend.app.validation.rules.r09_consistency import RuleFieldConsistency
from backend.app.validation.rules.r10_fuzzy_duplicate import RuleFuzzyDuplicate
from backend.app.validation.rules.r11_post_submission import RulePostSubmissionEdit

ALL_RULES = [
    RuleMissingApaar(),
    RuleInvalidApaarFormat(),
    RuleApaarLookup(),
    RuleFileDuplicates(),
    RuleInstitutionDuplicates(),
    RuleCrossInstitutionClash(),
    RuleOverIntake(),
    RuleCategoryLimits(),
    RuleFieldConsistency(),
    RuleFuzzyDuplicate(),
    RulePostSubmissionEdit()
]

__all__ = [
    "RuleMissingApaar",
    "RuleInvalidApaarFormat",
    "RuleApaarLookup",
    "RuleFileDuplicates",
    "RuleInstitutionDuplicates",
    "RuleCrossInstitutionClash",
    "RuleOverIntake",
    "RuleCategoryLimits",
    "RuleFieldConsistency",
    "RuleFuzzyDuplicate",
    "RulePostSubmissionEdit",
    "ALL_RULES",
]
