"""
Messwise — Trained ML Demand Prediction Engine
===============================================
Loads the best trained model (XGBoost or Random Forest) once at startup.
Exposes a predict() method with the SAME signature and return schema as the
original MealDemandForecastEngine so no API contracts need changing.

Falls back gracefully to the original rule engine if the model file is absent
(i.e., train_models.py has not been run yet).

Feature vector order MUST match FEATURE_COLS in dataset.py:
    day_of_week, is_weekend, meal_session, base_capacity,
    rsvp_count, optout_count, turnout_ratio,
    exam_season, holiday_factor, weather_code,
    prev_day_served, prev_waste_kg
"""

import os
import json
import logging
import time
from typing import Dict, Any, Optional

import numpy as np

logger = logging.getLogger(__name__)

_MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
_MODEL_PATH  = os.path.join(_MODELS_DIR, "best_model.joblib")
_META_PATH   = os.path.join(_MODELS_DIR, "training_metadata.json")

# Session name → integer encoding (matches dataset.py)
SESSION_ENC = {"breakfast": 0, "lunch": 1, "dinner": 2}
# Weather string → integer encoding
WEATHER_ENC = {"clear": 0, "heavy_rain": 1, "extreme_heat": 2}
# Day-of-week integer → name (for insights)
DOW_NAMES   = ["Monday", "Tuesday", "Wednesday", "Thursday",
               "Friday", "Saturday", "Sunday"]


class TrainedMealDemandEngine:
    """
    Drop-in replacement for MealDemandForecastEngine that uses a real
    scikit-learn Pipeline (StandardScaler + XGBoost/RF) for inference.
    """

    def __init__(self):
        self._pipeline  = None          # loaded sklearn Pipeline
        self._metadata  = {}            # training_metadata.json contents
        self._available = False         # True only when model loaded OK
        self._load_model()

    def _load_model(self):
        """Load model once — called at module import time."""
        if not os.path.exists(_MODEL_PATH):
            logger.warning(
                "No trained model found at %s. "
                "Run: python scripts/train_models.py  "
                "Falling back to rule-based engine.",
                _MODEL_PATH
            )
            return

        try:
            import joblib
            self._pipeline = joblib.load(_MODEL_PATH)
            if os.path.exists(_META_PATH):
                with open(_META_PATH) as f:
                    self._metadata = json.load(f)
            self._available = True
            logger.info(
                "ML model loaded: %s  (val MAE=%.2f, accuracy=%.1f%%)",
                self._metadata.get("best_model_name", "unknown"),
                self._metadata.get("val_mae", 0),
                self._metadata.get("mean_accuracy_pct", 0),
            )
        except Exception as exc:
            logger.error("Failed to load ML model: %s", exc)
            self._available = False

    # ── Public API (same signature as MealDemandForecastEngine.predict) ──────

    def predict(
        self,
        base_capacity: int = 650,
        day_of_week: str = "wed",
        meal_session: str = "Lunch",
        turnout_ratio: float = 0.92,
        exam_season: bool = False,
        holiday_factor: bool = False,
        weather: str = "clear",
        active_rsvps: int = 598,
        # Extended context (used when available from DB)
        prev_day_served: Optional[int] = None,
        prev_waste_kg: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Predict meal demand using the trained ML model.
        Returns the same dict shape as MealDemandForecastEngine.predict().
        """
        if not self._available:
            # Graceful fallback to rule engine
            from app.ml.forecast_engine import forecast_engine as _rule_engine
            return _rule_engine.predict(
                base_capacity=base_capacity,
                day_of_week=day_of_week,
                meal_session=meal_session,
                turnout_ratio=turnout_ratio,
                exam_season=exam_season,
                holiday_factor=holiday_factor,
                weather=weather,
                active_rsvps=active_rsvps,
            )

        # ── Build feature vector ───────────────────────────────────────────
        dow_key = day_of_week.lower()[:3]
        DOW3_MAP = {
            "mon": 0, "tue": 1, "wed": 2, "thu": 3,
            "fri": 4, "sat": 5, "sun": 6,
        }
        dow_int    = DOW3_MAP.get(dow_key, 2)
        is_weekend = 1 if dow_int >= 5 else 0

        sess_key = meal_session.lower()
        sess_int = SESSION_ENC.get(sess_key, 1)

        weather_int = WEATHER_ENC.get(weather.lower(), 0)

        rsvp_count  = int(active_rsvps)
        optout_est  = max(0, int(base_capacity * 0.03))
        t_ratio     = rsvp_count / max(1, base_capacity)

        # Use defaults when real prev-day values not supplied
        prev_served = int(prev_day_served) if prev_day_served is not None \
                      else int(base_capacity * 0.88)
        prev_waste  = float(prev_waste_kg) if prev_waste_kg is not None else 8.0

        features = np.array([[
            dow_int, is_weekend, sess_int,
            base_capacity, rsvp_count, optout_est, t_ratio,
            int(exam_season), int(holiday_factor), weather_int,
            prev_served, prev_waste,
        ]], dtype=float)

        # ── Inference ─────────────────────────────────────────────────────
        t0 = time.perf_counter()
        raw_pred = float(self._pipeline.predict(features)[0])
        latency_ms = (time.perf_counter() - t0) * 1000

        # Clamp to valid range
        expected_demand  = int(np.clip(round(raw_pred), 50, base_capacity + 50))
        buffer_pct       = 2.6
        recommended_cook = int(round(expected_demand * 1.026))
        buffer_portions  = recommended_cook - expected_demand

        # Waste risk
        if holiday_factor:
            waste_risk = "High"
        elif expected_demand < base_capacity * 0.75:
            waste_risk = "Moderate"
        else:
            waste_risk = "Low"

        confidence = self._metadata.get("mean_accuracy_pct", 91.5)

        model_name = self._metadata.get("best_model_name", "ML Model")
        insights = [
            f"ML Model ({model_name}) predicted demand of {expected_demand} portions.",
            f"Trained on {self._metadata.get('n_training_samples', '—')} historical meal records.",
            f"Model accuracy: {confidence:.1f}% | Inference: {latency_ms:.2f}ms",
            f"Safe Buffer: +{buffer_portions} portions added to prevent meal shortfalls.",
        ]

        return {
            "expected_demand":      expected_demand,
            "recommended_cook":     recommended_cook,
            "buffer_margin_percent": buffer_pct,
            "waste_risk":           waste_risk,
            "confidence_percent":   round(confidence, 1),
            "insights":             insights,
            # Extended fields (not in legacy schema — ignored by old callers)
            "_ml_latency_ms":       round(latency_ms, 3),
            "_model_name":          model_name,
        }

    def is_available(self) -> bool:
        return self._available

    def get_metadata(self) -> Dict[str, Any]:
        return dict(self._metadata)


# Module-level singleton — loaded once at startup
trained_engine = TrainedMealDemandEngine()
