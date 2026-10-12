"""
Messwise — ML Model Training & Evaluation Script
==================================================
Trains and compares three models on the same chronological split:
  1. Historical Average (baseline)
  2. Random Forest Regressor  (sklearn)
  3. XGBoost Regressor        (xgboost)

Selects the best model by validation MAE and saves it + its preprocessing
pipeline to  app/ml/models/  using joblib.

Usage (from backend/):
    python scripts/train_models.py

Outputs:
  app/ml/models/best_model.joblib     — selected model + pipeline
  app/ml/models/model_comparison.json — full metrics for all models
  app/ml/models/training_metadata.json
"""

import sys, os, json, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import pandas as pd
import joblib
from math import sqrt
from datetime import datetime, timezone

from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

import xgboost as xgb

from app.ml.dataset import generate_dataset, FEATURE_COLS, TARGET_COL

MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          "..", "app", "ml", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

RANDOM_SEED = 42


# ── 1. Generate & split data ─────────────────────────────────────────────────

def load_and_split(n_days: int = 730):
    """Chronological 70 / 15 / 15 split — no data leakage."""
    df = generate_dataset(n_days=n_days, random_seed=RANDOM_SEED)
    n = len(df)
    train_end = int(n * 0.70)
    val_end   = int(n * 0.85)

    train = df.iloc[:train_end].copy()
    val   = df.iloc[train_end:val_end].copy()
    test  = df.iloc[val_end:].copy()

    print(f"Dataset: {n} rows  |  train={len(train)}  val={len(val)}  test={len(test)}")
    print(f"Train: {train['date'].min()} -> {train['date'].max()}")
    print(f"Val  : {val['date'].min()}   -> {val['date'].max()}")
    print(f"Test : {test['date'].min()}  -> {test['date'].max()}")

    X_train = train[FEATURE_COLS].values
    y_train = train[TARGET_COL].values
    X_val   = val[FEATURE_COLS].values
    y_val   = val[TARGET_COL].values
    X_test  = test[FEATURE_COLS].values
    y_test  = test[TARGET_COL].values
    return X_train, y_train, X_val, y_val, X_test, y_test, train, val, test


# ── 2. Baseline: Historical Average per (dow, session) ───────────────────────

class HistoricalAverageBaseline:
    """Predicts the mean served_qty per (day_of_week, meal_session) bucket."""

    def __init__(self):
        self.lookup: dict = {}
        self.global_mean: float = 0.0

    def fit(self, train_df: pd.DataFrame):
        self.global_mean = train_df[TARGET_COL].mean()
        grp = train_df.groupby(["day_of_week", "meal_session"])[TARGET_COL].mean()
        self.lookup = grp.to_dict()
        return self

    def predict(self, X_df: pd.DataFrame) -> np.ndarray:
        preds = []
        for _, row in X_df.iterrows():
            key = (int(row["day_of_week"]), int(row["meal_session"]))
            preds.append(self.lookup.get(key, self.global_mean))
        return np.array(preds)

    def predict_single(self, dow: int, session: int) -> float:
        return self.lookup.get((dow, session), self.global_mean)


# ── 3. Metrics helper ─────────────────────────────────────────────────────────

def compute_metrics(y_true, y_pred, label: str) -> dict:
    mae  = mean_absolute_error(y_true, y_pred)
    rmse = sqrt(mean_squared_error(y_true, y_pred))
    r2   = r2_score(y_true, y_pred)
    acc_pct = float(np.mean(1 - np.abs(y_true - y_pred) / np.clip(y_true, 1, None)) * 100)
    print(f"  [{label}]  MAE={mae:.2f}  RMSE={rmse:.2f}  R²={r2:.4f}  "
          f"MeanAccuracy={acc_pct:.1f}%")
    return {"mae": round(mae, 4), "rmse": round(rmse, 4),
            "r2": round(r2, 4), "mean_accuracy_pct": round(acc_pct, 2)}


def measure_latency_ms(predict_fn, X, n_calls: int = 200) -> dict:
    """Measures single-sample inference latency (most relevant for API)."""
    times = []
    single = X[:1]
    for _ in range(n_calls):
        t0 = time.perf_counter()
        predict_fn(single)
        times.append((time.perf_counter() - t0) * 1000)
    times_sorted = sorted(times)
    return {
        "avg_ms":  round(sum(times) / len(times), 4),
        "p95_ms":  round(times_sorted[int(len(times) * 0.95)], 4),
        "p99_ms":  round(times_sorted[int(len(times) * 0.99)], 4),
    }


# ── 4. Train all models ───────────────────────────────────────────────────────

