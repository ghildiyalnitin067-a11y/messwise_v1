"""
Tests for Used Cooking Oil (UCO) Recycling & Carbon Footprint Calculation
=========================================================================
Covers:
1. Physical unit conversion (litres to kg using 0.92 kg/L density standard)
2. Transparent carbon footprint calculations across multiple repurposing pathways
3. Workflow transitions (Pending -> Collected -> Processed)
4. Partial processing and double-counting prevention
5. Validation and RBAC authorization (admin only)
6. Summary analytics and transparent methodology endpoints
"""
import pytest
from app.core.carbon_factors import (
    UCO_DENSITY_KG_PER_LITRE,
    normalize_to_kg,
    calculate_uco_carbon_savings,
    get_pathway_details
)


# =========================================================================
# 1. UNIT CONVERSION & DENSITY TESTS
# =========================================================================

def test_unit_conversion_litres_to_kg():
    """Verify litres to kg conversion using documented 0.92 kg/L density."""
    assert UCO_DENSITY_KG_PER_LITRE == 0.92

    # 100 litres of UCO = 92.0 kg
    assert normalize_to_kg(100.0, "litres") == 92.0
    # 50 litres = 46.0 kg
    assert normalize_to_kg(50.0, "litres") == 46.0
    assert normalize_to_kg(50.0, "L") == 46.0
    assert normalize_to_kg(50.0, "liter") == 46.0


def test_unit_conversion_kg_to_kg():
    """Verify that kg input remains unscaled."""
    assert normalize_to_kg(50.0, "kg") == 50.0
    assert normalize_to_kg(100.0, "kilograms") == 100.0


def test_unit_conversion_zero_or_negative():
    assert normalize_to_kg(0.0, "litres") == 0.0
    assert normalize_to_kg(-10.0, "litres") == 0.0


# =========================================================================
# 2. CARBON EMISSION FACTOR & CALCULATION TESTS
# =========================================================================

def test_carbon_savings_biodiesel_processed():
    """Test emissions avoidance for Biodiesel (factor = 2.65 kg CO2e / kg)."""
    co2, factor, basis, status, qty_kg = calculate_uco_carbon_savings(
        quantity=100.0,
        unit="litres",
        repurposing_method="Biodiesel Production",
        collection_status="Processed",
        destination="BioDiesel India Ltd",
        reference_number="REC-101"
    )
    # 100 L = 92.0 kg UCO -> 92.0 * 2.65 = 243.8 kg CO2e
    assert qty_kg == 92.0
    assert factor == 2.65
    assert co2 == round(92.0 * 2.65, 2)
    assert status == "Verified"
    assert "Biodiesel Production" in basis


def test_carbon_savings_soap_processed():
    """Test emissions avoidance for Industrial Soap (factor = 1.45 kg CO2e / kg)."""
    co2, factor, basis, status, qty_kg = calculate_uco_carbon_savings(
        quantity=50.0,
        unit="kg",
        repurposing_method="Industrial Soap & Bio-lubricants",
        collection_status="Processed",
        destination="EcoSoap Plant",
        reference_number="REC-202"
    )
    # 50 kg UCO -> 50 * 1.45 = 72.5 kg CO2e
    assert qty_kg == 50.0
    assert factor == 1.45
    assert co2 == 72.5
    assert status == "Verified"


def test_carbon_savings_biogas_processed():
    """Test emissions avoidance for Biogas (factor = 1.80 kg CO2e / kg)."""
    co2, factor, basis, status, qty_kg = calculate_uco_carbon_savings(
        quantity=50.0,
        unit="litres",
        repurposing_method="Biogas & Biomass",
        collection_status="Processed"
    )
    # 50 L = 46.0 kg UCO -> 46.0 * 1.80 = 82.8 kg CO2e
    assert qty_kg == 46.0
    assert factor == 1.80
    assert co2 == 82.8
    # No reference number -> Estimated
    assert status == "Estimated"


def test_pending_and_collected_yield_zero_savings():
    """Pending or Collected statuses MUST NOT claim carbon savings."""
    for st in ["Pending", "Collected"]:
        co2, factor, basis, status, qty_kg = calculate_uco_carbon_savings(
            quantity=100.0,
            unit="litres",
            repurposing_method="Biodiesel Production",
            collection_status=st
        )
        assert co2 == 0.0
        assert factor is None
        assert status == "Awaiting Processing"
        assert f"Zero savings counted ({st} status" in basis


def test_unverified_pathway_shows_pending_factor():
    """If a defensible emission factor is unavailable, show pending message."""
    co2, factor, basis, status, qty_kg = calculate_uco_carbon_savings(
        quantity=50.0,
        unit="litres",
        repurposing_method="Unspecified Novel Disposal",
        collection_status="Processed"
    )
    assert co2 is None
    assert factor is None
    assert status == "Pending Factor Verification"
    assert "Carbon savings pending verified emission factor" in basis


# =========================================================================
# 3. END-TO-END RECYCLING WORKFLOW & API TESTS
# =========================================================================

