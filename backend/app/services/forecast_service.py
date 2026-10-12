import math
import asyncio
import json
import os
import numpy as np
from typing import List, Dict, Any
from datetime import datetime, date, timedelta, timezone
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.meal import MealBooking, DailyProductionLog
from app.models.hostel import Hostel
from app.models.demand import ForecastRecord
from app.schemas.ml import (
    ForecastPredictRequest,
    ForecastPredictResponse,
    SignalBreakdown,
    WhatIfSimulateRequest,
    WhatIfSimulateResponse,
    AccuracyRecordOut,
    ForecastAccuracyResponse
)
from app.ml.meal_demand_model import trained_engine


class ForecastService:
    # Pre-built history data — static, allocated once at class definition
    _HISTORY_DATA: List[Dict[str, Any]] = [
        {"date": "16 Sep 2025", "session": "Lunch",     "forecast": 560, "served": 548},
        {"date": "16 Sep 2025", "session": "Breakfast",  "forecast": 480, "served": 472},
        {"date": "15 Sep 2025", "session": "Dinner",     "forecast": 510, "served": 498},
        {"date": "15 Sep 2025", "session": "Lunch",      "forecast": 540, "served": 535},
        {"date": "14 Sep 2025", "session": "Dinner",     "forecast": 490, "served": 481},
        {"date": "14 Sep 2025", "session": "Lunch",      "forecast": 530, "served": 522},
        {"date": "13 Sep 2025", "session": "Lunch",      "forecast": 420, "served": 412},
    ]

    async def predict_demand(
        self,
        db: AsyncSession,
        req: ForecastPredictRequest
    ) -> ForecastPredictResponse:
        # ── Fetch DB context concurrently ────────────────────────────────────
        hostel_stmt = select(Hostel).limit(1)
        rsvp_stmt = select(func.count(MealBooking.id)).where(
            MealBooking.date == date.today(),
            MealBooking.meal_session.ilike(req.meal_session),
            MealBooking.status == "Booked"
        )
        optout_stmt = select(func.count(MealBooking.id)).where(
            MealBooking.date == date.today(),
            MealBooking.meal_session.ilike(req.meal_session),
            MealBooking.status == "OptedOut"
        )
        # Fetch yesterday's production log for prev_day_served feature
        yesterday = date.today() - timedelta(days=1)
        prev_prod_stmt = select(DailyProductionLog).where(
            DailyProductionLog.date == yesterday,
            DailyProductionLog.meal_session.ilike(req.meal_session)
        ).limit(1)

        h_res, rsvp_res, optout_res, prev_res = await asyncio.gather(
            db.execute(hostel_stmt),
            db.execute(rsvp_stmt),
            db.execute(optout_stmt),
            db.execute(prev_prod_stmt),
        )

        hostel              = h_res.scalar_one_or_none()
        total_boarders      = hostel.capacity if hostel else 600
        current_rsvps_count = rsvp_res.scalar() or 420
        optout_count        = optout_res.scalar() or 18
        prev_prod           = prev_res.scalar_one_or_none()
        prev_day_served     = prev_prod.served_qty if prev_prod else None

        # ── ML Prediction ────────────────────────────────────────────────────
        ml_result = trained_engine.predict(
            base_capacity=total_boarders,
            day_of_week=req.day_of_week,
            meal_session=req.meal_session,
            turnout_ratio=req.turnout_ratio or 0.90,
            exam_season=req.exam_season,
            holiday_factor=req.holiday_factor,
            weather=req.weather,
            active_rsvps=current_rsvps_count,
            prev_day_served=prev_day_served,
        )

        expected_demand  = ml_result["expected_demand"]
        recommended_cook = ml_result["recommended_cook"]
        buffer_pct       = ml_result["buffer_margin_percent"]
        waste_risk       = ml_result["waste_risk"]
        confidence_pct   = ml_result["confidence_percent"]
        insights         = ml_result["insights"]

        # Safety buffer as integer delta
        safety_buffer = recommended_cook - expected_demand

        signals = SignalBreakdown(
            current_rsvps=current_rsvps_count,
            historical_baseline=int((total_boarders - current_rsvps_count) * 0.675),
            day_factor=int(total_boarders * 0.02),
            campus_event=25 if req.exam_season else 0,
            recent_opt_outs=-int(optout_count * 0.85)
        )

        model_label = (
            trained_engine.get_metadata().get("best_model_name", "MessWise ML")
            if trained_engine.is_available()
            else "MessWise Rule Engine v1"
        )

        target_date_str = req.target_date or (date.today() + timedelta(days=1)).strftime("%a, %d %b %Y")

        return ForecastPredictResponse(
            target_date=target_date_str,
            meal_session=req.meal_session,
            expected_demand=expected_demand,
            recommended_cook=recommended_cook,
            safety_buffer=safety_buffer,
            buffer_margin_percent=round(buffer_pct, 1),
            waste_risk=waste_risk,
            confidence_percent=confidence_pct,
            model_version=model_label,
            signals=signals,
            insights=insights
        )


    def simulate_what_if(self, req: WhatIfSimulateRequest) -> WhatIfSimulateResponse:
        base = req.base_attendance
        delta_mult = 1.0 + (req.turnout_delta_pct / 100.0)

        event_adjustments = {
            "Normal": 0,
            "Exam Week": 30,
            "Festival": -45,
            "Rain Storm": -35
        }
        event_adj = event_adjustments.get(req.event_type, 0)

        simulated_demand = int(base * delta_mult) + event_adj
        simulated_prep = simulated_demand + req.safety_buffer
        potential_surplus_kg = round(float(req.safety_buffer) * 0.42, 2)
        variance_pct = round(((simulated_demand - base) / base) * 100.0, 1)

        rec = (
            f"Under the {req.event_type} scenario ({'+' if req.turnout_delta_pct >= 0 else ''}{req.turnout_delta_pct}% turnout), "
            f"target kitchen batch to {simulated_prep} portions. Projected unserved surplus risk is {potential_surplus_kg} kg."
        )

        return WhatIfSimulateResponse(
            original_forecast=base,
            simulated_demand=simulated_demand,
            simulated_prep=simulated_prep,
            buffer_used=req.safety_buffer,
            potential_surplus_risk_kg=potential_surplus_kg,
            variance_percent=variance_pct,
            recommendation=rec
        )

    async def get_accuracy_metrics(self, db: AsyncSession) -> ForecastAccuracyResponse:
        history_data = self._HISTORY_DATA

        errors = [abs(item["forecast"] - item["served"]) for item in history_data]
        mae = sum(errors) / len(errors)
        rmse = math.sqrt(sum(e ** 2 for e in errors) / len(errors))
        accuracy_list = [
            round((1 - (abs(item["forecast"] - item["served"]) / item["served"])) * 100, 1)
            for item in history_data
        ]
        mean_acc = round(sum(accuracy_list) / len(accuracy_list), 1)

        # Use real trained model accuracy when available
        if trained_engine.is_available():
            mean_acc = round(trained_engine.get_metadata().get("mean_accuracy_pct", mean_acc), 1)

        history_outs = [
            AccuracyRecordOut(
                date=item["date"],
                meal_session=item["session"],
                forecast_demand=item["forecast"],
                actual_served=item["served"],
                abs_error=abs(item["forecast"] - item["served"]),
                accuracy_pct=round(
                    (1 - (abs(item["forecast"] - item["served"]) / item["served"])) * 100, 1
                )
            )
            for item in history_data
        ]

        return ForecastAccuracyResponse(
            mae=round(mae, 2),
            rmse=round(rmse, 2),
            mean_accuracy_pct=mean_acc,
            total_evaluations=len(history_outs),
            history=history_outs
        )

    def get_ml_metrics(self) -> Dict[str, Any]:
        """Returns the model comparison report saved during training."""
        models_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "..", "ml", "models"
        )
        comp_path = os.path.join(models_dir, "model_comparison.json")
        if not os.path.exists(comp_path):
            return {
                "status": "not_trained",
                "message": "Run python scripts/train_models.py to train the models.",
                "ml_available": trained_engine.is_available(),
            }
        with open(comp_path) as f:
            return json.load(f)

    def optimize_preparation(
        self,
        predicted_demand: int,
        available_inventory: float = 0.0,
        portion_size_kg: float = 0.45,
        safety_buffer_pct: float = 2.6,
        max_kitchen_capacity: int = 900,
        min_prepare: int = 50,
    ) -> Dict[str, Any]:
        """
        Food Preparation Optimizer.
        Converts a predicted demand figure into an actionable cook quantity.

        Args:
            predicted_demand:     Expected number of meals (from ML model)
            available_inventory:  Usable pre-cooked / carry-forward stock (meals)
            portion_size_kg:      Average portion weight in kg (default 450g)
            safety_buffer_pct:    Extra preparation margin in %
            max_kitchen_capacity: Hard upper bound on cook capacity
            min_prepare:          Minimum batch size (avoids trivially small cooks)

        Returns:
            Dict with recommended_cook, expected_surplus, waste_risk, cost_estimate
        """
        # Net demand after existing inventory
        net_demand = max(0, predicted_demand - int(available_inventory))

        # Apply safety buffer
        buffered    = net_demand * (1.0 + safety_buffer_pct / 100.0)
        recommended = int(np.clip(round(buffered), min_prepare, max_kitchen_capacity))

        # Projected surplus if we cook recommended vs demand
        expected_surplus_meals = max(0, recommended - predicted_demand)
        expected_surplus_kg    = round(expected_surplus_meals * portion_size_kg, 2)

        # Cost estimate (₹42 / portion average)
        cost_per_portion_inr = 42.0
        estimated_cost_inr   = round(recommended * cost_per_portion_inr, 2)
        surplus_cost_inr     = round(expected_surplus_meals * cost_per_portion_inr, 2)

        waste_risk = (
            "High"     if expected_surplus_kg > 15 else
            "Moderate" if expected_surplus_kg > 5  else
            "Low"
        )

        # Redistribution recommendation
        redistribute = expected_surplus_meals > 10

        return {
            "predicted_demand":       predicted_demand,
            "available_inventory":    int(available_inventory),
            "net_demand":             net_demand,
            "recommended_cook":       recommended,
            "safety_buffer_pct":      safety_buffer_pct,
            "expected_surplus_meals": expected_surplus_meals,
            "expected_surplus_kg":    expected_surplus_kg,
            "estimated_cost_inr":     estimated_cost_inr,
            "surplus_cost_inr":       surplus_cost_inr,
            "waste_risk":             waste_risk,
            "recommend_ngo_broadcast": redistribute,
            "ngo_message": (
                f"Surplus of {expected_surplus_meals} meals projected. "
                "Consider broadcasting to registered NGOs before service ends."
                if redistribute else
                "Preparation within acceptable waste margins."
            ),
        }



forecast_service = ForecastService()
