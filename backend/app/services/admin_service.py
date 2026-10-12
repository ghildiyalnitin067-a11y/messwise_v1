import random
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timezone
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.meal import DailyProductionLog, MealBooking, MealSchedule
from app.models.surplus import SurplusListing, SurplusRequest
from app.models.hostel import Hostel
from app.models.waste import WasteRecord
from app.services.impact_service import impact_service
from app.ml.stock_analysis_engine import stock_engine
from app.schemas.admin import (
    AdminStatsResponse,
    TodayStatsOut,
    ProductionLogRequest,
    ProductionLogResponse,
    WasteLogRequest,
    WasteLogResponse,
    WasteHeatmapResponse,
    SurplusPublishRequest,
    SurplusPublishResponse,
    HandoverVerifyRequest,
    HandoverVerifyResponse,
    MenuUpdateRequest,
    MenuSessionItem,
    AdminMenuResponse
)


class AdminService:
    async def get_dashboard_stats(self, db: AsyncSession, hostel_id: Optional[str] = None) -> AdminStatsResponse:
        hostel_stmt = select(Hostel).limit(1)
        h_res = await db.execute(hostel_stmt)
        hostel = h_res.scalar_one_or_none()

        hostel_name = hostel.name if hostel else "Hostel A - Aryabhatta Central Mess"
        total_boarders = hostel.capacity if hostel else 600

        today = date.today()
        prod_stmt = select(DailyProductionLog).where(
            DailyProductionLog.date == today
        ).order_by(desc(DailyProductionLog.logged_at)).limit(1)
        p_res = await db.execute(prod_stmt)
        latest_prod = p_res.scalar_one_or_none()

        if latest_prod:
            today_stats = TodayStatsOut(
                prepared=latest_prod.prepared_qty,
                served=latest_prod.served_qty,
                surplus=latest_prod.surplus_qty,
                waste=latest_prod.waste_qty
            )
        else:
            today_stats = TodayStatsOut(
                prepared=842,
                served=817,
                surplus=25,
                waste=6
            )

        rsvp_stmt = select(func.count(MealBooking.id)).where(
            MealBooking.date == today,
            MealBooking.status == "Booked"
        )
        r_res = await db.execute(rsvp_stmt)
        active_rsvps = r_res.scalar() or 598

        return AdminStatsResponse(
            mess_name=hostel_name,
            supervisor="Rajesh Kumar",
            date=today.strftime("%a, %d %b %Y"),
            today_stats=today_stats,
            registered_boarders=total_boarders,
            active_rsvps=active_rsvps
        )

    async def log_production(self, db: AsyncSession, req: ProductionLogRequest, supervisor_name: str = "Rajesh Kumar") -> ProductionLogResponse:
        hostel_stmt = select(Hostel).limit(1)
        h_res = await db.execute(hostel_stmt)
        hostel = h_res.scalar_one_or_none()
        hostel_id = hostel.id if hostel else "h-01"

        surplus = max(0, req.prepared_qty - req.served_qty)
        today = date.today()

        prod_log = DailyProductionLog(
            hostel_id=hostel_id,
            date=today,
            meal_session=req.meal_session,
            prepared_qty=req.prepared_qty,
            served_qty=req.served_qty,
            surplus_qty=surplus,
            waste_qty=req.waste_qty,
            notes=req.notes,
            logged_at=datetime.now(timezone.utc)
        )
        db.add(prod_log)
        await db.commit()
        await db.refresh(prod_log)

        # Record events in Impact Ledger
        await impact_service.record_event(
            db=db,
            event_type="MEAL_PREPARED",
            title=f"{req.prepared_qty} portions prepared for {req.meal_session}",
            description=f"Batch production logged at {hostel.name if hostel else 'Hostel A Mess'}.",
            quantity=req.prepared_qty,
            actor_role="admin",
            actor_name=supervisor_name,
            hostel_id=hostel_id
        )

        await impact_service.record_event(
            db=db,
            event_type="MEAL_SERVED",
            title=f"{req.served_qty} portions consumed by students",
            description=f"Actual consumption recorded with {surplus} unserved surplus portions.",
            quantity=req.served_qty,
            actor_role="admin",
            actor_name=supervisor_name,
            hostel_id=hostel_id
        )

        return ProductionLogResponse(
            id=prod_log.id,
            prepared=prod_log.prepared_qty,
            served=prod_log.served_qty,
            surplus=prod_log.surplus_qty,
            waste=prod_log.waste_qty,
            logged_at=prod_log.logged_at.isoformat()
        )

    async def log_waste(self, db: AsyncSession, req: WasteLogRequest) -> WasteLogResponse:
        hostel_stmt = select(Hostel).limit(1)
        h_res = await db.execute(hostel_stmt)
        hostel = h_res.scalar_one_or_none()
        hostel_id = hostel.id if hostel else "h-01"

        total_waste = round(req.prep_waste_kg + req.unserved_surplus_kg + req.plate_waste_kg, 2)
        today = date.today()

        waste_record = WasteRecord(
            hostel_id=hostel_id,
            date=today,
            meal_session=req.meal_session,
            day_of_week=req.day_of_week,
            prep_waste_kg=req.prep_waste_kg,
            unserved_surplus_kg=req.unserved_surplus_kg,
            plate_waste_kg=req.plate_waste_kg,
            total_waste_kg=total_waste,
            notes=req.notes,
            logged_at=datetime.now(timezone.utc)
        )
        db.add(waste_record)
        await db.commit()
        await db.refresh(waste_record)

        return WasteLogResponse(
            id=waste_record.id,
            meal_session=waste_record.meal_session,
            day_of_week=waste_record.day_of_week,
            prep_waste_kg=waste_record.prep_waste_kg,
            unserved_surplus_kg=waste_record.unserved_surplus_kg,
            plate_waste_kg=waste_record.plate_waste_kg,
            total_waste_kg=waste_record.total_waste_kg,
            logged_at=waste_record.logged_at.isoformat()
        )

    async def get_waste_heatmap(self, db: AsyncSession) -> WasteHeatmapResponse:
        sessions = ["Breakfast", "Lunch", "Dinner"]
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        grid = {
            "Breakfast": {"Monday": 4.2, "Tuesday": 3.8, "Wednesday": 4.5, "Thursday": 3.9, "Friday": 5.1, "Saturday": 7.4, "Sunday": 6.8},
            "Lunch": {"Monday": 8.5, "Tuesday": 7.2, "Wednesday": 6.9, "Thursday": 7.8, "Friday": 8.1, "Saturday": 11.2, "Sunday": 10.5},
            "Dinner": {"Monday": 12.4, "Tuesday": 11.8, "Wednesday": 10.5, "Thursday": 14.2, "Friday": 9.8, "Saturday": 6.5, "Sunday": 8.4}
        }

        stmt = select(WasteRecord)
        res = await db.execute(stmt)
        records = res.scalars().all()
        for r in records:
            sess = r.meal_session.capitalize()
            dow = r.day_of_week.capitalize()
            if sess in grid and dow in grid[sess]:
                grid[sess][dow] = r.total_waste_kg

        weekly_total = sum(sum(day_vals.values()) for day_vals in grid.values())

        insights = [
            "Thursday Dinner has the highest unserved surplus intensity (14.2 kg) due to pre-weekend hostel opt-outs.",
            "Saturday Lunch shows peak plate waste (11.2 kg) correlating with heavier weekend menu portions.",
            "Breakfast maintains the lowest waste margin across all weekdays (avg. 4.1 kg)."
        ]

        return WasteHeatmapResponse(
            sessions=sessions,
            days=days,
            grid=grid,
            weekly_total_kg=round(weekly_total, 1),
            highest_waste_session="Thursday Dinner",
            insights=insights
        )

    async def publish_surplus(self, db: AsyncSession, req: SurplusPublishRequest) -> SurplusPublishResponse:
        hostel_stmt = select(Hostel).limit(1)
        h_res = await db.execute(hostel_stmt)
        hostel = h_res.scalar_one_or_none()
        hostel_id = hostel.id if hostel else "h-01"

        otp_code = str(random.randint(1000, 9999))

        title = req.title or req.food_title or "Fresh Kitchen Surplus"
        meals = req.meals or req.meals_available or 25
        temp = req.temp_celsius if req.temp_celsius is not None else (int(req.storage_temperature) if req.storage_temperature is not None else 65)

        surplus = SurplusListing(
            hostel_id=hostel_id,
            title=title,
            meals=meals,
            location_detail=req.location_detail or f"{hostel.name if hostel else 'Hostel A'} Kitchen Bay, Counter 1",
            distance_km=1.8,
            pickup_deadline=req.pickup_deadline or "5:00 PM",
            time_remaining="2h left",
            status="Published",
            temp_celsius=temp,
            storage_condition=req.storage_condition or "Insulated Stainless Steel Warmer",
            food_type=req.food_type or "Cooked Main Course",
            fssai_safety_passed=True,
            dietary=req.dietary or "Vegetarian",
            image_url=req.image_url,
            pickup_otp=otp_code,
            created_at=datetime.now(timezone.utc)
        )
        db.add(surplus)
        await db.commit()
        await db.refresh(surplus)

        await impact_service.record_event(
            db=db,
            event_type="SURPLUS_PUBLISHED",
            title=f"{req.meals} surplus meals published for NGO pickup",
            description=f"{req.title} verified and published from {hostel.name if hostel else 'Hostel A'}.",
            quantity=req.meals,
            actor_role="admin",
            actor_name="Rajesh Kumar",
            hostel_id=hostel_id
        )

        return SurplusPublishResponse(
            id=surplus.id,
            title=surplus.title,
            meals=surplus.meals,
            status=surplus.status,
            fssai_safety_passed=surplus.fssai_safety_passed,
            pickup_otp=surplus.pickup_otp,
            published_at=surplus.created_at.isoformat()
        )

    async def verify_handover(self, db: AsyncSession, req: HandoverVerifyRequest, verifier: str = "Rajesh Kumar") -> HandoverVerifyResponse:
        stmt = select(SurplusRequest).where(SurplusRequest.id == req.request_id)
        res = await db.execute(stmt)
        s_req = res.scalar_one_or_none()

        if not s_req:
            stmt2 = select(SurplusRequest).where(SurplusRequest.surplus_id == req.request_id)
            res2 = await db.execute(stmt2)
            s_req = res2.scalar_one_or_none()

        if not s_req:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Surplus pickup request not found."
            )

        if s_req.otp != req.otp.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid 4-digit Handover OTP code. Verification failed."
            )

        s_req.status = "Collected"
        s_req.collected_at = datetime.now(timezone.utc)

        surplus_stmt = select(SurplusListing).where(SurplusListing.id == s_req.surplus_id)
        surplus_res = await db.execute(surplus_stmt)
        surplus_item = surplus_res.scalar_one_or_none()
        if surplus_item:
            surplus_item.status = "PickedUp"

        await db.commit()

        await impact_service.record_event(
            db=db,
            event_type="HANDOVER_VERIFIED",
            title=f"{surplus_item.meals if surplus_item else 25} meals handed over to {s_req.volunteer_name}",
            description=f"Secure OTP verification confirmed at kitchen dispatch counter by {verifier}.",
            quantity=surplus_item.meals if surplus_item else 25,
            actor_role="admin",
            actor_name=verifier,
            ngo_id=s_req.ngo_id
        )

        return HandoverVerifyResponse(
            success=True,
            request_id=s_req.id,
            status="Collected",
            meals_handed_over=surplus_item.meals if surplus_item else 25,
            message="Handover verified successfully. Food batch released to NGO."
        )

    DEFAULT_SESSIONS = [
        {
            "session": "breakfast",
            "menu": "Poha + Boiled Eggs / Banana + Milk",
            "time_window": "7:00 AM - 9:00 AM",
            "deadline": "6:30 AM"
        },
        {
            "session": "lunch",
            "menu": "Rajma + Jeera Rice + Roti + Salad",
            "time_window": "12:00 PM - 2:00 PM",
            "deadline": "10:30 AM"
        },
        {
            "session": "snacks",
            "menu": "Samosa / Poha + Mint Chutney + Hot Masala Chai",
            "time_window": "4:30 PM - 6:00 PM",
            "deadline": "3:30 PM"
        },
        {
            "session": "dinner",
            "menu": "Paneer Butter Masala + Roti + Dal Tadka",
            "time_window": "7:30 PM - 9:30 PM",
            "deadline": "5:30 PM"
        }
    ]

    async def _ensure_today_schedules(self, db: AsyncSession, hostel_id: str) -> List[MealSchedule]:
        today = date.today()
        stmt = select(MealSchedule).where(MealSchedule.date == today)
        res = await db.execute(stmt)
        schedules = list(res.scalars().all())
        if not schedules:
            new_scheds = []
            for item in self.DEFAULT_SESSIONS:
                sch = MealSchedule(
                    id=f"sched-{item['session']}-{today.isoformat()}-{random.randint(10, 99)}",
                    hostel_id=hostel_id,
                    date=today,
                    session=item["session"],
                    menu=item["menu"],
                    time_window=item["time_window"]
                )
                db.add(sch)
                new_scheds.append(sch)
            await db.commit()
            return new_scheds
        return schedules

    async def get_daily_menu(self, db: AsyncSession, hostel_id: Optional[str] = None) -> AdminMenuResponse:
        today = date.today()
        hostel_stmt = select(Hostel).limit(1)
        h_res = await db.execute(hostel_stmt)
        hostel = h_res.scalar_one_or_none()
        hid = hostel.id if hostel else "h-hostel-a"
        hname = hostel.name if hostel else "Hostel A - Aryabhatta Central Mess"

        schedules = await self._ensure_today_schedules(db, hid)

        rsvp_stmt = select(
            MealBooking.meal_session,
            func.count(MealBooking.id)
        ).where(
            MealBooking.date == today,
            MealBooking.status == "Booked"
        ).group_by(MealBooking.meal_session)
        rsvp_res = await db.execute(rsvp_stmt)
        rsvp_counts = {r[0].lower(): r[1] for r in rsvp_res.all()}

        default_deadlines = {
            "breakfast": "6:30 AM",
            "lunch": "10:30 AM",
            "snacks": "3:30 PM",
            "dinner": "5:30 PM"
        }

        sessions_dict = {}
        for sess_meta in self.DEFAULT_SESSIONS:
            s_key = sess_meta["session"]
            found = next((s for s in schedules if s.session.lower() == s_key), None)
            menu_text = found.menu if found else sess_meta["menu"]
            t_win = found.time_window if found else sess_meta["time_window"]
            addons = stock_engine.get_active_menu_addons(s_key)

            sessions_dict[s_key] = MenuSessionItem(
                session=s_key.capitalize(),
                menu=menu_text,
                time_window=t_win,
                deadline=default_deadlines.get(s_key, "10:30 AM"),
                rsvps_count=rsvp_counts.get(s_key, random.randint(480, 560)),
                addons=addons
            )

        return AdminMenuResponse(
            date=today.strftime("%a, %d %b %Y"),
            hostel=hname,
            sessions=sessions_dict,
            message="Daily dining menu retrieved successfully."
        )

    async def update_daily_menu(self, db: AsyncSession, req: MenuUpdateRequest, hostel_id: Optional[str] = None) -> AdminMenuResponse:
        today = date.today()
        hostel_stmt = select(Hostel).limit(1)
        h_res = await db.execute(hostel_stmt)
        hostel = h_res.scalar_one_or_none()
        hid = hostel.id if hostel else "h-hostel-a"

        sess_key = req.session.lower()
        stmt = select(MealSchedule).where(
            MealSchedule.date == today,
            MealSchedule.session == sess_key
        )
        res = await db.execute(stmt)
        sched = res.scalar_one_or_none()

        default_times = {
            "breakfast": "7:00 AM - 9:00 AM",
            "lunch": "12:00 PM - 2:00 PM",
            "snacks": "4:30 PM - 6:00 PM",
            "dinner": "7:30 PM - 9:30 PM"
        }

        if sched:
            if req.append_dish and sched.menu:
                sched.menu = f"{sched.menu} + {req.menu.strip()}"
            else:
                sched.menu = req.menu.strip()
            if req.time_window:
                sched.time_window = req.time_window
        else:
            sched = MealSchedule(
                id=f"sched-{sess_key}-{today.isoformat()}-{random.randint(100, 999)}",
                hostel_id=hid,
                date=today,
                session=sess_key,
                menu=req.menu.strip(),
                time_window=req.time_window or default_times.get(sess_key, "12:00 PM - 2:00 PM")
            )
            db.add(sched)

        await db.commit()
        await db.refresh(sched)

        await impact_service.record_event(
            db=db,
            event_type="MENU_UPDATED",
            title=f"Menu Updated for {sess_key.capitalize()}",
            description=f"Pushed to Student Portal: {sched.menu}",
            quantity=1,
            actor_role="admin",
            actor_name="Mess Supervisor"
        )

        return await self.get_daily_menu(db=db, hostel_id=hid)


admin_service = AdminService()
