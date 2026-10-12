import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User, StudentProfile, AdminProfile, NgoProfile
from app.models.hostel import Hostel
from app.models.meal import MealSchedule, MealBooking, MealFeedback, DailyProductionLog
from app.models.surplus import SurplusListing, SurplusRequest, DistributionRecord
from app.models.waste import WasteRecord
from app.models.demand import NgoDemand, ForecastRecord
from app.models.impact import ImpactEvent
from app.models.uco import UcoRecord
from app.core.security import get_password_hash


async def seed_uco_if_empty(db: AsyncSession):
    existing_uco = await db.execute(select(UcoRecord).limit(1))
    if existing_uco.scalar_one_or_none() is not None:
        return

    today = datetime.date.today()
    uco_records = [
        UcoRecord(
            id="uco-seed-01",
            recorded_by="Rajesh Kumar",
            disposal_date=today - datetime.timedelta(days=12),
            quantity=45.0,
            unit="litres",
            quantity_kg=41.4,
            collected_qty=45.0,
            processed_qty=45.0,
            oil_type="Sunflower Oil",
            destination="BioDiesel India Refineries Ltd.",
            repurposing_method="Biodiesel Production",
            collection_status="Processed",
            co2_avoided_kg=109.71,
            emission_factor_used=2.65,
            calculation_basis="41.40 kg UCO processed via Biodiesel Production (UCOME) x 2.65 kg CO2e/kg net factor (EU RED II Directive (2018/2001/EC) Annex V & ICCT Life-Cycle Assessment)",
            measurement_status="Verified",
            reference_number="BIO-DEL-2025-084",
            remarks="Batch certified moisture-free. Saponification value and acid value passed FSSAI standards."
        ),
        UcoRecord(
            id="uco-seed-02",
            recorded_by="Rajesh Kumar",
            disposal_date=today - datetime.timedelta(days=5),
            quantity=30.0,
            unit="litres",
            quantity_kg=27.6,
            collected_qty=30.0,
            processed_qty=0.0,
            oil_type="Mustard Oil",
            destination="EcoGrease Solutions Pvt Ltd",
            repurposing_method="Industrial Soap & Bio-lubricants",
            collection_status="Collected",
            co2_avoided_kg=0.0,
            emission_factor_used=None,
            calculation_basis="Zero savings counted (Collected status; only confirmed Processed quantities earn carbon credit)",
            measurement_status="Awaiting Processing",
            reference_number="ECO-COLL-912",
            remarks="Collected by aggregator truck DL-1L-4412. Holding in regional processing staging facility."
        ),
        UcoRecord(
            id="uco-seed-03",
            recorded_by="Rajesh Kumar",
            disposal_date=today,
            quantity=18.0,
            unit="litres",
            quantity_kg=16.56,
            collected_qty=0.0,
            processed_qty=0.0,
            oil_type="Mixed Frying Oil",
            destination="BioDiesel India Refineries Ltd.",
            repurposing_method="Biodiesel Production",
            collection_status="Pending",
            co2_avoided_kg=0.0,
            emission_factor_used=None,
            calculation_basis="Zero savings counted (Pending status; only confirmed Processed quantities earn carbon credit)",
            measurement_status="Awaiting Processing",
            reference_number=None,
            remarks="Cooled below 35 deg C and decanted into sealed blue HDPE drum #2 in dry storage bay."
        ),
    ]
    db.add_all(uco_records)
    await db.commit()


