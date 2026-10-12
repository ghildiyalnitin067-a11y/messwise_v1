import pytest


@pytest.mark.asyncio
async def test_get_today_meals(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nitin.sharma@campus.edu", "password": "student123"}
    )
    token = login_res.json()["access_token"]

    response = await client.get(
        "/api/v1/student/meals/today",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "meals" in data
    assert "breakfast" in data["meals"]
    assert "lunch" in data["meals"]
    assert "dinner" in data["meals"]


@pytest.mark.asyncio
async def test_toggle_meal_booking(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nitin.sharma@campus.edu", "password": "student123"}
    )
    token = login_res.json()["access_token"]

    response = await client.post(
        "/api/v1/student/meals/toggle",
        json={"meal_session": "dinner"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["meal_session"] == "dinner"
    assert data["booked"] is True
    assert "token" in data


@pytest.mark.asyncio
async def test_submit_meal_feedback(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nitin.sharma@campus.edu", "password": "student123"}
    )
    token = login_res.json()["access_token"]

    response = await client.post(
        "/api/v1/student/feedback",
        json={
            "meal_session": "lunch",
            "rating": 5,
            "comment": "Delicious food!"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert "submitted_at" in data


@pytest.mark.asyncio
async def test_push_food_sync_to_rsvp_and_weekly_menu(client):
    # 1. Admin logs in
    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    admin_token = admin_login.json()["access_token"]

    # 2. Student logs in
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "nitin.sharma@campus.edu", "password": "student123"}
    )
    student_token = student_login.json()["access_token"]

    # 3. Admin pushes food into menu (append Gulab Jamun to lunch)
    push_res = await client.post(
        "/api/v1/admin/menu",
        json={
            "session": "lunch",
            "menu": "Fresh Gulab Jamun",
            "append_dish": True
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert push_res.status_code == 200
    pushed_data = push_res.json()
    assert "Fresh Gulab Jamun" in pushed_data["sessions"]["lunch"]["menu"]

    # 4. Student gets today's meals (RSVP)
    today_res = await client.get(
        "/api/v1/student/meals/today",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert today_res.status_code == 200
    today_data = today_res.json()
    lunch_menu = today_data["meals"]["lunch"]["menu"]
    assert "Fresh Gulab Jamun" in lunch_menu

    # 5. Student gets weekly menu (tabular schedule)
    weekly_res = await client.get(
        "/api/v1/student/menu/weekly",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert weekly_res.status_code == 200
    weekly_data = weekly_res.json()
    today_entry = next((item for item in weekly_data["schedule"] if item["is_today"]), None)
    assert today_entry is not None
    assert "Fresh Gulab Jamun" in today_entry["lunch"]


@pytest.mark.asyncio
async def test_earn_eco_points_zero_delay_sync(client):
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nitin.sharma@campus.edu", "password": "student123"}
    )
    student_token = login_res.json()["access_token"]

    response = await client.post(
        "/api/v1/student/points/earn",
        json={
            "points": 30,
            "action": "Timely Dinner RSVP Opt-Out (Food Saved)"
        },
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["points_added"] == 30
    assert data["total_eco_points"] >= 610
