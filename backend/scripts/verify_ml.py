"""End-to-end verification of the trained ML pipeline."""
import sys, os, time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml.meal_demand_model import trained_engine

print("=" * 60)
print("Messwise ML Integration Verification")
print("=" * 60)

assert trained_engine.is_available(), "FAIL: Model not loaded!"
meta = trained_engine.get_metadata()
print(f"\nModel loaded : {meta['best_model_name']}")
print(f"Trained at  : {meta['trained_at']}")
print(f"Val MAE     : {meta['val_mae']:.2f} portions")
print(f"Val R2      : {meta['val_r2']:.4f}")
print(f"Accuracy    : {meta['mean_accuracy_pct']:.1f}%")
print(f"Latency p95 : {meta['latency_p95_ms']:.3f}ms")

scenarios = [
    dict(day_of_week="wed", meal_session="Lunch",    exam_season=False, holiday_factor=False, weather="clear",       active_rsvps=560),
    dict(day_of_week="sun", meal_session="Dinner",   exam_season=False, holiday_factor=False, weather="clear",       active_rsvps=598),
    dict(day_of_week="fri", meal_session="Lunch",    exam_season=False, holiday_factor=True,  weather="clear",       active_rsvps=380),
    dict(day_of_week="mon", meal_session="Breakfast",exam_season=True,  holiday_factor=False, weather="heavy_rain",  active_rsvps=490),
    dict(day_of_week="sat", meal_session="Dinner",   exam_season=False, holiday_factor=False, weather="extreme_heat",active_rsvps=420),
]

print("\n--- Scenario predictions ---")
for sc in scenarios:
    r = trained_engine.predict(base_capacity=650, **sc)
    assert r["expected_demand"] >= 50,            f"demand too low: {r['expected_demand']}"
    assert r["recommended_cook"] >= r["expected_demand"], "buffer violated"
    assert r["waste_risk"] in ("Low","Moderate","High")
    assert len(r["insights"]) == 4
    print(f"  {sc['day_of_week'].upper()} {sc['meal_session']:<10} "
          f"demand={r['expected_demand']:>4}  cook={r['recommended_cook']:>4}  "
          f"risk={r['waste_risk']:<8}  conf={r['confidence_percent']:.1f}%")

times = []
for _ in range(500):
    t0 = time.perf_counter()
    trained_engine.predict(base_capacity=650, day_of_week="wed",
                           meal_session="Lunch", active_rsvps=560)
    times.append((time.perf_counter()-t0)*1000)
times.sort()
print(f"\nInference latency (n=500):  "
      f"avg={sum(times)/len(times):.3f}ms  "
      f"p95={times[int(len(times)*0.95)]:.3f}ms  "
      f"p99={times[int(len(times)*0.99)]:.3f}ms")

print("\nAll verification checks PASSED.")
