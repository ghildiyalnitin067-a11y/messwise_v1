import pytest
from datetime import date
from app.ml.stock_analysis_engine import stock_engine


@pytest.mark.asyncio
async def test_stock_engine_unit():
    # Test onion stock retrieval
    stock = stock_engine.get_current_stock("onion")
    assert stock["ingredient_id"] == "onion"
    assert stock["total_stock"] > 0
    assert len(stock["batches"]) >= 1

    # Test predicted usage
    usage = stock_engine.calculate_predicted_usage("onion", days=7)
    assert usage["total_predicted_usage_kg"] > 0
    assert usage["avg_daily_usage_kg"] > 0

    # Test days of stock left
    days_left = stock_engine.calculate_days_of_stock_left("onion")
    assert days_left > 0

    # Test waste risk
    waste = stock_engine.calculate_waste_risk("onion")
    assert "waste_risk_kg" in waste
    assert waste["overstock_risk"] in ["low", "medium", "high"]

    # Test procurement recommendation
    proc = stock_engine.get_procurement_recommendation("onion", safety_factor=1.1)
    assert "recommended_order_kg" in proc
    assert "action" in proc

    # Test summary
    summary = stock_engine.get_stock_summary()
    assert summary["total_items_tracked"] >= 6
    assert isinstance(summary["critical_alerts"], list)


@pytest.mark.asyncio
async def test_stock_api_endpoints(client):
    # Log in as admin
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # GET /api/v1/stock/summary
    resp = await client.get("/api/v1/stock/summary")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_items_tracked" in data
    assert "total_inventory_value_inr" in data

    # GET /api/v1/stock/items
    resp = await client.get("/api/v1/stock/items")
    assert resp.status_code == 200
    items = resp.json()
    assert len(items) >= 6
    assert any(it["ingredient_id"] == "onion" for it in items)

    # GET /api/v1/stock/onion
    resp = await client.get("/api/v1/stock/onion")
    assert resp.status_code == 200
    onion_data = resp.json()
    assert onion_data["ingredient_id"] == "onion"
    assert "batches" in onion_data

    # GET /api/v1/stock/onion/procurement
    resp = await client.get("/api/v1/stock/onion/procurement?safety_factor=1.1&planning_horizon_days=5")
    assert resp.status_code == 200
    proc_data = resp.json()
    assert proc_data["ingredient_id"] == "onion"

    # POST /api/v1/stock/batch (with admin token)
    today = date.today().isoformat()
    new_batch = {
        "ingredient_id": "onion",
        "qty": 25.0,
        "received_date": today,
        "shelf_life_days": 14,
        "cost_per_kg": 35.0,
        "co2_per_kg": 1.2
    }
    resp = await client.post("/api/v1/stock/batch", json=new_batch, headers=headers)
    assert resp.status_code == 201
    batch_out = resp.json()
    assert batch_out["qty"] == 25.0

    # POST /api/v1/stock/deduct
    deduct_req = {
        "ingredient_id": "onion",
        "qty_to_deduct": 10.0
    }
    resp = await client.post("/api/v1/stock/deduct", json=deduct_req, headers=headers)
    assert resp.status_code == 200
    deduct_out = resp.json()
    assert deduct_out["status"] == "success"
    assert deduct_out["actual_deducted"] == 10.0

    # POST /api/v1/stock/item (Add new vegetable)
    new_veg = {
        "name": "Fresh Spinach (Palak)",
        "category": "vegetable",
        "unit": "kg",
        "consumption_per_meal": 0.035,
        "cost_per_unit": 30.0,
        "shelf_life_days": 4,
        "initial_qty": 45.0
    }
    resp = await client.post("/api/v1/stock/item", json=new_veg, headers=headers)
    assert resp.status_code == 201
    veg_res = resp.json()
    assert veg_res["name"] == "Fresh Spinach (Palak)"
    assert veg_res["category"] == "vegetable"
    assert veg_res["initial_batch"] is not None

    # POST /api/v1/stock/item (Add prepared meal)
    new_meal = {
        "name": "Paneer Butter Masala (Cooked)",
        "category": "meal",
        "unit": "portions",
        "consumption_per_meal": 0.90,
        "cost_per_unit": 65.0,
        "shelf_life_days": 1,
        "initial_qty": 60.0
    }
    resp = await client.post("/api/v1/stock/item", json=new_meal, headers=headers)
    assert resp.status_code == 201
    meal_res = resp.json()
    assert meal_res["category"] == "meal"
    assert meal_res["initial_batch"]["qty"] == 60.0

    # GET /api/v1/stock/addon-recommendations
    resp = await client.get("/api/v1/stock/addon-recommendations")
    assert resp.status_code == 200
    recs = resp.json()
    assert isinstance(recs, list)
    assert len(recs) >= 1
    # Check that tomato or expiring items are detected
    assert any("tomato" in r["ingredient_id"] or r["earliest_expiry_days"] <= 3 for r in recs)

    # POST /api/v1/stock/publish-addon
    pub_req = {
        "ingredient_id": "tomato",
        "addon_name": "Tomato Shorba & Chutney Special",
        "meal_session": "lunch",
        "portions_target": 250,
        "description": "Zero-waste soup special utilizing fresh tomatoes nearing expiry.",
        "eco_points": 25
    }
    resp = await client.post("/api/v1/stock/publish-addon", json=pub_req, headers=headers)
    assert resp.status_code == 201
    addon_out = resp.json()
    assert addon_out["name"] == "Tomato Shorba & Chutney Special"
    assert addon_out["portions_target"] == 250

    # GET /api/v1/stock/active-addons
    resp = await client.get("/api/v1/stock/active-addons?meal_session=lunch")
    assert resp.status_code == 200
    active_addons = resp.json()
    assert len(active_addons) >= 1

    # POST /api/v1/stock/addons/opt-in (Student claims add-on)
    opt_req = {
        "addon_id": addon_out["addon_id"],
        "student_id": "usr-student-01"
    }
    resp = await client.post("/api/v1/stock/addons/opt-in", json=opt_req)
    assert resp.status_code == 200
    opt_res = resp.json()
    assert opt_res["status"] == "confirmed"
    assert opt_res["eco_points_awarded"] == 25
    assert opt_res["portions_claimed"] >= 1