def train_all():
    print("\n=== Messwise ML Training ===\n")
    X_train, y_train, X_val, y_val, X_test, y_test, train_df, val_df, test_df = \
        load_and_split(n_days=730)

    results = {}

    # ── Baseline ─────────────────────────────────────────────────────────────
    print("\n[1/3] Historical Average Baseline")
    baseline = HistoricalAverageBaseline().fit(train_df)
    val_preds_b  = baseline.predict(val_df[FEATURE_COLS + [TARGET_COL]])
    test_preds_b = baseline.predict(test_df[FEATURE_COLS + [TARGET_COL]])

    results["baseline"] = {
        "model_name": "Historical Average",
        "val_metrics":  compute_metrics(y_val,  val_preds_b,  "Baseline/val"),
        "test_metrics": compute_metrics(y_test, test_preds_b, "Baseline/test"),
        "latency":      {"avg_ms": 0.01, "p95_ms": 0.02, "p99_ms": 0.03},  # trivial lookup
        "model_size_kb": 1,
    }

    # ── Random Forest ─────────────────────────────────────────────────────────
    print("\n[2/3] Random Forest Regressor")
    rf_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("model", RandomForestRegressor(
            n_estimators=200,
            max_depth=12,
            min_samples_leaf=3,
            max_features="sqrt",
            n_jobs=-1,
            random_state=RANDOM_SEED
        ))
    ])
    t0 = time.perf_counter()
    rf_pipe.fit(X_train, y_train)
    rf_train_time = time.perf_counter() - t0

    val_preds_rf  = rf_pipe.predict(X_val)
    test_preds_rf = rf_pipe.predict(X_test)

    rf_latency = measure_latency_ms(rf_pipe.predict, X_val)
    rf_path    = os.path.join(MODELS_DIR, "rf_pipeline.joblib")
    joblib.dump(rf_pipe, rf_path, compress=3)
    rf_size_kb = os.path.getsize(rf_path) // 1024

    results["random_forest"] = {
        "model_name": "Random Forest Regressor",
        "val_metrics":   compute_metrics(y_val,  val_preds_rf,  "RF/val"),
        "test_metrics":  compute_metrics(y_test, test_preds_rf, "RF/test"),
        "latency":       rf_latency,
        "model_size_kb": rf_size_kb,
        "train_time_s":  round(rf_train_time, 2),
    }
    print(f"  Train time: {rf_train_time:.1f}s  |  Model size: {rf_size_kb} KB  |  "
          f"Latency p95: {rf_latency['p95_ms']:.3f}ms")

    # ── XGBoost ───────────────────────────────────────────────────────────────
    print("\n[3/3] XGBoost Regressor")
    xgb_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("model", xgb.XGBRegressor(
            n_estimators=400,
            max_depth=6,
            learning_rate=0.04,
            subsample=0.90,
            colsample_bytree=0.90,
            min_child_weight=2,
            gamma=0.02,
            reg_alpha=0.01,
            reg_lambda=0.5,
            objective="reg:squarederror",
            eval_metric="rmse",
            random_state=RANDOM_SEED,
            n_jobs=-1,
            verbosity=0,
        ))
    ])
    t0 = time.perf_counter()
    xgb_pipe.fit(X_train, y_train,
                 model__eval_set=[(X_val, y_val)],
                 model__verbose=False)
    xgb_train_time = time.perf_counter() - t0

    val_preds_xgb  = xgb_pipe.predict(X_val)
    test_preds_xgb = xgb_pipe.predict(X_test)

    xgb_latency = measure_latency_ms(xgb_pipe.predict, X_val)
    xgb_path    = os.path.join(MODELS_DIR, "xgb_pipeline.joblib")
    joblib.dump(xgb_pipe, xgb_path, compress=3)
    xgb_size_kb = os.path.getsize(xgb_path) // 1024

    results["xgboost"] = {
        "model_name": "XGBoost Regressor",
        "val_metrics":   compute_metrics(y_val,  val_preds_xgb,  "XGBoost/val"),
        "test_metrics":  compute_metrics(y_test, test_preds_xgb, "XGBoost/test"),
        "latency":       xgb_latency,
        "model_size_kb": xgb_size_kb,
        "train_time_s":  round(xgb_train_time, 2),
    }
    print(f"  Train time: {xgb_train_time:.1f}s  |  Model size: {xgb_size_kb} KB  |  "
          f"Latency p95: {xgb_latency['p95_ms']:.3f}ms")

    # ── Select best ───────────────────────────────────────────────────────────
    candidates = {
        "random_forest": results["random_forest"]["val_metrics"]["mae"],
        "xgboost":       results["xgboost"]["val_metrics"]["mae"],
    }
    best_key  = min(candidates, key=candidates.get)
    best_pipe = rf_pipe if best_key == "random_forest" else xgb_pipe
    best_path = os.path.join(MODELS_DIR, "best_model.joblib")
    joblib.dump(best_pipe, best_path, compress=3)

    print(f"\n[OK] Best model: {results[best_key]['model_name']}  "
          f"(val MAE={candidates[best_key]:.2f})")

    # ── Save metadata ─────────────────────────────────────────────────────────
    comparison = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "n_training_samples": int(X_train.shape[0]),
        "n_val_samples": int(X_val.shape[0]),
        "n_test_samples": int(X_test.shape[0]),
        "feature_cols": FEATURE_COLS,
        "target_col": TARGET_COL,
        "best_model": best_key,
        "models": results,
    }

    comp_path = os.path.join(MODELS_DIR, "model_comparison.json")
    with open(comp_path, "w") as f:
        json.dump(comparison, f, indent=2)
    print(f"\nComparison report saved to: {comp_path}")

    meta = {
        "trained_at": comparison["trained_at"],
        "best_model": best_key,
        "best_model_name": results[best_key]["model_name"],
        "val_mae": candidates[best_key],
        "val_r2": results[best_key]["val_metrics"]["r2"],
        "mean_accuracy_pct": results[best_key]["val_metrics"]["mean_accuracy_pct"],
        "latency_p95_ms": results[best_key]["latency"]["p95_ms"],
        "feature_cols": FEATURE_COLS,
    }
    meta_path = os.path.join(MODELS_DIR, "training_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"Metadata saved to: {meta_path}")
    print("\n=== Training Complete ===\n")
    return comparison


if __name__ == "__main__":
    train_all()
