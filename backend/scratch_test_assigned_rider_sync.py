import httpx

BASE_URL = "http://127.0.0.1:8000/api/v1"
ADMIN_HEADERS = {"Authorization": "Bearer mock-admin-token-2025"}
NGO_HEADERS = {"Authorization": "Bearer mock-ngo-token-2025"}

print("=== Step 1: Admin Publishes Surplus 'Fresh Hot Chapati' ===")
pub_res = httpx.post(
    f"{BASE_URL}/admin/surplus/publish",
    headers=ADMIN_HEADERS,
    json={
        "title": "Fresh Hot Chapati & Dal Makhani",
        "food_title": "Fresh Hot Chapati & Dal Makhani",
        "meals": 35,
        "meals_available": 35,
        "location_detail": "Hostel A Kitchen Bay 2 Ramp",
        "pickup_deadline": "Today, 4:30 PM",
        "temp_celsius": 68
    }
)
print("Publish Status:", pub_res.status_code)
assert pub_res.status_code == 201, pub_res.text
surplus = pub_res.json()
surplus_id = surplus["id"]
print(f"Published Surplus ID: {surplus_id}, Title: {surplus['title']}")

print("\n=== Step 2: NGO Claims & Assigns Rider 'Pranav' ===")
claim_res = httpx.post(
    f"{BASE_URL}/ngo/surplus/{surplus_id}/request",
    headers=NGO_HEADERS,
    json={
        "volunteer_name": "Pranav",
        "vehicle": "Electric Scooter (DL 3S PR 9021)",
        "eta": "Within 10 mins"
    }
)
print("Claim Status:", claim_res.status_code)
assert claim_res.status_code == 201, claim_res.text
claim_data = claim_res.json()
print(f"Claim Recorded! Request ID: {claim_data['id']}, Driver Assigned: {claim_data['volunteer_name']}")

print("\n=== Step 3: Admin Verifies GreenRoute Live Fleet Dispatches ===")
disp_res = httpx.get(f"{BASE_URL}/admin/greenroute/dispatches", headers=ADMIN_HEADERS)
print("Dispatches Status:", disp_res.status_code)
assert disp_res.status_code == 200, disp_res.text
dispatches = disp_res.json()["dispatches"]

pranav_disp = [d for d in dispatches if d["rider"]["name"].lower() == "pranav"]
print(f"Total Dispatches Found: {len(dispatches)}")
print(f"Dispatches with Rider 'Pranav': {len(pranav_disp)}")
assert len(pranav_disp) > 0, "Rider Pranav not found in GreenRoute dispatches!"
d = pranav_disp[0]
print(f"Found Rider Dispatch: ID={d['id']}, Rider={d['rider']['name']}, Plate={d['rider']['license_plate']}, Vehicle={d['rider']['vehicle_type']}, Batch={d['batch_title']}")

print("\n=== Step 4: Admin Verifies Active NGO Handover Queue ===")
req_res = httpx.get(f"{BASE_URL}/admin/requests", headers=ADMIN_HEADERS)
print("Requests Status:", req_res.status_code)
assert req_res.status_code == 200, req_res.text
requests = req_res.json()
pranav_req = [r for r in requests if r["volunteer_name"].lower() == "pranav"]
print(f"Total NGO Requests Found: {len(requests)}")
print(f"NGO Requests with Volunteer 'Pranav': {len(pranav_req)}")
assert len(pranav_req) > 0, "Rider Pranav not found in NGO handover requests!"
r = pranav_req[0]
print(f"Found Request: ID={r['id']}, Volunteer={r['volunteer_name']}, Vehicle={r['vehicle']}, Status={r['status']}, OTP={r['otp']}")

print("\n🎉 ALL TESTS PASSED! RIDER IS 100% CONNECTED BETWEEN NGO PORTAL AND ADMIN GREENROUTE FLEET!")
