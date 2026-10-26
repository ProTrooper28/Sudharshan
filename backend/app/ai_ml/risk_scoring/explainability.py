class RiskExplainabilityEngine:
    """
    Translates raw statistical metrics into clear human-readable explanations for AICTE officers.
    """
    def explain_rule_violations(self, rate: float) -> str:
        pct = round(rate * 100, 1)
        if rate > 0.2:
            return f"High validation failure rate ({pct}% of rows triggered errors or blocks)."
        elif rate > 0.05:
            return f"Moderate rule breaches detected ({pct}% of rows failed validation)."
        return f"Normal validation compliance ({pct}% failure rate)."

    def explain_anomaly(self, score: float) -> str:
        if score > 0.7:
            return "Severe statistical divergence from regional peers (abnormal NRI jump / admission surge)."
        elif score > 0.4:
            return "Noticeable variance in admissions patterns compared to historical baseline."
        return "Admissions distribution matches standard historical profile."

    def explain_unconfirmed(self, rate: float) -> str:
        pct = round(rate * 100, 1)
        if rate > 0.4:
            return f"Low student confirmation ({pct}% of enrolments unconfirmed/disputed — potential ghost students)."
        elif rate > 0.2:
            return f"{pct}% of students have not confirmed their enrolment via OTP."
        return f"Healthy confirmation rate ({100 - pct}% confirmed)."

    def explain_intake(self, pressure: float) -> str:
        pct = round(pressure * 100, 1)
        if pressure >= 1.0:
            return f"Exceeded approved intake capacity (enrolment at {pct}% of limit)."
        elif pressure >= 0.95:
            return f"Intake capacity hugging alert (admissions at {pct}% of approved seats)."
        return f"Capacity utilization at {pct}%."

    def explain_edits(self, rate: float) -> str:
        pct = round(rate * 100, 1)
        if rate > 0.15:
            return f"Suspiciously high post-submission edits ({pct}% altered after batch locking)."
        elif rate > 0.05:
            return f"Post-submission modifications detected on {pct}% of records."
        return "Minimal post-submission alterations."
