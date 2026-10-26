from typing import Dict, Any, List, Optional
import math

try:
    import numpy as np
    from sklearn.ensemble import IsolationForest
    SKLEARN_AVAILABLE = True
except ImportError:
    np = None
    IsolationForest = None
    SKLEARN_AVAILABLE = False

from backend.app.ai_ml.anomaly_detection.features import AnomalyFeatureExtractor


class InstitutionalAnomalyDetector:
    """
    Isolation Forest that flags institutions with unusual admission patterns:
    - sudden jump in NRI admissions
    - enrolment hugging the intake limit
    - high post-submission edits
    - low student-confirmation rate

    Output of compute_anomaly_score(): 0.0 (looks normal) -> 1.0 (very unusual).

    HOW THE SCORE IS CALIBRATED (this fixes the old "everything is ~0.9" bug):
    Isolation Forest's raw score_samples() is a negative number, roughly
    -0.4 (very normal) down to -0.8 (very unusual). The old code pushed that
    through a sigmoid, which squashed everything to ~0.9.
    Now we measure the raw scores of the TRAINING data once and build a ruler:
        raw at the median training point  -> anomaly 0.0
        raw at (median - 3 * spread)      -> anomaly 1.0
    where spread = median - 5th percentile of training scores.
    Everything in between is scaled linearly, so scores actually separate.
    """

    def __init__(self, contamination: float = 0.05, n_estimators: int = 200, random_state: int = 42):
        self.extractor = AnomalyFeatureExtractor()
        self.random_state = random_state
        self.is_fitted = False
        self._ref_normal: Optional[float] = None   # raw score that maps to 0.0
        self._ref_extreme: Optional[float] = None  # raw score that maps to 1.0
        if SKLEARN_AVAILABLE:
            self.model = IsolationForest(
                n_estimators=n_estimators,
                contamination=contamination,
                random_state=random_state,
            )
        else:
            self.model = None

    def fit_synthetic_baseline(self, synthetic_history: Optional[List[Dict[str, Any]]] = None):
        """
        Train on a baseline of "normal" institutions.
        - Pass synthetic_history (list of metric dicts) to train on your own data.
        - With nothing passed, 300 random normal-looking institutions are generated.
        """
        if SKLEARN_AVAILABLE and self.model is not None:
            if synthetic_history:
                X = self.extractor.extract_batch_features(synthetic_history)
            else:
                rng = np.random.default_rng(self.random_state)  # local rng: no global side effects
                n = 300
                X = np.column_stack([
                    rng.beta(2, 20, n),            # nri_ratio        (mostly 0-0.2)
                    rng.beta(5, 2, n) * 0.95,      # intake_hugging   (mostly 0.6-0.95)
                    rng.exponential(0.02, n),      # edit_rate        (mostly < 0.05)
                    rng.beta(2, 10, n),            # unconfirmed_rate (mostly 0-0.3)
                ])
            self.model.fit(X)

            # Build the calibration ruler from the training data's own scores
            raw = self.model.score_samples(X)
            median = float(np.median(raw))
            p5 = float(np.percentile(raw, 5))
            spread = max(median - p5, 1e-6)
            self._ref_normal = median
            self._ref_extreme = median - 3.0 * spread
        self.is_fitted = True

    def compute_anomaly_score(self, metrics: Dict[str, Any]) -> float:
        """Return 0.0 (normal) to 1.0 (highly anomalous)."""
        if not self.is_fitted:
            self.fit_synthetic_baseline()

        if SKLEARN_AVAILABLE and self.model is not None:
            X = self.extractor.extract_features(metrics)
            if hasattr(X, "reshape"):
                X = X.reshape(1, -1)
            raw_score = float(self.model.score_samples(X)[0])
            span = self._ref_normal - self._ref_extreme
            normalized = (self._ref_normal - raw_score) / span
            return round(min(1.0, max(0.0, normalized)), 4)

        # Fallback when scikit-learn is missing: weighted distance from "normal" means
        feats = self.extractor.extract_features(metrics)
        normal = [0.08, 0.75, 0.02, 0.15]
        weights = [1.5, 1.2, 1.0, 1.2]
        dist = math.sqrt(sum(w * (f - n) ** 2 for f, n, w in zip(feats, normal, weights)))
        return round(min(1.0, max(0.0, dist / 0.9)), 4)