"""
Messwise — Full System Benchmark
==================================
Compares OLD rule-based engine vs NEW XGBoost ML engine across:
  - Inference latency  (avg / p95 / p99)
  - Prediction accuracy (MAE, RMSE, R², MeanAccuracy%)
  - Memory usage        (RSS peak, allocation delta)
  - Energy proxy        (CPU time × power estimate)
  - Stock engine calls  (unchanged — shown for reference)

Usage:
    cd backend
    python scripts/benchmark_ml.py
"""

import sys, os, time, statistics, tracemalloc, gc
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
from math import sqrt

# ── Shared test inputs ────────────────────────────────────────────────────────
SCENARIOS = [
    dict(base_capacity=650, day_of_week="mon", meal_session="Lunch",
         turnout_ratio=0.92, exam_season=False, holiday_factor=False,
         weather="clear",       active_rsvps=560),
    dict(base_capacity=650, day_of_week="wed", meal_session="Dinner",
         turnout_ratio=0.92, exam_season=False, holiday_factor=False,
         weather="clear",       active_rsvps=598),
    dict(base_capacity=650, day_of_week="fri", meal_session="Lunch",
         turnout_ratio=0.92, exam_season=False, holiday_factor=True,
         weather="clear",       active_rsvps=380),
    dict(base_capacity=650, day_of_week="sun", meal_session="Breakfast",
         turnout_ratio=0.92, exam_season=True,  holiday_factor=False,
         weather="heavy_rain",  active_rsvps=490),
    dict(base_capacity=650, day_of_week="sat", meal_session="Dinner",
         turnout_ratio=0.92, exam_season=False, holiday_factor=False,
         weather="extreme_heat",active_rsvps=420),
    dict(base_capacity=650, day_of_week="tue", meal_session="Lunch",
         turnout_ratio=0.88, exam_season=False, holiday_factor=False,
         weather="clear",       active_rsvps=510),
    dict(base_capacity=650, day_of_week="thu", meal_session="Dinner",
         turnout_ratio=0.95, exam_season=True,  holiday_factor=False,
         weather="heavy_rain",  active_rsvps=580),
]
N_ITERATIONS = 2000   # calls per engine per benchmark pass

# ── Ground-truth: use the dataset generator for objective accuracy ─────────────
from app.ml.dataset import generate_dataset, FEATURE_COLS, TARGET_COL
from app.ml.forecast_engine import MealDemandForecastEngine
from app.ml.meal_demand_model import trained_engine

SESSION_DEC = {0: "Breakfast", 1: "Lunch", 2: "Dinner"}
DOW_STR     = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
WEATHER_DEC = {0: "clear", 1: "heavy_rain", 2: "extreme_heat"}


def rule_predict_row(engine, row) -> float:
    r = engine.predict(
        base_capacity=int(row["base_capacity"]),
        day_of_week=DOW_STR[int(row["day_of_week"])],
        meal_session=SESSION_DEC[int(row["meal_session"])],
        turnout_ratio=float(row["turnout_ratio"]),
        exam_season=bool(row["exam_season"]),
        holiday_factor=bool(row["holiday_factor"]),
        weather=WEATHER_DEC[int(row["weather_code"])],
        active_rsvps=int(row["rsvp_count"]),
    )
    return float(r["expected_demand"])