async def seed_initial_data(db: AsyncSession):
    # Ensure UCO table seeded if empty
    await seed_uco_if_empty(db)

    # Check if data already seeded
    existing_user = await db.execute(select(User).limit(1))
    if existing_user.scalar_one_or_none() is not None:
        await seed_analytics_historical_data(db)
        return

    # 1. Create Default Hostel
    hostel_a = Hostel(
        id="h-hostel-a",
        name="Hostel A - Aryabhatta Central Mess",
        campus_block="North Campus, Block A",
        enrolled_boarders=650,
        capacity=800
    )
    db.add(hostel_a)
    await db.flush()

    # 2. Create Users & Profiles
    # 2a. Student User (Nitin Sharma)
    student_user = User(
        id="usr-student-01",
        username="2022CSB042",
        email="nitin.sharma@campus.edu",
        hashed_password=get_password_hash("student123"),
        role="student",
        is_active=True
    )
    db.add(student_user)
    await db.flush()

    student_profile = StudentProfile(
        id="sp-student-01",
        user_id=student_user.id,
        name="Nitin Sharma",
        roll_no="2022CSB042",
        enrollment_no="2022CSB042",
        father_name_hash=get_password_hash("Ramesh Sharma"),
        hostel_id=hostel_a.id,
        room="B-304",
        avatar="👨‍🎓",
        diet="Vegetarian",
        meals_booked=82,
        meals_saved=14,
        co2_avoided_kg=24.0,
        rank=12,
        notifications=True
    )
    db.add(student_profile)

    # 2b. Mess Admin User (Rajesh Kumar)
    admin_user = User(
        id="usr-admin-01",
        username="admin",
        email="admin@campus.edu",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True
    )
    db.add(admin_user)
    await db.flush()

    admin_profile = AdminProfile(
        id="ap-admin-01",
        user_id=admin_user.id,
        name="Rajesh Kumar",
        username="admin",
        hostel_id=hostel_a.id,
        phone="+91 98110 44321"
    )
    db.add(admin_profile)

    # 2c. NGO User (Helping Hands NGO)
    ngo_user = User(
        id="usr-ngo-01",
        username="helpinghands",
        email="helpinghands@ngo.org",
        hashed_password=get_password_hash("ngo123"),
        role="ngo",
        is_active=True
    )
    db.add(ngo_user)
    await db.flush()

    ngo_profile = NgoProfile(
        id="ngo-helping-hands",
        user_id=ngo_user.id,
        name="Helping Hands NGO",
        organization_name="Helping Hands NGO",
        tagline="Together we can eliminate hunger",
        contact_person="Dr. Sunita Rao",
        phone="+91 98450 12345",
        fssai_verified=True,
        total_meals_rescued=4320,
        people_served=4190,
        co2_diverted_kg=648.0
    )
    db.add(ngo_profile)
    await db.flush()

    # 3. Create Today's Meal Schedules
    today = datetime.date.today()
    s_bkf = MealSchedule(
        id="sched-bkf-today",
        hostel_id=hostel_a.id,
        date=today,
        session="breakfast",
        menu="Poha + Milk + Banana",
        time_window="7:00 AM - 9:00 AM"
    )
    s_lch = MealSchedule(
        id="sched-lch-today",
        hostel_id=hostel_a.id,
        date=today,
        session="lunch",
        menu="Rajma + Jeera Rice + Roti + Salad",
        time_window="12:00 PM - 2:00 PM"
    )
    s_din = MealSchedule(
        id="sched-din-today",
        hostel_id=hostel_a.id,
        date=today,
        session="dinner",
        menu="Paneer Butter Masala + Roti + Dal",
        time_window="7:00 PM - 9:00 PM"
    )
    db.add_all([s_bkf, s_lch, s_din])
    await db.flush()

    # 4. Create Today's Student Bookings
    b_bkf = MealBooking(
        id="b-bkf-01",
        student_id=student_profile.id,
        schedule_id=s_bkf.id,
        date=today,
        meal_session="breakfast",
        item_summary="Poha + Milk + Banana",
        status="Booked",
        token="BKF-892"
    )
    b_lch = MealBooking(
        id="b-lch-01",
        student_id=student_profile.id,
        schedule_id=s_lch.id,
        date=today,
        meal_session="lunch",
        item_summary="Rajma + Jeera Rice + Roti + Salad",
        status="Booked",
        token="LCH-419"
    )
    db.add_all([b_bkf, b_lch])

    # 5. Production Log
    prod_log = DailyProductionLog(
        id="prod-01",
        hostel_id=hostel_a.id,
        date=today,
        meal_session="Lunch",
        prepared_qty=842,
        served_qty=817,
        surplus_qty=25,
        waste_qty=6,
        notes="Standard optimal batch"
    )
    db.add(prod_log)

    # 6. Waste Records for 7x3 Weekly Heatmap
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    waste_samples = [
        ("Breakfast", 4.2, 1.2, 2.0),
        ("Lunch", 8.5, 3.1, 4.2),
        ("Dinner", 12.4, 4.8, 6.2),
    ]
    for dow in days:
        for sess, p_w, u_s, pl_w in waste_samples:
            w_rec = WasteRecord(
                hostel_id=hostel_a.id,
                date=today,
                meal_session=sess,
                day_of_week=dow,
                prep_waste_kg=p_w,
                unserved_surplus_kg=u_s,
                plate_waste_kg=pl_w,
                total_waste_kg=round(p_w + u_s + pl_w, 2),
                notes=f"Automated logging for {dow} {sess}"
            )
            db.add(w_rec)

    # 7. Surplus Listings
    surplus_1 = SurplusListing(
        id="surplus-1",
        hostel_id=hostel_a.id,
        title="Rajma Rice",
        meals=25,
        location_detail="Hostel A Dining Hall, Counter 2",
        distance_km=2.3,
        pickup_deadline="4:00 PM",
        time_remaining="1h 45m left",
        status="Published",
        temp_celsius=64,
        storage_condition="Insulated Stainless Steel Warmer",
        food_type="Cooked Main Course (Vegetarian)",
        fssai_safety_passed=True,
        dietary="Vegetarian",
        image_url="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80",
        pickup_otp="7412"
    )
    surplus_2 = SurplusListing(
        id="surplus-2",
        hostel_id=hostel_a.id,
        title="Roti + Dal Makhani",
        meals=40,
        location_detail="Hostel A Kitchen Bay, Gate 3",
        distance_km=3.1,
        pickup_deadline="5:00 PM",
        time_remaining="2h 45m left",
        status="Published",
        temp_celsius=68,
        storage_condition="Insulated Casseroles",
        food_type="Cooked Bread & Gravy (Vegetarian)",
        fssai_safety_passed=True,
        dietary="Vegetarian",
        image_url="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80",
        pickup_otp="3829"
    )
    db.add_all([surplus_1, surplus_2])

    # 8. NGO Shelter Demand Registrations
    dem_1 = NgoDemand(
        id="dem-01",
        ngo_id=ngo_profile.id,
        shelter_name="Asha Jyoti Children Home",
        people_count=45,
        food_preference="Vegetarian",
        required_before="5:30 PM",
        location="Sector 14 Community Hall",
        status="Active",
        notes="Dinner support needed for 45 children"
    )
    dem_2 = NgoDemand(
        id="dem-02",
        ngo_id=ngo_profile.id,
        shelter_name="Kalyanpuri Night Shelter",
        people_count=80,
        food_preference="Vegetarian",
        required_before="6:30 PM",
        location="Gate 4 Underpass Shelter",
        status="Active",
        notes="Main course rice & bread prefered"
    )
    db.add_all([dem_1, dem_2])

    # 9. Active Surplus Request
    s_req = SurplusRequest(
        id="req-101",
        surplus_id=surplus_1.id,
        ngo_id=ngo_profile.id,
        volunteer_name="Rakesh Verma",
        vehicle="Electric Van (DL-04-EV-8821)",
        eta="Within 25 mins",
        status="Approved",
        otp="7412"
    )
    db.add(s_req)

    # 10. Distribution Records
    dist_1 = DistributionRecord(
        id="dist-201",
        ngo_id=ngo_profile.id,
        food_title="Kadhi Pakoda + Rice",
        beneficiaries_served=35,
        location="Kalyanpuri Labor Shelter",
        co2_diverted_kg=15.75,
        proof_status="Verified"
    )
    db.add(dist_1)

    # 11. Impact Events Timeline
    events = [
        ImpactEvent(
            event_type="MEAL_PREPARED",
            title="842 meals prepared for Lunch service",
            description="Production completed at Hostel A Central Mess Kitchen.",
            quantity=842,
            actor_role="admin",
            actor_name="Rajesh Kumar",
            hostel_id=hostel_a.id
        ),
        ImpactEvent(
            event_type="MEAL_SERVED",
            title="817 meals served to students",
            description="Actual consumption recorded with 25 unserved surplus portions.",
            quantity=817,
            actor_role="admin",
            actor_name="Rajesh Kumar",
            hostel_id=hostel_a.id
        ),
        ImpactEvent(
            event_type="SURPLUS_DETECTED",
            title="25 surplus meals identified for rescue",
            description="Rajma Rice meets warm holding standards and certified safe for redistribution.",
            quantity=25,
            actor_role="system",
            actor_name="MessWise Sensor Hub",
            hostel_id=hostel_a.id
        ),
        ImpactEvent(
            event_type="SURPLUS_CLAIMED",
            title="25 meals claimed by Helping Hands NGO",
            description="Volunteer Rakesh Verma dispatched with Electric Van. Handover OTP: 7412.",
            quantity=25,
            actor_role="ngo",
            actor_name="Helping Hands NGO",
            ngo_id=ngo_profile.id
        ),
        ImpactEvent(
            event_type="HANDOVER_VERIFIED",
            title="25 meals handed over to NGO team",
            description="Secure 4-digit OTP verified at kitchen dispatch counter.",
            quantity=25,
            actor_role="admin",
            actor_name="Rajesh Kumar",
            ngo_id=ngo_profile.id
        ),
        ImpactEvent(
            event_type="FOOD_DISTRIBUTED",
            title="35 beneficiaries served at Kalyanpuri Shelter",
            description="Hunger relief distribution completed. 15.75 kg CO₂ diverted from landfills.",
            quantity=35,
            actor_role="ngo",
            actor_name="Helping Hands NGO",
            ngo_id=ngo_profile.id,
            co2_saved_kg=15.75
        )
    ]
    db.add_all(events)

    await db.commit()

    # Seed analytics multi-day history
    await seed_analytics_historical_data(db)


