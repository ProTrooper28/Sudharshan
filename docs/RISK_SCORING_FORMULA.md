# Institution Risk Scoring Formula
**Smart India Hackathon 2026 · Problem Statement SIH26263**
**Owner:** Naman (M2 — Validation + AI/ML)

---

## 📐 Mathematical Formulation

The Per-Institution Risk Score is a continuous value between **0.0 and 100.0** calculated for every institution per academic session:

$$\text{Risk Score} = 100 \times \left( 0.35 \cdot R_{\text{violations}} + 0.25 \cdot A_{\text{anomaly}} + 0.20 \cdot U_{\text{unconfirmed}} + 0.10 \cdot P_{\text{intake}} + 0.10 \cdot E_{\text{edits}} \right)$$

All inputs are strictly normalized into the range $[0.0, 1.0]$.

---

## 📊 Component Breakdown & Weights

| Component | Symbol | Weight | Normalization / Formula |
|---|---|---|---|
| **Rule Violation Rate** | $R_{\text{violations}}$ | **0.35 (35%)** | $\min\left(1.0, \frac{\text{Failed Rows}}{\text{Total Rows}}\right)$ |
| **Statistical Anomaly** | $A_{\text{anomaly}}$ | **0.25 (25%)** | Output of `IsolationForest` model on institutional features |
| **Unconfirmed Student Rate** | $U_{\text{unconfirmed}}$ | **0.20 (20%)** | $1.0 - \frac{\text{Confirmed Students}}{\text{Total Enrolled Students}}$ |
| **Intake Capacity Pressure** | $P_{\text{intake}}$ | **0.10 (10%)** | $\min\left(1.0, \frac{\text{Total Admitted}}{\text{Approved Intake}}\right)$ |
| **Post-Submission Edits** | $E_{\text{edits}}$ | **0.10 (10%)** | $\min\left(1.0, \frac{\text{Edited Records}}{\text{Total Records}}\right)$ |

---

## 🎯 Explainability Principle

Judges and AICTE officers do not accept black-box scores. Every computed risk score dynamically surfaces its **Top 3 Contributing Factors** with clear human-readable rationale:

1. **Intake Hugging:** "Enrolment at 98.5% of approved intake capacity across 3 consecutive sessions."
2. **Low Confirmation Rate:** "42% of enrolled students have not confirmed enrolment via OTP (risk of ghost admissions)."
3. **Statistical Anomaly:** "Sudden 340% YoY surge in NRI/Supernumerary quota admissions compared to regional peer baseline."
