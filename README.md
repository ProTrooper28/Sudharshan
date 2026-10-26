# Sudarshan — APAAR-based Student Data Management & Verification System
**Smart India Hackathon 2026 · Problem Statement SIH26263 (AICTE)**

> *"Today AICTE trusts the institution's word. We make it a handshake between the institution and the student, enforced in real time."*

---

## 🧭 Repository Structure

```
sudarshan/
├── backend/
│   ├── app/
│   │   ├── api/v1/                   # FastAPI endpoints (validation, batches, risk, review-cases)
│   │   ├── core/                     # Database, configuration, logging
│   │   ├── models/                   # SQLAlchemy database models
│   │   ├── schemas/                  # Pydantic schemas & DTOs
│   │   │
│   │   ├── validation/               # ⚡ NAMAN'S DOMAIN: Validation Engine (Deterministic)
│   │   │   ├── apaar/                # APAAR ID verification & check-digit logic
│   │   │   ├── duplicates/           # Duplicate detection (in-file & intra-institution)
│   │   │   ├── seat_intake/          # Over-intake & category caps (supernumerary, NRI, OCI, FN)
│   │   │   ├── consistency/          # Data consistency & cross-field rules
│   │   │   ├── clashes/              # Cross-institution clash detection
│   │   │   ├── issues/               # Issue aggregation, severities & export
│   │   │   ├── rules/                # Concrete Rules R01 to R11
│   │   │   └── engine.py             # Validation Pipeline Orchestrator
│   │   │
│   │   ├── ai_ml/                    # 🤖 NAMAN'S DOMAIN: AI / Machine Learning Engine
│   │   │   ├── fuzzy_matching/       # RapidFuzz similarity on Name + DOB + Parent Name (R10)
│   │   │   ├── anomaly_detection/    # scikit-learn Isolation Forest (unusual institution patterns)
│   │   │   ├── risk_scoring/         # 0-100 Institution Risk Score & top explainable factors
│   │   │   ├── review_cases/         # Automated dispatch to AICTE / Institution Review Queue
│   │   │   └── saved_models/         # Serialized model artifacts (.joblib)
│   │   │
│   │   ├── adapters/                 # Mock APAAR Provider & SMS/OTP adapters
│   │   └── workers/                  # Celery async tasks for batch processing
│   │
│   ├── tests/                        # Pytest suite for Rules, ML, and Review Cases
│   │   └── fixtures/                 # Planted demo CSVs and synthetic datasets
│   └── requirements.txt
│
├── frontend/                         # Next.js 14 + TypeScript + Tailwind
│   └── src/
│       ├── app/
│       │   ├── institution/validation-report/   # M2 Screen: Color-coded issues & failed-row export
│       │   └── aicte/
│       │       ├── review-queue/                # M2 Screen: Side-by-side duplicate comparison
│       │       └── risk-score/                  # M2 Screen: Risk gauge & factor breakdown
│       └── components/                          # UI components (validation, review, risk)
│
├── docs/                             # Complete Architecture & Validation Engine Specs
│   ├── VALIDATION_AND_AIML_SPEC.md
│   ├── RULES_R01_R11.md
│   └── RISK_SCORING_FORMULA.md
└── data/samples/                     # Sample CSV templates and planted errors test data
```

---

## 🎯 Member 2 (Naman) Ownership: Validation + AI/ML

| Module | Core Responsibility | Implemented In |
|---|---|---|
| **APAAR Validation** | Format test, Verhoeff/Luhn checksum, ApaarProvider status | `backend/app/validation/apaar/` (R01–R03) |
| **Duplicate Detection** | Within-file duplicates and within-institution clashes | `backend/app/validation/duplicates/` (R04–R05) |
| **Intake/Seat Validation** | Approved intake limits, 90% & 100% alerts, category caps | `backend/app/validation/seat_intake/` (R07–R08) |
| **Data Consistency** | Cross-field logic (FN vs Aadhaar, age plausibility, dates) | `backend/app/validation/consistency/` (R09) |
| **Cross-Institution Clashes** | Cross-college dual full-time enrolment detection | `backend/app/validation/clashes/` (R06) |
| **Validation Issue System** | Severities (BLOCK, ERROR, CRITICAL, WARN, FLAG), export | `backend/app/validation/issues/` |
| **Anomaly Detection** | Institutional year-over-year shifts | `backend/app/ai_ml/anomaly_detection/` |
| **Fuzzy Matching** | Token-set & Jaro-Winkler for missing/mistyped IDs | `backend/app/ai_ml/fuzzy_matching/` (R10) |
| **Isolation Forest** | Scikit-learn unsupervised outlier model | `backend/app/ai_ml/anomaly_detection/model.py` |
| **Risk Scoring** | Composite 0–100 score + explainable top 3 reasons | `backend/app/ai_ml/risk_scoring/` |
| **Review-Case Generation** | Automated creation of review queue cases | `backend/app/ai_ml/review_cases/` |

---

## 🚀 Quickstart

### 1. Install Backend Dependencies
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Run Tests
```bash
# from project root (sudarshan/)
pytest backend/tests/ -v
```

### 3. Run the Backend Server
```bash
cd /path/to/sudarshan          # project root
source backend/.venv/bin/activate
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```
API docs will be at **http://localhost:8000/api/v1/docs**

### 4. Verify the Full System (CI / Demo)
```bash
python3 verify_system.py       # from project root — auto-detects venv
```
Runs all 3 stages: unit tests → E2E planted-error validation (21/21 caught) → ML + risk scoring.

### 5. Regenerate Demo Data
```bash
python3 data/samples/generate_demo_data.py
```
Writes fresh `demo_students.csv`, `demo_context.json`, and `planted_errors_key.csv` under `data/samples/`.
