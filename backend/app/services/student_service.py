import random
from typing import Optional, List, Dict
from datetime import datetime, date, timezone, timedelta
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.meal import MealSchedule, MealBooking, MealFeedback
from app.models.user import StudentProfile
from app.models.hostel import Hostel
from app.services.impact_service import impact_service
from app.ml.stock_analysis_engine import stock_engine
from app.schemas.student import (
    TodayMealsResponse,
    WeeklyMenuResponse,
    WeeklyDayMenu,
    MealItemOut,
    ToggleBookingRequest,
    ToggleBookingResponse,
    FeedbackRequest,
    FeedbackResponse,
    BookingHistoryResponse,
    BookingHistoryItem,
    StudentImpactResponse,
    StudentLeaderboardResponse,
    StudentLeaderboardEntry,
    PointsEarnRequest,
    PointsEarnResponse
)


class StudentService:
    async def get_today_meals(self, db: AsyncSession, student_id: Optional[str] = None) -> TodayMealsResponse:
        today = date.today()

        stmt = select(MealSchedule).where(MealSchedule.date == today)
        result = await db.execute(stmt)
        schedules = result.scalars().all()

        bookings_map = {}
        if student_id:
            b_stmt = select(MealBooking).where(
                MealBooking.student_id == student_id,
                MealBooking.date == today
            )
            b_res = await db.execute(b_stmt)
            for b in b_res.scalars().all():
                bookings_map[b.meal_session.lower()] = b

        hostel_stmt = select(Hostel).limit(1)
        h_res = await db.execute(hostel_stmt)
        hostel = h_res.scalar_one_or_none()
        hostel_name = hostel.name if hostel else "Hostel A (Aryabhatta)"

        default_sessions = [
            ("breakfast", "Poha + Boiled Eggs / Banana + Milk", "7:00 AM - 9:00 AM", "6:30 AM", True, "TK-BKF-892"),
            ("lunch", "Rajma + Jeera Rice + Roti + Salad", "12:00 PM - 2:00 PM", "10:30 AM", True, "TK-LCH-419"),
            ("snacks", "Samosa / Poha + Mint Chutney + Hot Masala Chai", "4:30 PM - 6:00 PM", "3:30 PM", True, "TK-SNK-204"),
            ("dinner", "Paneer Butter Masala + Roti + Dal Tadka", "7:30 PM - 9:30 PM", "5:30 PM", False, None)
        ]

        if not schedules:
            hid = hostel.id if hostel else "h-hostel-a"
            for sess_key, menu_str, time_str, deadline_str, default_booked, default_token in default_sessions:
                sch = MealSchedule(
                    id=f"sched-{sess_key}-{today.isoformat()}-{random.randint(10, 99)}",
                    hostel_id=hid,
                    date=today,
                    session=sess_key,
                    menu=menu_str,
                    time_window=time_str
                )
                db.add(sch)
                schedules.append(sch)
            await db.commit()

        default_deadlines = {
            "breakfast": "6:30 AM",
            "lunch": "10:30 AM",
            "snacks": "3:30 PM",
            "dinner": "5:30 PM"
        }

        meals_dict = {}
        ordered_keys = ["breakfast", "lunch", "snacks", "dinner"]
        for sch in schedules:
            if sch.session.lower() not in ordered_keys:
                ordered_keys.append(sch.session.lower())

        for sess_key in ordered_keys:
            sch = next((s for s in schedules if s.session.lower() == sess_key), None)
            b = bookings_map.get(sess_key)
            is_booked = (b.status == "Booked") if b else (sess_key != "dinner")
            token_val = b.token if (b and is_booked) else (f"TK-{sess_key[:3].upper()}-{random.randint(100, 999)}" if is_booked else None)
            sess_addons = stock_engine.get_active_menu_addons(sess_key)

            menu_val = sch.menu if sch else "Special Dining Dish"
            time_val = sch.time_window if sch else "Regular Hours"

            meals_dict[sess_key] = MealItemOut(
                session=sess_key.capitalize(),
                menu=menu_val,
                time=time_val,
                booked=is_booked,
                status="Booked" if is_booked else "Not Booked",
                deadline=default_deadlines.get(sess_key, "10:30 AM"),
                can_modify=True,
                token=token_val,
                addons=sess_addons
            )

        return TodayMealsResponse(
            date=today.strftime("%a, %d %b %Y"),
            hostel=hostel_name,
            meals=meals_dict
        )

    DEFAULT_WEEKLY_SCHEDULE = {
        "Monday": {
            "breakfast": "Idli Sambhar + Coconut Chutney",
            "lunch": "Chole + Jeera Rice + Roti + Kachumber Salad",
            "snacks": "Ginger Tea + Biscuits / Mathri",
            "dinner": "Mix Dal + Sev Tamatar + Chapati + Rice"
        },
        "Tuesday": {
            "breakfast": "Poha + Boiled Eggs / Banana + Milk",
            "lunch": "Rajma + Jeera Rice + Roti + Salad",
            "snacks": "Samosa / Poha + Mint Chutney + Hot Masala Chai",
            "dinner": "Paneer Butter Masala + Roti + Dal Tadka"
        },
        "Wednesday": {
            "breakfast": "Aloo Paratha + Curd + Pickle",
            "lunch": "Kadhi Pakoda + Steamed Rice + Roti + Salad",
            "snacks": "Filter Coffee + Bun Maska",
            "dinner": "Egg Curry / Paneer Bhurji + Tawa Roti + Rice"
        },
        "Thursday": {
            "breakfast": "Upma + Coconut Chutney + Sprouts",
            "lunch": "Dal Makhani + Tandoori Roti + Jeera Rice",
            "snacks": "Veg Samosa + Green Mint Chutney",
            "dinner": "Veg Biryani + Cucumber Raita + Mirchi Salan"
        },
        "Friday": {
            "breakfast": "Puri Bhaji + Sooji Halwa",
            "lunch": "Sambar Rice + Beans Poriyal + Appalam",
            "snacks": "Crispy Corn Chaat + Fresh Lemonade",
            "dinner": "Matar Paneer + Jeera Pulao + Butter Roti"
        },
        "Saturday": {
            "breakfast": "Masala Dosa + Sambhar + Coconut Chutney",
            "lunch": "Moong Dal Khichdi + Baingan Bharta + Papad",
            "snacks": "Aloo Bonda + Kadak Masala Chai",
            "dinner": "Dal Tadka + Jeera Rice + Seasonal Sabzi + Roti"
        },
        "Sunday": {
            "breakfast": "Pav Bhaji + Seasonal Fruit Juice",
            "lunch": "Special Dum Biryani Feast + Mirchi Ka Salan + Raita",
            "snacks": "Dhokla + Mint Chutney + Green Tea",
            "dinner": "Light Moong Khichdi + Curd + Roti"
        }
    }

    async def get_weekly_menu(self, db: AsyncSession, hostel_id: Optional[str] = None) -> WeeklyMenuResponse:
        today = date.today()
        # Ensure today's schedule exists so today's live items match
        await self.get_today_meals(db=db)

        hostel_stmt = select(Hostel).limit(1)
        h_res = await db.execute(hostel_stmt)
        hostel = h_res.scalar_one_or_none()
        hostel_name = hostel.name if hostel else "Hostel A (Aryabhatta)"
        hid = hostel.id if hostel else "h-hostel-a"

        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        # Query all MealSchedules for this week
        stmt = select(MealSchedule).where(
            MealSchedule.date >= start_of_week,
            MealSchedule.date <= end_of_week
        )
        res = await db.execute(stmt)
        all_scheds = res.scalars().all()

        schedule_list: List[WeeklyDayMenu] = []

        default_time_windows = {
            "breakfast": "7:00 AM - 9:00 AM",
            "lunch": "12:00 PM - 2:00 PM",
            "snacks": "4:30 PM - 6:00 PM",
            "dinner": "7:30 PM - 9:30 PM"
        }
        default_deadlines = {
            "breakfast": "6:30 AM",
            "lunch": "10:30 AM",
            "snacks": "3:30 PM",
            "dinner": "5:30 PM"
        }

        for i in range(7):
            cur_date = start_of_week + timedelta(days=i)
            day_name = cur_date.strftime("%A")
            is_today = (cur_date == today)

            day_scheds = [s for s in all_scheds if s.date == cur_date]
            sched_map = {s.session.lower(): s.menu for s in day_scheds if s.menu}

            baseline = self.DEFAULT_WEEKLY_SCHEDULE.get(day_name, self.DEFAULT_WEEKLY_SCHEDULE["Monday"])

            b_menu = sched_map.get("breakfast", baseline["breakfast"])
            l_menu = sched_map.get("lunch", baseline["lunch"])
            s_menu = sched_map.get("snacks", baseline["snacks"])
            d_menu = sched_map.get("dinner", baseline["dinner"])

            schedule_list.append(WeeklyDayMenu(
                day=day_name,
                date=cur_date.strftime("%d %b %Y"),
                is_today=is_today,
                breakfast=b_menu,
                lunch=l_menu,
                snacks=s_menu,
                dinner=d_menu,
                time_windows=default_time_windows,
                deadlines=default_deadlines
            ))

        return WeeklyMenuResponse(
            hostel=hostel_name,
            date=today.strftime("%a, %d %b %Y"),
            week_start=start_of_week.strftime("%d %b %Y"),
            week_end=end_of_week.strftime("%d %b %Y"),
            schedule=schedule_list
        )

    async def toggle_booking(
        self,
        db: AsyncSession,
        student_id: str,
        req: ToggleBookingRequest,
        student_name: str = "Nitin Sharma"
    ) -> ToggleBookingResponse:
        today = date.today()
        sess_clean = req.meal_session.lower()

        stmt = select(MealBooking).where(
            MealBooking.student_id == student_id,
            MealBooking.date == today,
            MealBooking.meal_session == sess_clean
        )
        res = await db.execute(stmt)
        booking = res.scalar_one_or_none()

        prof_stmt = select(StudentProfile).where(StudentProfile.id == student_id)
        prof_res = await db.execute(prof_stmt)
        student_profile = prof_res.scalar_one_or_none()

        if booking:
            now_booked = (booking.status != "Booked")
            booking.status = "Booked" if now_booked else "OptedOut"
            booking.token = f"TK-{sess_clean[:3].upper()}-{random.randint(100, 999)}" if now_booked else None
        else:
            now_booked = True
            booking = MealBooking(
                student_id=student_id,
                date=today,
                meal_session=sess_clean,
                status="Booked",
                token=f"TK-{sess_clean[:3].upper()}-{random.randint(100, 999)}",
                booked_at=datetime.now(timezone.utc)
            )
            db.add(booking)

        if student_profile:
            if now_booked:
                student_profile.meals_booked += 1
                student_profile.co2_avoided_kg = round(student_profile.co2_avoided_kg + 0.3, 1)
                student_profile.eco_points = (student_profile.eco_points or 580) + 10
            else:
                student_profile.meals_saved += 1
                student_profile.co2_avoided_kg = round(student_profile.co2_avoided_kg + 0.5, 1)
                student_profile.eco_points = (student_profile.eco_points or 580) + 30

        await db.commit()
        await db.refresh(booking)

        ev_type = "RSVP_CREATED" if now_booked else "RSVP_CANCELLED"
        ev_desc = (
            f"Meal RSVP confirmed for {sess_clean.capitalize()}."
            if now_booked
            else f"Timely cancellation submitted before deadline. 1 portion overproduction avoided."
        )

        await impact_service.record_event(
            db=db,
            event_type=ev_type,
            title=f"Student {student_name} {'booked' if now_booked else 'cancelled'} {sess_clean.capitalize()}",
            description=ev_desc,
            quantity=1,
            actor_role="student",
            actor_name=student_name,
            co2_saved_kg=0.5 if not now_booked else 0.3
        )

        booked_count = student_profile.meals_booked if student_profile else 82
        co2_val = student_profile.co2_avoided_kg if student_profile else 24.0

        return ToggleBookingResponse(
            meal_session=sess_clean,
            booked=now_booked,
            status="Booked" if now_booked else "OptedOut",
            token=booking.token,
            co2_avoided_kg=co2_val,
            meals_booked=booked_count,
            cancellation_recorded=not now_booked,
            message=f"{sess_clean.capitalize()} meal successfully {'booked' if now_booked else 'cancelled'}."
        )

    async def submit_feedback(
        self,
        db: AsyncSession,
        student_id: str,
        req: FeedbackRequest
    ) -> FeedbackResponse:
        fb = MealFeedback(
            student_id=student_id,
            meal_session=req.meal_session,
            rating=req.taste_rating,
            comment=req.comment,
            submitted_at=datetime.now(timezone.utc)
        )
        db.add(fb)
        await db.commit()
        await db.refresh(fb)

        return FeedbackResponse(
            id=fb.id,
            message="Dining feedback submitted successfully. Thank you for helping optimize menu quality!",
            submitted_at=fb.submitted_at.isoformat()
        )

    async def get_booking_history(self, db: AsyncSession, student_id: str) -> BookingHistoryResponse:
        history_items = [
            BookingHistoryItem(id="b-01", date="16 Sep 2025", meal="Breakfast", item="Poha + Milk + Banana", status="Served", token="TK-BKF-892"),
            BookingHistoryItem(id="b-02", date="16 Sep 2025", meal="Lunch", item="Rajma + Jeera Rice + Roti", status="Booked", token="TK-LCH-419"),
            BookingHistoryItem(id="b-03", date="15 Sep 2025", meal="Dinner", item="Dal Tadka + Roti", status="Served", token="TK-DIN-502"),
            BookingHistoryItem(id="b-04", date="15 Sep 2025", meal="Lunch", item="Chole Bhature + Rice", status="Served", token="TK-LCH-381"),
            BookingHistoryItem(id="b-05", date="14 Sep 2025", meal="Dinner", item="Veg Pulao + Kadhi", status="Served", token="TK-DIN-114"),
        ]
        return BookingHistoryResponse(total=len(history_items), items=history_items)

    async def get_student_impact(self, db: AsyncSession, student_id: str) -> StudentImpactResponse:
        stmt = select(StudentProfile).where(
            (StudentProfile.id == student_id) | (StudentProfile.user_id == student_id)
        )
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()

        name = profile.name if profile else "Nitin Sharma"
        hostel = "Hostel A (Aryabhatta)"
        booked = profile.meals_booked if profile else 82
        saved = profile.meals_saved if profile else 14
        co2 = profile.co2_avoided_kg if profile else 24.0
        points_val = profile.eco_points if profile and profile.eco_points else 580
        rank_val = profile.rank if profile else 5

        return StudentImpactResponse(
            student_name=name,
            hostel=hostel,
            meals_booked=booked,
            meals_attended=max(0, booked - saved),
            timely_cancellations=saved,
            estimated_surplus_avoided_kg=round(float(saved) * 0.42, 1),
            co2_avoided_kg=co2,
            eco_points=points_val,
            eco_rank=rank_val,
            sustainability_streak_days=18
        )

    async def get_leaderboard(self, db: AsyncSession, student_id: str = "usr-student-01") -> StudentLeaderboardResponse:
        stmt = select(StudentProfile).where(
            (StudentProfile.id == student_id) | (StudentProfile.user_id == student_id)
        )
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()

        cur_points = profile.eco_points if profile and profile.eco_points else 580
        cur_name = profile.name if profile else "Nitin Sharma"
        cur_hostel = "Hostel A (Aryabhatta)"
        cur_room = profile.room if profile and profile.room else "B-304"
        cur_roll = profile.roll_no if profile and profile.roll_no else "2022CSB042"
        cur_meals_saved = profile.meals_saved if profile and profile.meals_saved else 14
        cur_co2 = profile.co2_avoided_kg if profile and profile.co2_avoided_kg else 24.0

        campus_peers = [
            {
                "id": "st-aarav-01",
                "name": "Aarav Patel",
                "avatar": "🥇",
                "roll_no": "2022CSB019",
                "hostel": "Hostel B (Ramanujan)",
                "room": "A-108",
                "eco_points": 940,
                "meals_saved": 31,
                "co2_avoided_kg": 48.5,
                "streak_days": 28,
                "tier": "Eco Legend",
            },
            {
                "id": "st-priya-02",
                "name": "Priya Sharma",
                "avatar": "🥈",
                "roll_no": "2023EEB054",
                "hostel": "Hostel C (Gargi)",
                "room": "C-212",
                "eco_points": 875,
                "meals_saved": 28,
                "co2_avoided_kg": 42.1,
                "streak_days": 24,
                "tier": "Green Champion",
            },
            {
                "id": "st-rohan-03",
                "name": "Rohan Sengupta",
                "avatar": "🥉",
                "roll_no": "2022MEB088",
                "hostel": "Hostel A (Aryabhatta)",
                "room": "B-114",
                "eco_points": 790,
                "meals_saved": 25,
                "co2_avoided_kg": 38.0,
                "streak_days": 21,
                "tier": "Green Champion",
            },
            {
                "id": "st-ananya-04",
                "name": "Ananya Iyer",
                "avatar": "⭐",
                "roll_no": "2023CSB112",
                "hostel": "Hostel C (Gargi)",
                "room": "D-305",
                "eco_points": 710,
                "meals_saved": 22,
                "co2_avoided_kg": 33.2,
                "streak_days": 19,
                "tier": "Sustainability Hero",
            },
            {
                "id": "st-siddharth-05",
                "name": "Siddharth Rao",
                "avatar": "🌱",
                "roll_no": "2022CHB031",
                "hostel": "Hostel A (Aryabhatta)",
                "room": "B-402",
                "eco_points": 540,
                "meals_saved": 16,
                "co2_avoided_kg": 25.4,
                "streak_days": 14,
                "tier": "Sustainability Hero",
            },
            {
                "id": "st-divya-06",
                "name": "Divya Nair",
                "avatar": "🌿",
                "roll_no": "2024CSB009",
                "hostel": "Hostel B (Ramanujan)",
                "room": "A-321",
                "eco_points": 490,
                "meals_saved": 15,
                "co2_avoided_kg": 22.8,
                "streak_days": 12,
                "tier": "Eco Warrior",
            },
            {
                "id": "st-kabir-07",
                "name": "Kabir Joshi",
                "avatar": "🍃",
                "roll_no": "2023CEB077",
                "hostel": "Hostel D (Kalam)",
                "room": "E-101",
                "eco_points": 430,
                "meals_saved": 13,
                "co2_avoided_kg": 19.5,
                "streak_days": 10,
                "tier": "Eco Warrior",
            },
            {
                "id": "st-sneha-08",
                "name": "Sneha Kulkarni",
                "avatar": "🌾",
                "roll_no": "2024EEB043",
                "hostel": "Hostel C (Gargi)",
                "room": "C-118",
                "eco_points": 380,
                "meals_saved": 11,
                "co2_avoided_kg": 16.2,
                "streak_days": 8,
                "tier": "Sprout",
            },
            {
                "id": "st-vikram-09",
                "name": "Vikram Malhotra",
                "avatar": "🍀",
                "roll_no": "2022MEB015",
                "hostel": "Hostel B (Ramanujan)",
                "room": "A-205",
                "eco_points": 320,
                "meals_saved": 9,
                "co2_avoided_kg": 13.8,
                "streak_days": 7,
                "tier": "Sprout",
            },
        ]

        def get_tier(pts: int) -> str:
            if pts >= 850:
                return "Eco Legend"
            if pts >= 700:
                return "Green Champion"
            if pts >= 500:
                return "Sustainability Hero"
            if pts >= 400:
                return "Eco Warrior"
            return "Sprout"

        cur_tier = get_tier(cur_points)

        all_entries = [
            {
                "id": student_id,
                "name": cur_name,
                "avatar": "👨‍🎓",
                "roll_no": cur_roll,
                "hostel": cur_hostel,
                "room": cur_room,
                "eco_points": cur_points,
                "meals_saved": cur_meals_saved,
                "co2_avoided_kg": cur_co2,
                "streak_days": 18,
                "tier": cur_tier,
                "is_current_user": True,
            }
        ]
        for peer in campus_peers:
            peer_copy = dict(peer)
            peer_copy["is_current_user"] = False
            all_entries.append(peer_copy)

        # Sort descending by eco_points
        all_entries.sort(key=lambda x: x["eco_points"], reverse=True)

        leaderboard_items: List[StudentLeaderboardEntry] = []
        current_rank = 1
        current_idx = 0
        for idx, entry in enumerate(all_entries):
            r = idx + 1
            if r == 1:
                badge = "🥇 1st Gold"
            elif r == 2:
                badge = "🥈 2nd Silver"
            elif r == 3:
                badge = "🥉 3rd Bronze"
            elif r <= 5:
                badge = "⭐ Top 5"
            else:
                badge = "🌿 Top 10"

            item = StudentLeaderboardEntry(
                rank=r,
                id=entry["id"],
                name=entry["name"],
                avatar=entry["avatar"],
                roll_no=entry["roll_no"],
                hostel=entry["hostel"],
                room=entry.get("room"),
                eco_points=entry["eco_points"],
                meals_saved=entry["meals_saved"],
                co2_avoided_kg=entry["co2_avoided_kg"],
                streak_days=entry["streak_days"],
                tier=entry["tier"],
                badge=badge,
                is_current_user=entry["is_current_user"]
            )
            leaderboard_items.append(item)
            if entry["is_current_user"]:
                current_rank = r
                current_idx = idx

        points_to_next = 0
        if current_idx > 0:
            points_to_next = leaderboard_items[current_idx - 1].eco_points - cur_points + 1

        if profile and profile.rank != current_rank:
            profile.rank = current_rank
            await db.commit()

        return StudentLeaderboardResponse(
            current_student_rank=current_rank,
            current_student_points=cur_points,
            current_student_tier=cur_tier,
            points_to_next_rank=max(0, points_to_next),
            total_participants=len(leaderboard_items),
            leaderboard=leaderboard_items
        )

    async def earn_points(
        self,
        db: AsyncSession,
        req: PointsEarnRequest,
        student_id: Optional[str] = None
    ) -> PointsEarnResponse:
        sid = student_id or req.student_id or "usr-student-01"
        stmt = select(StudentProfile).where(
            (StudentProfile.id == sid) | (StudentProfile.user_id == sid)
        )
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()

        if not profile:
            stmt2 = select(StudentProfile).limit(1)
            res2 = await db.execute(stmt2)
            profile = res2.scalar_one_or_none()

        if profile:
            profile.eco_points = (profile.eco_points or 580) + req.points
            if "save" in req.action.lower() or "cancel" in req.action.lower():
                profile.meals_saved = (profile.meals_saved or 14) + 1
                profile.co2_avoided_kg = round((profile.co2_avoided_kg or 24.0) + 0.35, 2)
            await db.commit()
            await db.refresh(profile)
            cur_pts = profile.eco_points
            cur_rank = profile.rank or 5
        else:
            cur_pts = 580 + req.points
            cur_rank = 5

        await impact_service.record_event(
            db=db,
            event_type="ECO_POINTS_AWARDED",
            title=f"+{req.points} Eco Points earned by {profile.name if profile else 'Student'}",
            description=f"Action: {req.action}. Green campus points balance: {cur_pts}.",
            quantity=req.points,
            actor_role="student",
            actor_name=profile.name if profile else "Nitin Sharma"
        )

        return PointsEarnResponse(
            success=True,
            points_added=req.points,
            total_eco_points=cur_pts,
            rank=cur_rank,
            message=f"+{req.points} Eco Points awarded successfully!"
        )


student_service = StudentService()
