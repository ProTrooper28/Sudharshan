# Rules Specification (R01 – R11)
**Smart India Hackathon 2026 · Problem Statement SIH26263**
**Owner:** Naman (M2 — Validation + AI/ML)

---

## 📋 Rule Overview & Severity Hierarchy

| Severity | Meaning | Action Taken |
|---|---|---|
| **BLOCK** | Critical integrity failure (e.g. missing APAAR ID, duplicate in file) | Rejects batch processing; cannot be submitted until fixed |
| **CRITICAL** | Severe institutional violation (e.g. cross-institution clash, over-intake) | Prevents batch finalization; dispatches to Review Queue |
| **ERROR** | Category cap breach, missing justification, field contradiction | Flags student row; cannot be certified until resolved |
| **WARN** | High probability anomaly (fuzzy duplicate candidate, age divergence) | Generates review candidate; permits inspection |
| **FLAG** | Post-submission tamper detected (hash mismatch) | Flags record as "modified"; notifies AICTE audit chain |

---

## 🔍 Detailed Rules

### R01: Missing APAAR ID
- **Severity:** `BLOCK`
- **Logic:** Row has empty, null, or whitespace APAAR ID.
- **Trigger:** `not apaar_id or str(apaar_id).strip() == ""`
- **Message:** `"Row {idx}: APAAR ID is missing or empty. Mandatory for student registration."`

### R02: Invalid APAAR Format / Checksum
- **Severity:** `BLOCK`
- **Logic:** Must be 12 numeric digits and satisfy Verhoeff check-digit algorithm.
- **Trigger:** Length != 12, non-numeric, or Verhoeff checksum failure.
- **Message:** `"Row {idx}: APAAR ID '{apaar}' must be exactly 12 numeric digits with valid checksum."`

### R03: APAAR Not Found or Inactive
- **Severity:** `BLOCK`
- **Logic:** Lookup against mock `ApaarProvider` adapter returns inactive/suspended or not found.
- **Trigger:** `adapter.lookup(apaar).active == False`
- **Message:** `"Row {idx}: APAAR ID '{apaar}' not found or suspended in national registry."`

### R04: Duplicate Within File
- **Severity:** `BLOCK`
- **Logic:** `(apaar_id, programme, academic_year)` occurs > 1 time in uploaded file.
- **Trigger:** Multiple occurrences within same CSV/batch payload.
- **Message:** `"Row {idx}: Duplicate record in file. APAAR '{apaar}' appears multiple times."`

### R05: Duplicate Within Institution
- **Severity:** `ERROR`
- **Logic:** APAAR already has an active full-time enrolment record in the database for the same institution & year.
- **Trigger:** Existing database match for `(apaar_id, inst_id, academic_year)` with active status.
- **Message:** `"Row {idx}: Student '{apaar}' already enrolled in this institution for {year}."`

### R06: Cross-Institution Clash
- **Severity:** `CRITICAL`
- **Logic:** APAAR is active full-time at another institution with overlapping academic tenure.
- **Trigger:** Existing active enrolment found at `other_inst_id` for current `academic_year`.
- **Action:** Triggers alert to both institutions, blocks auto-verification, dispatches to AICTE Review Queue.
- **Message:** `"Row {idx}: Dual enrolment conflict! Student active at '{other_inst_id}' in {programme}."`

### R07: Over-Intake Capacity
- **Severity:** `CRITICAL`
- **Logic:** Total regular admissions exceeds `seat_config.approved_intake`.
- **Thresholds:**
  - `90% capacity`: Emits `WARN` alert.
  - `> 100% capacity`: Emits `CRITICAL` violation block.
- **Message:** `"Row {idx}: Approved intake capacity ({approved}) exceeded for {programme}. Total: {total}."`

### R08: Category Limit Breach
- **Severity:** `ERROR`
- **Logic:** Supernumerary, NRI, OCI, or FN admissions exceed configured limits or lack justification document reference.
- **Message:** `"Row {idx}: {QUOTA} limit of {limit} seats breached or missing mandatory justification document."`

### R09: Field Inconsistency
- **Severity:** `ERROR` / `WARN`
- **Logic:**
  1. Foreign National student tagged with domestic Aadhaar / domestic reserved category (`ERROR`).
  2. Implausible age for higher-ed technical course (< 15 or > 65 years) (`WARN`).
  3. Admission date incompatible with academic year (`WARN`).
- **Message:** `"Row {idx}: Field inconsistency detected: {details}."`

### R10: Fuzzy Duplicate Candidate
- **Severity:** `WARN`
- **Logic:** RapidFuzz token-set & Jaro-Winkler similarity on `Name + Parent Name` with exact `DOB` match exceeds threshold (default 85%).
- **Action:** Dispatches candidate pair to AICTE Review Queue with side-by-side view.
- **Message:** `"Row {idx}: Suspected duplicate identity ({similarity}%). Matches '{existing_name}' (APAAR: {apaar})."`

### R11: Post-Submission Edit
- **Severity:** `FLAG`
- **Logic:** SHA-256 payload hash of batch does not match stored hash after status is `submitted` or `locked`.
- **Action:** Marks record as `modified = True`, flags audit chain.
- **Message:** `"Batch hash mismatch! Immutability violation flagged in audit log."`