async def seed_analytics_historical_data(db: AsyncSession):
    """
    Seeds a realistic 45-day operational history across all dining modules:
    - DailyProductionLogs & WasteRecords (food prepared, served, plate & prep waste)
    - ForecastRecords (expected vs actual attendance, confidence, ML residuals)
    - MealBookings across sessions and booking statuses
    - SurplusListings, SurplusRequests & DistributionRecords for NGO partners
    - Multi-month UCO records (Processed, Collected, Pending) with verified LCA factors
    """
    existing_forecast = await db.execute(select(ForecastRecord).limit(5))
    if len(existing_forecast.scalars().all()) >= 5:
        return

    today = datetime.date.today()
    hostel_stmt = select(Hostel).limit(1)
    hostel_res = await db.execute(hostel_stmt)
    hostel = hostel_res.scalar_one_or_none()
    hostel_id = hostel.id if hostel else "h-hostel-a"

    # Get student profile
    sp_stmt = select(StudentProfile).limit(1)
    sp_res = await db.execute(sp_stmt)
    student = sp_res.scalar_one_or_none()
    student_id = student.id if student else "sp-student-01"

    # Check / Create additional NGOs for rich partner analytics
    ngo_stmt = select(NgoProfile).where(NgoProfile.id == "ngo-robin-hood")
    ngo_res = await db.execute(ngo_stmt)
    if ngo_res.scalar_one_or_none() is None:
        u_robin = User(
            id="usr-ngo-02",
            username="robinhoodarmy",
            email="delhi@robinhoodarmy.com",
            hashed_password=get_password_hash("ngo123"),
            role="ngo",
            is_active=True
        )
        p_robin = NgoProfile(
            id="ngo-robin-hood",
            user_id=u_robin.id,
            name="Robin Hood Army Delhi",
            organization_name="Robin Hood Army Delhi",
            tagline="Zero Funds, 100% Volunteer Network",
            contact_person="Aman Verma",
            phone="+91 98101 22334",
            fssai_verified=True,
            total_meals_rescued=3120,
            people_served=3050,
            co2_diverted_kg=468.0
        )
        u_feeding = User(
            id="usr-ngo-03",
            username="feedingindia",
            email="connect@feedingindia.org",
            hashed_password=get_password_hash("ngo123"),
            role="ngo",
            is_active=True
        )
        p_feeding = NgoProfile(
            id="ngo-feeding-india",
            user_id=u_feeding.id,
            name="Feeding India Foundation",
            organization_name="Feeding India Foundation",
            tagline="Hunger-Free Campuses and Cities",
            contact_person="Priya Malhotra",
            phone="+91 98202 33445",
            fssai_verified=True,
            total_meals_rescued=5280,
            people_served=5120,
            co2_diverted_kg=792.0
        )
        db.add_all([u_robin, p_robin, u_feeding, p_feeding])
        await db.flush()

    prod_logs = []
    waste_recs = []
    forecast_recs = []
    bookings = []
    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    for days_ago in range(45, -1, -1):
        cur_date = today - datetime.timedelta(days=days_ago)
        dow = days_of_week[cur_date.weekday()]
        is_weekend = cur_date.weekday() in [5, 6]
        dow_factor = 0.82 if is_weekend else (1.05 if cur_date.weekday() == 2 else 0.98)

        sessions_data = [
            ("breakfast", 480, 0.92, 4.2, 1.2, 2.0, "Poha / Idli / Paratha"),
            ("lunch", 560, 0.96, 8.5, 3.1, 4.2, "Rajma Rice / Chole / Kadhi"),
            ("dinner", 520, 0.94, 11.2, 4.0, 5.8, "Paneer Butter / Dal Tadka / Roti"),
        ]
        if not is_weekend and days_ago % 2 == 0:
            sessions_data.append(("snacks", 340, 0.88, 2.8, 0.9, 1.4, "Tea + Samosa / Pakoda"))

        for sess_name, base_expected, turnout_pct, base_pw, base_us, base_plw, menu_item in sessions_data:
            noise = ((days_ago * 7 + len(sess_name)) % 17) - 8
            expected = int(base_expected * dow_factor + noise)
            actual_atten = int(expected * (turnout_pct + (((days_ago % 5) - 2) * 0.01)))
            recommended_cook = expected + 15
            err = abs(expected - actual_atten)

            f_rec = ForecastRecord(
                id=f"f-hist-{cur_date.strftime('%Y%m%d')}-{sess_name}",
                hostel_id=hostel_id,
                target_date=cur_date,
                meal_session=sess_name.capitalize(),
                expected_attendance=expected,
                recommended_prep=recommended_cook,
                safety_buffer=15,
                confidence_score=round(0.93 + ((days_ago % 7) * 0.006), 3),
                model_name="XGBoost Regressor v2.1",
                actual_attendance=actual_atten,
                error_abs=err,
                created_at=datetime.datetime.combine(cur_date, datetime.time(6, 0), tzinfo=datetime.timezone.utc)
            )
            forecast_recs.append(f_rec)

            if sess_name in ["lunch", "dinner"]:
                served = actual_atten
                prep_qty = recommended_cook
                surplus = max(0, prep_qty - served - max(2, int((days_ago % 6) + 2)))
                waste_q = max(3, prep_qty - served - surplus)
                p_log = DailyProductionLog(
                    id=f"prod-hist-{cur_date.strftime('%Y%m%d')}-{sess_name}",
                    hostel_id=hostel_id,
                    date=cur_date,
                    meal_session=sess_name.capitalize(),
                    prepared_qty=prep_qty,
                    served_qty=served,
                    surplus_qty=surplus,
                    waste_qty=waste_q,
                    notes=f"Daily batch run for {cur_date.strftime('%d %b')} {sess_name.capitalize()}",
                    logged_at=datetime.datetime.combine(cur_date, datetime.time(14 if sess_name == 'lunch' else 21, 30), tzinfo=datetime.timezone.utc)
                )
                prod_logs.append(p_log)

            w_mult = 1.0 - (0.22 if days_ago < 20 else 0.0)
            p_w = round((base_pw + ((days_ago % 4) * 0.3)) * w_mult, 2)
            u_s = round((base_us + ((days_ago % 3) * 0.2)) * w_mult, 2)
            pl_w = round((base_plw + ((days_ago % 5) * 0.25)) * w_mult, 2)
            tot_w = round(p_w + u_s + pl_w, 2)

            w_rec = WasteRecord(
                id=f"w-hist-{cur_date.strftime('%Y%m%d')}-{sess_name}",
                hostel_id=hostel_id,
                date=cur_date,
                meal_session=sess_name.capitalize(),
                day_of_week=dow,
                prep_waste_kg=p_w,
                unserved_surplus_kg=u_s,
                plate_waste_kg=pl_w,
                total_waste_kg=tot_w,
                notes=f"Kitchen log for {dow} {sess_name.capitalize()}",
                logged_at=datetime.datetime.combine(cur_date, datetime.time(22, 0), tzinfo=datetime.timezone.utc)
            )
            waste_recs.append(w_rec)

            if days_ago > 0:
                if days_ago % 3 == 0:
                    bk = MealBooking(
                        id=f"mb-hist-{cur_date.strftime('%Y%m%d')}-{sess_name}-1",
                        student_id=student_id,
                        date=cur_date,
                        meal_session=sess_name,
                        item_summary=menu_item,
                        status="Served",
                        token=f"TKN-{cur_date.strftime('%d%m')}-{sess_name[:3].upper()}",
                        booked_at=datetime.datetime.combine(cur_date, datetime.time(7, 0), tzinfo=datetime.timezone.utc)
                    )
                    bookings.append(bk)
                if days_ago % 7 == 2:
                    bk_opt = MealBooking(
                        id=f"mb-hist-{cur_date.strftime('%Y%m%d')}-{sess_name}-opt",
                        student_id=student_id,
                        date=cur_date,
                        meal_session=sess_name,
                        item_summary=menu_item,
                        status="OptedOut",
                        token=None,
                        booked_at=datetime.datetime.combine(cur_date, datetime.time(6, 30), tzinfo=datetime.timezone.utc)
                    )
                    bookings.append(bk_opt)
                if days_ago % 11 == 1:
                    bk_can = MealBooking(
                        id=f"mb-hist-{cur_date.strftime('%Y%m%d')}-{sess_name}-can",
                        student_id=student_id,
                        date=cur_date,
                        meal_session=sess_name,
                        item_summary=menu_item,
                        status="Cancelled",
                        token=None,
                        booked_at=datetime.datetime.combine(cur_date, datetime.time(6, 45), tzinfo=datetime.timezone.utc)
                    )
                    bookings.append(bk_can)

    db.add_all(forecast_recs)
    db.add_all(prod_logs)
    db.add_all(waste_recs)
    db.add_all(bookings)

    ngo_history = [
        ("ngo-helping-hands", "Rajma Chawal Feast", 35, 12, "Sector 14 Community Shelter", 15.75, 45),
        ("ngo-robin-hood", "Dal Makhani & Roti", 50, 18, "Mayur Vihar Night Shelter", 22.50, 35),
        ("ngo-feeding-india", "Mix Veg Biryani", 65, 24, "Anand Vihar Transit Center", 29.25, 40),
        ("ngo-helping-hands", "Chole Bhature & Rice", 40, 8, "Kalyanpuri Labor Colony", 18.00, 30),
        ("ngo-robin-hood", "Kadhi Pakoda & Jeera Rice", 45, 15, "Yamuna Pushta Relief Bay", 20.25, 50),
        ("ngo-feeding-india", "Paneer Bhurji & Chapati", 55, 3, "East Campus Food Bank", 24.75, 25),
        ("ngo-helping-hands", "Aloo Gobi & Dal Tadka", 30, 2, "Sarai Kale Khan Shelter", 13.50, 35),
    ]

    for idx, (ngo_id_val, title, meals_cnt, days_prior, loc, co2_kg, pickup_mins) in enumerate(ngo_history):
        d_date = today - datetime.timedelta(days=days_prior)
        s_list = SurplusListing(
            id=f"surplus-hist-{idx}",
            hostel_id=hostel_id,
            title=title,
            meals=meals_cnt,
            location_detail="Hostel A Dispatch Counter",
            distance_km=2.5,
            pickup_deadline=d_date.strftime("%I:%M %p"),
            time_remaining="Completed",
            status="Distributed",
            prep_time="Recorded Batch",
            temp_celsius=65,
            storage_condition="Insulated Casseroles",
            food_type="Hot Main Course",
            fssai_safety_passed=True,
            dietary="Vegetarian",
            pickup_otp=f"{3000 + idx}",
            created_at=datetime.datetime.combine(d_date, datetime.time(14, 0), tzinfo=datetime.timezone.utc)
        )
        s_req = SurplusRequest(
            id=f"req-hist-{idx}",
            surplus_id=s_list.id,
            ngo_id=ngo_id_val,
            volunteer_name=f"Volunteer {idx+1}",
            vehicle="Electric Rescue Van",
            eta=f"{pickup_mins} mins",
            status="Collected",
            otp=f"{3000 + idx}",
            requested_at=datetime.datetime.combine(d_date, datetime.time(14, 15), tzinfo=datetime.timezone.utc),
            collected_at=datetime.datetime.combine(d_date, datetime.time(14, 15), tzinfo=datetime.timezone.utc) + datetime.timedelta(minutes=pickup_mins)
        )
        dist_rec = DistributionRecord(
            id=f"dist-hist-{idx}",
            ngo_id=ngo_id_val,
            food_title=title,
            beneficiaries_served=meals_cnt,
            location=loc,
            proof_status="Verified",
            co2_diverted_kg=co2_kg,
            delivered_at=datetime.datetime.combine(d_date, datetime.time(16, 0), tzinfo=datetime.timezone.utc),
            notes=f"Distribution completed within {pickup_mins} mins from kitchen dispatch."
        )
        db.add_all([s_list, s_req, dist_rec])

    uco_entries = [
        UcoRecord(
            id="uco-hist-01",
            recorded_by="Rajesh Kumar",
            disposal_date=today - datetime.timedelta(days=65),
            quantity=55.0,
            unit="litres",
            quantity_kg=50.6,
            collected_qty=55.0,
            processed_qty=55.0,
            oil_type="Sunflower Oil",
            destination="BioDiesel India Refineries Ltd.",
            repurposing_method="Biodiesel Production",
            collection_status="Processed",
            co2_avoided_kg=134.09,
            emission_factor_used=2.65,
            calculation_basis="50.60 kg UCO x 2.65 kg CO2e/kg (EU RED II Annex V LCA)",
            measurement_status="Verified",
            reference_number="BIO-JUL-2025-019",
            remarks="Batch verified by laboratory QA certificate."
        ),
        UcoRecord(
            id="uco-hist-02",
            recorded_by="Rajesh Kumar",
            disposal_date=today - datetime.timedelta(days=38),
            quantity=40.0,
            unit="litres",
            quantity_kg=36.8,
            collected_qty=40.0,
            processed_qty=40.0,
            oil_type="Mustard Oil",
            destination="EcoGrease Solutions Pvt Ltd",
            repurposing_method="Industrial Soap & Bio-lubricants",
            collection_status="Processed",
            co2_avoided_kg=53.36,
            emission_factor_used=1.45,
            calculation_basis="36.80 kg UCO x 1.45 kg CO2e/kg (Cleaner Production LCA)",
            measurement_status="Verified",
            reference_number="ECO-AUG-2025-055",
            remarks="Dispatched to Kanpur saponification plant."
        ),
        UcoRecord(
            id="uco-hist-03",
            recorded_by="Rajesh Kumar",
            disposal_date=today - datetime.timedelta(days=22),
            quantity=35.0,
            unit="litres",
            quantity_kg=32.2,
            collected_qty=35.0,
            processed_qty=35.0,
            oil_type="Soybean Oil",
            destination="CleanBio Fuels Delhi",
            repurposing_method="Hydrotreated Vegetable Oil (HVO / SAF)",
            collection_status="Processed",
            co2_avoided_kg=91.77,
            emission_factor_used=2.85,
            calculation_basis="32.20 kg UCO x 2.85 kg CO2e/kg (ICAO CORSIA HVO standard)",
            measurement_status="Verified",
            reference_number="CBF-SEP-2025-102",
            remarks="Hydrotreating feedstock consignment."
        ),
        UcoRecord(
            id="uco-hist-04",
            recorded_by="Rajesh Kumar",
            disposal_date=today - datetime.timedelta(days=8),
            quantity=28.0,
            unit="litres",
            quantity_kg=25.76,
            collected_qty=28.0,
            processed_qty=0.0,
            oil_type="Sunflower Oil",
            destination="BioDiesel India Refineries Ltd.",
            repurposing_method="Biodiesel Production",
            collection_status="Collected",
            co2_avoided_kg=0.0,
            emission_factor_used=None,
            calculation_basis="Zero savings counted (Collected status; awaiting processing proof)",
            measurement_status="Awaiting Processing",
            reference_number="BIO-OCT-2025-004",
            remarks="Collected by tanker DL-1L-8822."
        )
    ]
    db.add_all(uco_entries)
    await db.commit()
