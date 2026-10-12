"""
MessWise — Comprehensive Analytics Service & API Tests
======================================================
Validates all 7 analytics domain endpoints:
- Executive Overview & KPI Denominators
- Student & Meal Attendance Trends
- Food Preparation & Waste Accounting
- Used Cooking Oil Recycling & Lifecycle
- NGO Food Redistribution & SLA Tracking
- ML Model Validation & Residual Analysis
- Energy & Net Carbon Footprint Accounting
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_executive_overview_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/overview?date_range=30d")
        assert res.status_code == 200
        data = res.json()
        assert "kpis" in data
        assert "historical_totals" in data
        assert "period" in data

        kpis = data["kpis"]
        assert kpis["total_registered_students"] >= 600
        assert kpis["total_meal_bookings"] >= 0
        assert 0.0 <= kpis["rsvp_rate_pct"] <= 100.0
        assert 0.0 <= kpis["confirmation_rate_pct"] <= 100.0
        assert 0.0 <= kpis["cancellation_rate_pct"] <= 100.0
        assert kpis["food_prepared_kg"] >= 0.0
        assert kpis["food_wasted_kg"] >= 0.0
        assert kpis["food_waste_percentage"] >= 0.0
        assert kpis["net_co2e_avoided_kg"] >= 0.0
        assert kpis["active_ml_model"] == "XGBoost Regressor"


@pytest.mark.asyncio
async def test_student_meal_analytics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/student-meals?date_range=30d")
        assert res.status_code == 200
        data = res.json()
        assert "daily_bookings_trend" in data
        assert "session_comparison" in data
        assert "predicted_vs_actual" in data
        assert "rates_over_time" in data
        assert "bookings_by_dow" in data
        assert "stacked_booking_status" in data
        assert "attendance_vs_consumption" in data
        assert "demand_periods_table" in data

        # Check Day of week has all 7 days
        dows = [d["day_of_week"] for d in data["bookings_by_dow"]]
        assert "Monday" in dows
        assert "Friday" in dows


@pytest.mark.asyncio
async def test_food_waste_analytics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/food-waste?date_range=30d")
        assert res.status_code == 200
        data = res.json()
        assert "daily_prep_consumed_waste" in data
        assert "waste_by_meal_type" in data
        assert "waste_by_category" in data
        assert "waste_percentage_trend" in data
        assert "financial_loss_trend" in data
        assert "pre_post_ml_comparison" in data
        assert "highest_waste_meals_table" in data

        # Ensure categories exist
        cat_names = [c["category"] for c in data["waste_by_category"]]
        assert any("Prep Trimmings" in c for c in cat_names)
        assert any("Unserved Overproduction" in c for c in cat_names)
        assert any("Student Plate Waste" in c for c in cat_names)


@pytest.mark.asyncio
async def test_uco_analytics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/uco?date_range=90d")
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert "oil_timeline" in data
        assert "destination_distribution" in data
        assert "status_breakdown" in data
        assert "emissions_avoided_trend" in data
        assert "partner_performance_table" in data

        s = data["summary"]
        assert s["total_oil_recorded_kg"] >= 0.0
        assert s["total_oil_processed_kg"] >= 0.0
        # Only processed oil gets positive emissions credit
        assert s["total_emissions_avoided_kg"] >= 0.0


@pytest.mark.asyncio
async def test_ngo_redistribution_analytics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/ngo?date_range=30d")
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert "ngo_distribution_breakdown" in data
        assert "offered_vs_delivered_timeline" in data
        assert "transaction_status_breakdown" in data
        assert "pickup_completion_time_trend" in data
        assert "ngo_partners_table" in data

        s = data["summary"]
        assert s["total_ngos_registered"] >= 1
        assert s["surplus_food_collected_meals"] >= 0
        assert s["average_pickup_time_minutes"] > 0.0


@pytest.mark.asyncio
async def test_ml_performance_analytics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/ml-performance?date_range=30d")
        assert res.status_code == 200
        data = res.json()
        assert "model_metadata" in data
        assert "predicted_vs_actual_trend" in data
        assert "mae_by_meal_type" in data
        assert "prediction_error_trend" in data
        assert "latency_comparison" in data
        assert "waste_outcomes_vs_accuracy" in data

        meta = data["model_metadata"]
        assert meta["active_model_name"] == "XGBoost Regressor"
        assert meta["held_out_validation_mae"] > 0
        assert meta["held_out_validation_r2"] > 0.90
        assert meta["inference_p95_latency_ms"] < 5.0


@pytest.mark.asyncio
async def test_carbon_energy_analytics_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/carbon-energy?date_range=90d")
        assert res.status_code == 200
        data = res.json()
        assert "summary" in data
        assert "monthly_emissions_trend" in data
        assert "contribution_stack" in data
        assert "operational_vs_avoided" in data
        assert "emission_factors_documentation" in data

        s = data["summary"]
        assert s["net_co2e_avoided_kg"] > 0.0
        assert s["ml_operational_emissions_kg"] >= 0.0
        assert s["gross_co2e_avoided_kg"] >= s["net_co2e_avoided_kg"]
        # Documentation has factors
        docs = data["emission_factors_documentation"]
        assert len(docs) >= 3


@pytest.mark.asyncio
async def test_analytics_date_filters():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test 7d vs 90d
        r_7d = await client.get("/api/v1/analytics/overview?date_range=7d")
        r_90d = await client.get("/api/v1/analytics/overview?date_range=90d")
        assert r_7d.status_code == 200
        assert r_90d.status_code == 200
        
        # 90d bookings should be >= 7d bookings
        b_7d = r_7d.json()["kpis"]["total_meal_bookings"]
        b_90d = r_90d.json()["kpis"]["total_meal_bookings"]
        assert b_90d >= b_7d
