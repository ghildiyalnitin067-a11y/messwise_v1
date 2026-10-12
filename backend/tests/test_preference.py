import pytest


@pytest.mark.asyncio
async def test_get_preference_poll(client):
    response = await client.get("/api/v1/preference/poll?session=lunch")
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert len(data["categories"]) > 0
    assert data["session"] == "Lunch"
    assert "total_voters" in data


@pytest.mark.asyncio
async def test_submit_preference_vote(client):
    # Get poll first to grab candidate names or ids
    poll_res = await client.get("/api/v1/preference/poll?session=lunch")
    data = poll_res.json()
    first_opt = data["categories"][0]["options"][0]

    vote_res = await client.post("/api/v1/preference/vote", json={
        "session": "lunch",
        "selected_option_ids": [first_opt["id"]],
        "notes": "Love Paneer dishes!"
    })
    assert vote_res.status_code == 200
    vote_data = vote_res.json()
    assert vote_data["success"] is True
    assert vote_data["eco_points_earned"] == 15
    assert vote_data["updated_poll"]["has_voted"] is True
    assert vote_data["updated_poll"]["daily_limit_reached"] is True

    # Attempting to submit a second preference on the same day MUST fail with HTTP 400
    second_vote_res = await client.post("/api/v1/preference/vote", json={
        "session": "dinner",
        "selected_option_ids": [first_opt["id"]],
        "notes": "Attempting second vote"
    })
    assert second_vote_res.status_code == 400
    err_data = second_vote_res.json()
    assert "Daily preference limit reached" in err_data["detail"]


@pytest.mark.asyncio
async def test_optimize_menu_low_preference(client):
    opt_res = await client.post("/api/v1/preference/optimize", json={
        "session": "lunch",
        "threshold_pct": 20.0,
        "auto_update_menu": True
    })
    assert opt_res.status_code == 200
    opt_data = opt_res.json()
    assert opt_data["success"] is True
    assert "pruned_dishes" in opt_data
    assert "retained_dishes" in opt_data
    assert opt_data["estimated_waste_saved_kg"] > 0
    assert "new_menu" in opt_data