@pytest.mark.asyncio
async def test_full_uco_lifecycle_workflow(client):
    """
    Tests complete workflow:
    1. Admin creates Pending record
    2. Admin assigns partner & transitions to Collected
    3. Admin transitions to Processed -> carbon calculated
    4. Verify persistence and non-double-counting
    """
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Step 1: Create Pending record (40 Litres)
    create_res = await client.post(
        "/api/v1/uco",
        json={
            "quantity": 40.0,
            "unit": "litres",
            "oil_type": "Sunflower Oil",
            "collection_status": "Pending",
            "remarks": "Decanted from deep fryers after Sunday brunch"
        },
        headers=headers
    )
    assert create_res.status_code == 201
    record = create_res.json()
    record_id = record["id"]
    assert record["collection_status"] == "Pending"
    assert record["co2_avoided_kg"] == 0.0
    assert record["quantity_kg"] == 36.8  # 40 * 0.92

    # Step 2: Transition to Collected
    trans_res1 = await client.post(
        f"/api/v1/uco/{record_id}/transition",
        json={
            "target_status": "Collected",
            "destination": "BioDiesel India Refineries",
            "reference_number": "DISP-LOG-881"
        },
        headers=headers
    )
    assert trans_res1.status_code == 200
    updated1 = trans_res1.json()
    assert updated1["collection_status"] == "Collected"
    assert updated1["destination"] == "BioDiesel India Refineries"
    assert updated1["co2_avoided_kg"] == 0.0  # Still no carbon credit until processed

    # Step 3: Transition to Processed
    trans_res2 = await client.post(
        f"/api/v1/uco/{record_id}/transition",
        json={
            "target_status": "Processed",
            "repurposing_method": "Biodiesel Production",
            "reference_number": "PROC-CERT-992"
        },
        headers=headers
    )
    assert trans_res2.status_code == 200
    updated2 = trans_res2.json()
    assert updated2["collection_status"] == "Processed"
    # 40 L = 36.8 kg * 2.65 = 97.52 kg CO2e
    assert updated2["co2_avoided_kg"] == pytest.approx(97.52, 0.1)
    assert updated2["emission_factor_used"] == 2.65
    assert updated2["measurement_status"] == "Verified"


@pytest.mark.asyncio
async def test_partial_processing_no_double_counting(client):
    """
    Test partial processing:
    Out of a 60 Litre batch, 25 Litres are processed first.
    Remaining 35 Litres stay Collected/Pending.
    Emissions avoided are credited ONLY for the 25 Litres.
    """
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create 60L batch
    create_res = await client.post(
        "/api/v1/uco",
        json={
            "quantity": 60.0,
            "unit": "litres",
            "oil_type": "Mustard Oil",
            "collection_status": "Collected",
            "destination": "EcoGrease Solutions"
        },
        headers=headers
    )
    assert create_res.status_code == 201
    parent_id = create_res.json()["id"]

    # Partial transition: process 25 Litres
    partial_res = await client.post(
        f"/api/v1/uco/{parent_id}/transition",
        json={
            "target_status": "Processed",
            "quantity_to_transition": 25.0,
            "repurposing_method": "Industrial Soap & Bio-lubricants",
            "reference_number": "SOAP-PART-01"
        },
        headers=headers
    )
    assert partial_res.status_code == 200
    processed_child = partial_res.json()
    assert processed_child["quantity"] == 25.0
    assert processed_child["collection_status"] == "Processed"
    # 25 L = 23.0 kg * 1.45 = 33.35 kg CO2e
    assert processed_child["co2_avoided_kg"] == pytest.approx(33.35, 0.1)

    # Check parent record remains with 35.0 Litres
    parent_check = await client.get(f"/api/v1/uco/{parent_id}")
    assert parent_check.status_code == 200
    parent = parent_check.json()
    assert parent["quantity"] == 35.0
    assert parent["collection_status"] == "Collected"
    assert parent["co2_avoided_kg"] == 0.0  # Unprocessed portion earns no credit


@pytest.mark.asyncio
async def test_input_validation_and_access_control(client):
    """
    Test that:
    1. Non-admin users cannot record/modify oil records.
    2. Zero or negative quantities are rejected.
    3. Invalid units are rejected.
    """
    # 1. Unauthenticated creation -> 401
    res_no_auth = await client.post("/api/v1/uco", json={"quantity": 20.0, "unit": "litres"})
    assert res_no_auth.status_code in [401, 403]

    # Student login -> 403 Forbidden
    student_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "nitin.sharma@campus.edu", "password": "student123", "role": "student"}
    )
    st_token = student_login.json()["access_token"]
    res_student = await client.post(
        "/api/v1/uco",
        json={"quantity": 20.0, "unit": "litres"},
        headers={"Authorization": f"Bearer {st_token}"}
    )
    assert res_student.status_code == 403

    # Admin login
    admin_login = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@campus.edu", "password": "admin123", "role": "admin"}
    )
    adm_token = admin_login.json()["access_token"]
    adm_headers = {"Authorization": f"Bearer {adm_token}"}

    # 2. Negative quantity -> 422
    res_neg = await client.post(
        "/api/v1/uco",
        json={"quantity": -15.0, "unit": "litres"},
        headers=adm_headers
    )
    assert res_neg.status_code == 422

    # 3. Invalid unit -> 422
    res_bad_unit = await client.post(
        "/api/v1/uco",
        json={"quantity": 15.0, "unit": "gallons"},
        headers=adm_headers
    )
    assert res_bad_unit.status_code == 422


@pytest.mark.asyncio
async def test_uco_summary_and_methodology(client):
    """Verify aggregated summary KPIs, monthly trends, and transparent methodology."""
    # Summary endpoint
    res_summary = await client.get("/api/v1/uco/summary")
    assert res_summary.status_code == 200
    summary = res_summary.json()
    assert "total_oil_generated_litres" in summary
    assert "total_oil_processed_litres" in summary
    assert "estimated_net_co2e_avoided_kg" in summary
    assert "monthly_trends" in summary
    assert "status_distribution" in summary
    assert "safety_guidelines" in summary
    assert summary["oil_density_kg_per_litre"] == 0.92

    # Methodology endpoint
    res_meth = await client.get("/api/v1/uco/methodology")
    assert res_meth.status_code == 200
    meth = res_meth.json()
    assert meth["density_standard_kg_per_litre"] == 0.92
    assert "Biodiesel Production" in meth["pathways"]
    assert meth["pathways"]["Biodiesel Production"]["net_factor"] == 2.65
