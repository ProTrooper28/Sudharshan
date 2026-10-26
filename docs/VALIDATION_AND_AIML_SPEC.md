# Validation & AI/ML Architecture Specification
**Smart India Hackathon 2026 · Problem Statement SIH26263**
**Owner:** Naman (M2) — Validation & AI/ML Lead

---

## 🚀 Overview of Naman's Responsibilities

As defined in the Team Bible and team task breakdown, Naman owns **Requirement 3 (Automated Validation and Anomaly Detection)**, along with supporting the USP pieces (unconfirmed rate risk component and disputed cases in the review queue).

### Complete Task Checklist & Directory Mapping

| Task | Description | Location in Codebase |
|---|---|---|
| **1. APAAR Validation** | Format checking, 12-digit numeric length, Verhoeff checksum algorithm, and adapter lookup | `backend/app/validation/apaar/`<br>`backend/app/validation/rules/r01_missing_apaar.py`<br>`backend/app/validation/rules/r02_invalid_apaar.py`<br>`backend/app/validation/rules/r03_apaar_lookup.py` |
| **2. Duplicate Detection** | Within-file duplicates and within-institution database duplicate indexing | `backend/app/validation/duplicates/`<br>`backend/app/validation/rules/r04_file_duplicates.py`<br>`backend/app/validation/rules/r05_inst_duplicates.py` |
| **3. Intake/Seat Validation** | Approved intake limits, 90% warning and 100%+ critical blocks, special quota caps | `backend/app/validation/seat_intake/`<br>`backend/app/validation/rules/r07_over_intake.py`<br>`backend/app/validation/rules/r08_category_limits.py` |
| **4. Data Consistency Checks** | Cross-field logic (FN vs domestic category, age plausibility, academic year vs date) | `backend/app/validation/consistency/`<br>`backend/app/validation/rules/r09_consistency.py` |
| **5. Cross-Institution Clashes** | Cross-college concurrent full-time enrolment detection | `backend/app/validation/clashes/`<br>`backend/app/validation/rules/r06_cross_clash.py` |
| **6. Validation Issue System** | Severities (`BLOCK`, `CRITICAL`, `ERROR`, `WARN`, `FLAG`), failed-row CSV export | `backend/app/validation/issues/`<br>`backend/app/models/validation_issue.py`<br>`backend/app/schemas/validation.py` |
| **7. Anomaly Detection** | Institutional year-over-year admission shifts & outlier feature engineering | `backend/app/ai_ml/anomaly_detection/` |
| **8. Fuzzy Matching** | RapidFuzz token-set & Jaro-Winkler on Name + DOB + Parent Name similarity | `backend/app/ai_ml/fuzzy_matching/` (R10) |
| **9. Isolation Forest** | Scikit-learn unsupervised outlier model on institutional behavior | `backend/app/ai_ml/anomaly_detection/model.py` |
| **10. Risk Scoring** | Composite 0–100 score + explainable top 3 reasons | `backend/app/ai_ml/risk_scoring/` |
| **11. Review-Case Generation** | Automated routing of clashes and fuzzy duplicates to AICTE review queue | `backend/app/ai_ml/review_cases/` |

---

## 🖥️ Frontend Screens Owned by Naman

1. **Validation Report Screen** (`frontend/src/app/institution/validation-report/page.tsx`):
   - Color-coded error badges by severity (`BLOCK`, `CRITICAL`, `ERROR`, `WARN`, `FLAG`).
   - Summary cards displaying total, valid, failed, and blocking counts.
   - One-click button to download failed rows as a CSV file with error details.
   - Blocks or enables the "Proceed to Final Submission" button.

2. **AICTE Review Queue Screen** (`frontend/src/app/aicte/review-queue/page.tsx`):
   - List of pending dual enrolments (clashes) and fuzzy duplicates.
   - Side-by-side comparison view of candidate records.
   - Decision buttons (Approve Valid Enrolment / Reject & Flag Conflicting Record) with officer notes feeding the hash-chain audit trail.

3. **AICTE Risk Score Profiler** (`frontend/src/app/aicte/risk-score/page.tsx`):
   - Gauge showing 0–100 score and risk tier (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
   - Top 3 explainable drivers card with plain-language rationale.
   - Interactive progress bars showing the weighted contribution of each factor.

---

## 🎬 36-Hour Hackathon Demo Alignment

Naman's validation & ML pipeline directly drives **Steps 1, 2, 4, 5, and 6** of the Grand Finale demo script:

- **Demo Step 1 & 2 (Planted Errors Catch):**
  - Upload `data/samples/planted_errors_demo.csv`.
  - The Validation Engine instantly catches missing APAAR (R01), invalid length (R02), duplicate in file (R04), and FN category breach (R09).
  - Show the color-coded report and trigger one-click failed-row CSV export.

- **Demo Step 4 (Cross-Institution Clash Alert):**
  - Student tries to confirm a second full-time seat or college uploads a duplicate student active at another college.
  - Rule R06 fires immediately with severity `CRITICAL` and sends the pair into the Review Queue.

- **Demo Step 5 & 6 (AICTE Risk Dashboard & Review Queue):**
  - Show the institution's 0–100 risk score and the explainable top 3 drivers.
  - Open the AICTE review queue, compare the conflicting records side-by-side, and approve/reject with audit logging.
