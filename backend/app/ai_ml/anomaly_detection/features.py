from typing import Dict, Any, List

try:
    import numpy as np
except ImportError:
    np = None

class AnomalyFeatureExtractor:
    """
    Extracts numerical feature vectors from institutional admission patterns:
    1. nri_jump_ratio: YoY surge in NRI/special category enrolment
    2. intake_hugging_ratio: Enrolment / Approved Intake (e.g. 0.99 or 1.0)
    3. post_submission_edit_rate: Ratio of rows edited post submission
    4. unconfirmed_student_rate: 1.0 - (confirmed_students / total_students)
    """
    def extract_features(self, institution_metrics: Dict[str, Any]):
        nri_ratio = float(institution_metrics.get("nri_ratio", 0.05))
        intake_hugging = float(institution_metrics.get("intake_hugging", 0.85))
        edit_rate = float(institution_metrics.get("edit_rate", 0.02))
        unconfirmed_rate = float(institution_metrics.get("unconfirmed_rate", 0.15))

        vals = [nri_ratio, intake_hugging, edit_rate, unconfirmed_rate]
        if np is not None:
            return np.array(vals, dtype=float)
        return vals

    def extract_batch_features(self, metrics_list: List[Dict[str, Any]]):
        feats = [self.extract_features(m) for m in metrics_list]
        if np is not None:
            return np.array(feats, dtype=float)
        return feats