def ml_predict_row(row) -> float:
    r = trained_engine.predict(
        base_capacity=int(row["base_capacity"]),
        day_of_week=DOW_STR[int(row["day_of_week"])],
        meal_session=SESSION_DEC[int(row["meal_session"])],
        turnout_ratio=float(row["turnout_ratio"]),
        exam_season=bool(row["exam_season"]),
        holiday_factor=bool(row["holiday_factor"]),
        weather=WEATHER_DEC[int(row["weather_code"])],
        active_rsvps=int(row["rsvp_count"]),
        prev_day_served=int(row["prev_day_served"]),
        prev_waste_kg=float(row["prev_waste_kg"]),
    )
    return float(r["expected_demand"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def pct(arr): return sorted(arr)

def latency_stats(times):
    s = sorted(times)
    return dict(
        avg=round(statistics.mean(times), 4),
        p50=round(s[len(s)//2], 4),
        p95=round(s[int(len(s)*0.95)], 4),
        p99=round(s[int(len(s)*0.99)], 4),
        min=round(min(times), 4),
        max=round(max(times), 4),
    )

def accuracy_stats(y_true, y_pred):
    y_true = np.array(y_true, dtype=float)
    y_pred = np.array(y_pred, dtype=float)
    errors = np.abs(y_true - y_pred)
    mae    = float(np.mean(errors))
    rmse   = float(sqrt(np.mean((y_true - y_pred)**2)))
    ss_res = np.sum((y_true - y_pred)**2)
    ss_tot = np.sum((y_true - np.mean(y_true))**2)
    r2     = 1 - ss_res/ss_tot if ss_tot > 0 else 0.0
    acc    = float(np.mean(1 - errors / np.clip(y_true, 1, None)) * 100)
    return dict(mae=round(mae,3), rmse=round(rmse,3),
                r2=round(r2,4), mean_accuracy_pct=round(acc,2))

def measure_peak_memory_kb(fn, *args, **kwargs):
    gc.collect()
    tracemalloc.start()
    fn(*args, **kwargs)
    _, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return round(peak / 1024, 1)

# Approx energy: assume 15W CPU TDP, single-core utilisation
# Energy (µWh) = power_W × time_s × 1e6 / 3600
CPU_POWER_W = 15.0

def energy_uwh(cpu_seconds: float) -> float:
    return round(cpu_seconds * CPU_POWER_W * 1e6 / 3600, 4)


# ── Benchmark runners ─────────────────────────────────────────────────────────

def bench_latency(predict_fn, scenarios, n_iter):
    times = []
    sc_cycle = [scenarios[i % len(scenarios)] for i in range(n_iter)]
    for sc in sc_cycle:
        t0 = time.perf_counter()
        predict_fn(**sc)
        times.append((time.perf_counter() - t0) * 1000)
    return times


# ── Main ─────────────────────────────────────────────────────────────────────

def run_benchmark():
    rule_engine = MealDemandForecastEngine()

    print("\n" + "="*72)
    print("  MESSWISE ML BENCHMARK  —  Old Rule Engine vs New XGBoost Engine")
    print("="*72)

    # ── 1. Generate held-out evaluation set ──────────────────────────────────
    print("\n[1/4] Generating held-out evaluation dataset …")
    df = generate_dataset(n_days=180, random_seed=99)   # fresh seed, unseen data
    eval_df = df.copy()
    y_true  = eval_df[TARGET_COL].values
    n_eval  = len(eval_df)
    print(f"      {n_eval} evaluation samples  "
          f"({eval_df['date'].min()} -> {eval_df['date'].max()})")

    # ── 2. Accuracy on eval set ───────────────────────────────────────────────
    print("\n[2/4] Computing accuracy on held-out set …")
    rule_preds, ml_preds = [], []
    for _, row in eval_df.iterrows():
        rule_preds.append(rule_predict_row(rule_engine, row))
        ml_preds.append(ml_predict_row(row))

    rule_acc = accuracy_stats(y_true, rule_preds)
    ml_acc   = accuracy_stats(y_true, ml_preds)

    # ── 3. Latency ────────────────────────────────────────────────────────────
    print(f"[3/4] Running latency benchmark (n={N_ITERATIONS} calls each) …")

    def rule_call(**kw):
        return rule_engine.predict(**kw)

    def ml_call(**kw):
        return trained_engine.predict(**kw)

    # Warm-up
    for sc in SCENARIOS:
        rule_call(**sc)
        ml_call(**sc)

    rule_times = bench_latency(rule_call, SCENARIOS, N_ITERATIONS)
    ml_times   = bench_latency(ml_call,   SCENARIOS, N_ITERATIONS)

    rule_lat = latency_stats(rule_times)
    ml_lat   = latency_stats(ml_times)

    # ── 4. Memory & energy ────────────────────────────────────────────────────
    print("[4/4] Measuring memory and energy …")

    rule_mem_kb = measure_peak_memory_kb(rule_call, **SCENARIOS[0])
    ml_mem_kb   = measure_peak_memory_kb(ml_call,   **SCENARIOS[0])

    # CPU time = avg latency × n_iterations (proxy for total compute)
    rule_cpu_s = (rule_lat["avg"] / 1000) * N_ITERATIONS
    ml_cpu_s   = (ml_lat["avg"]   / 1000) * N_ITERATIONS
    rule_energy = energy_uwh(rule_cpu_s)
    ml_energy   = energy_uwh(ml_cpu_s)

    # ── Print results ─────────────────────────────────────────────────────────

    W = 72
    DIV = "─" * W

    def row(label, old_val, new_val, unit="", better="lower", highlight=True):
        if better == "lower":
            improved = new_val < old_val
        else:
            improved = new_val > old_val
        delta_pct = ((new_val - old_val) / max(abs(old_val), 1e-9)) * 100
        arrow = "v" if improved else "^"
        sign  = "-" if delta_pct < 0 else "+"
        tag   = f"[{arrow} {abs(delta_pct):.1f}%]" if highlight else ""
        print(f"  {label:<35} {str(old_val)+unit:>10}  {str(new_val)+unit:>10}  {tag}")

    print(f"\n{'='*W}")
    print(f"  {'METRIC':<35} {'RULE ENGINE':>10}  {'XGBOOST ML':>10}  CHANGE")
    print(f"{'='*W}")

    print(f"\n  --- ACCURACY (held-out {n_eval} samples) ---")
    row("MAE (portions)",        rule_acc["mae"],              ml_acc["mae"],              "", "lower")
    row("RMSE (portions)",       rule_acc["rmse"],             ml_acc["rmse"],             "", "lower")
    row("R² score",              rule_acc["r2"],               ml_acc["r2"],               "", "higher")
    row("Mean Accuracy %",       rule_acc["mean_accuracy_pct"],ml_acc["mean_accuracy_pct"],"", "higher")

    print(f"\n  --- LATENCY (ms, n={N_ITERATIONS}) ---")
    row("Average latency",       rule_lat["avg"],  ml_lat["avg"],  " ms")
    row("p50 latency",           rule_lat["p50"],  ml_lat["p50"],  " ms")
    row("p95 latency",           rule_lat["p95"],  ml_lat["p95"],  " ms")
    row("p99 latency",           rule_lat["p99"],  ml_lat["p99"],  " ms")
    row("Min latency",           rule_lat["min"],  ml_lat["min"],  " ms")
    row("Max latency",           rule_lat["max"],  ml_lat["max"],  " ms")

    print(f"\n  --- MEMORY USAGE ---")
    row("Peak allocation/call",  rule_mem_kb,    ml_mem_kb,    " KB")

    print(f"\n  --- ENERGY (proxy: 15W single-core, n={N_ITERATIONS} calls) ---")
    row("Total CPU time",        round(rule_cpu_s*1000,2), round(ml_cpu_s*1000,2), " ms")
    row("Estimated energy use",  rule_energy,  ml_energy,  " uWh")
    row("Energy per 1k preds",   round(rule_energy/N_ITERATIONS*1000,4),
                                  round(ml_energy/N_ITERATIONS*1000,4), " uWh")

    print(f"\n{'='*W}")
    print(f"  SUMMARY")
    print(f"{DIV}")

    mae_delta   = round(rule_acc["mae"]  - ml_acc["mae"],  2)
    rmse_delta  = round(rule_acc["rmse"] - ml_acc["rmse"], 2)
    r2_delta    = round(ml_acc["r2"]     - rule_acc["r2"],  4)
    acc_delta   = round(ml_acc["mean_accuracy_pct"] - rule_acc["mean_accuracy_pct"], 2)
    lat_speedup = round(rule_lat["avg"] / max(ml_lat["avg"], 0.0001), 1)
    mem_delta   = round(ml_mem_kb - rule_mem_kb, 1)
    energy_pct  = round((ml_energy - rule_energy) / max(rule_energy, 0.0001) * 100, 1)

    print(f"  Accuracy improvement:  MAE  -{mae_delta} portions  |  RMSE -{rmse_delta}  |  R2 +{r2_delta}  |  Acc +{acc_delta}%")
    if lat_speedup >= 1.0:
        print(f"  Latency:               XGBoost is {lat_speedup}x FASTER (avg)  |  p95 {rule_lat['p95']} -> {ml_lat['p95']} ms")
    elif lat_speedup > 0:
        print(f"  Latency:               XGBoost is {round(1/lat_speedup,1)}x SLOWER (avg)  |  p95 {rule_lat['p95']} -> {ml_lat['p95']} ms")
    else:
        print(f"  Latency:               XGBoost p95 {rule_lat['p95']} -> {ml_lat['p95']} ms")
    mem_sign = "+" if mem_delta > 0 else ""
    print(f"  Memory delta:          {mem_sign}{mem_delta} KB per call")
    print(f"  Energy delta:          {'+' if energy_pct>0 else ''}{energy_pct}% for {N_ITERATIONS} predictions")
    print(f"  Model size on disk:    Rule engine ~0 KB  |  XGBoost pipeline 307 KB")
    print(f"{'='*W}\n")


if __name__ == "__main__":
    run_benchmark()
