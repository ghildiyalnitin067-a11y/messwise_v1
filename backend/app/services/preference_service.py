import json
import random
from typing import Optional, List, Dict, Any
from datetime import date, datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.meal import MealSchedule, MealOptionCandidate, StudentPreferenceVote
from app.models.user import StudentProfile
from app.models.hostel import Hostel
from app.services.impact_service import impact_service
from app.schemas.preference import (
    OptionCandidateOut,
    PreferenceCategoryGroup,
    StudentPreferencePollResponse,
    StudentVoteRequest,
    StudentVoteResponse,
    AdminPreferenceOptimizationRequest,
    AdminPreferenceOptimizationResponse,
)


class PreferenceService:
    DEFAULT_CANDIDATES = {
        "lunch": [
            # Main Course Gravy
            {"category": "Main Course Gravy", "name": "Paneer Butter Masala", "desc": "Rich tomato butter gravy with fresh cottage cheese", "dietary": "Vegetarian", "votes": 118, "min_pct": 20.0},
            {"category": "Main Course Gravy", "name": "Rajma Masala Rasila", "desc": "Slow-cooked Kashmiri red kidney beans in spiced gravy", "dietary": "Vegetarian", "votes": 96, "min_pct": 20.0},
            {"category": "Main Course Gravy", "name": "Kadhi Pakoda", "desc": "Gram flour dumplings in tangy spiced yogurt gravy", "dietary": "Vegetarian", "votes": 18, "min_pct": 20.0},

            # Dal & Lentils
            {"category": "Dal & Lentils", "name": "Dal Tadka (Arhar/Toor)", "desc": "Yellow lentils tempered with ghee, cumin & garlic", "dietary": "Vegetarian", "votes": 134, "min_pct": 20.0},
            {"category": "Dal & Lentils", "name": "Dal Makhani", "desc": "Creamy slow-simmered black urad lentils", "dietary": "Vegetarian", "votes": 82, "min_pct": 20.0},
            {"category": "Dal & Lentils", "name": "Panchratna Mix Dal", "desc": "Five-lentil mix with mild aromatic spices", "dietary": "Vegetarian", "votes": 20, "min_pct": 20.0},

            # Breads & Rice
            {"category": "Breads & Rice", "name": "Tawa Roti with Ghee", "desc": "Whole wheat rotis puffed on iron griddle", "dietary": "Vegetarian", "votes": 146, "min_pct": 20.0},
            {"category": "Breads & Rice", "name": "Jeera Basmati Rice", "desc": "Long-grain basmati tempered with roasted cumin", "dietary": "Vegetarian", "votes": 128, "min_pct": 20.0},
            {"category": "Breads & Rice", "name": "Bajra Roti", "desc": "Coarse pearl millet flatbread", "dietary": "Vegetarian", "votes": 16, "min_pct": 20.0},

            # Sides & Dessert
            {"category": "Sides & Dessert", "name": "Boondi Raita & Fresh Salad", "desc": "Whipped curd with spiced boondi & crisp cucumbers", "dietary": "Vegetarian", "votes": 112, "min_pct": 20.0},
            {"category": "Sides & Dessert", "name": "Hot Gulab Jamun", "desc": "Khoya dumplings soaked in saffron cardamom syrup", "dietary": "Vegetarian", "votes": 139, "min_pct": 20.0},
            {"category": "Sides & Dessert", "name": "Karela Fry (Bitter Gourd)", "desc": "Pan-seared bitter gourd with dry spices", "dietary": "Vegetarian", "votes": 9, "min_pct": 20.0},
        ],
        "dinner": [
            # Main Course Gravy
            {"category": "Main Course Gravy", "name": "Shahi Soya Chaap Curry", "desc": "Soy protein braised in thick cashew-onion gravy", "dietary": "High-Protein", "votes": 112, "min_pct": 20.0},
            {"category": "Main Course Gravy", "name": "Mixed Vegetable Korma", "desc": "Carrots, peas, beans & florets in aromatic gravy", "dietary": "Vegetarian", "votes": 86, "min_pct": 20.0},
            {"category": "Main Course Gravy", "name": "Lauki Kofta", "desc": "Bottle gourd dumplings in mild curry", "dietary": "Vegetarian", "votes": 14, "min_pct": 20.0},

            # Dal & Lentils
            {"category": "Dal & Lentils", "name": "Dal Fry Yellow", "desc": "Toor dal seasoned with mustard seeds, curry leaves & ghee", "dietary": "Vegetarian", "votes": 124, "min_pct": 20.0},
            {"category": "Dal & Lentils", "name": "Chana Dal Tadka", "desc": "Hearty Bengal gram lentils with ginger & coriander", "dietary": "Vegetarian", "votes": 76, "min_pct": 20.0},

            # Breads & Rice
            {"category": "Breads & Rice", "name": "Phulka Roti", "desc": "Fresh soft oil-free wheat phulkas", "dietary": "Vegetarian", "votes": 142, "min_pct": 20.0},
            {"category": "Breads & Rice", "name": "Steamed Basmati Rice", "desc": "Fluffy steamed long-grain white rice", "dietary": "Vegetarian", "votes": 118, "min_pct": 20.0},
            {"category": "Breads & Rice", "name": "Plain Pulao", "desc": "Spiced whole grain rice with whole bay leaves", "dietary": "Vegetarian", "votes": 22, "min_pct": 20.0},

            # Sides & Dessert
            {"category": "Sides & Dessert", "name": "Hot Moong Dal Halwa", "desc": "Traditional slow-roasted split mung sweet", "dietary": "Vegetarian", "votes": 136, "min_pct": 20.0},
            {"category": "Sides & Dessert", "name": "Green Tossed Salad & Papad", "desc": "Seasonal shredded salad with roasted urad papad", "dietary": "Vegetarian", "votes": 98, "min_pct": 20.0},
            {"category": "Sides & Dessert", "name": "Baingan Bharta", "desc": "Fire-roasted eggplant mash with garlic", "dietary": "Vegetarian", "votes": 15, "min_pct": 20.0},
        ]
    }

    async def ensure_candidates_seeded(self, db: AsyncSession, session_name: str, today: date) -> List[MealOptionCandidate]:
        sess_clean = session_name.lower()
        stmt = select(MealOptionCandidate).where(
            MealOptionCandidate.date == today,
            MealOptionCandidate.session == sess_clean
        )
        res = await db.execute(stmt)
        candidates = list(res.scalars().all())

        if not candidates:
            # Seed from templates
            template = self.DEFAULT_CANDIDATES.get(sess_clean, self.DEFAULT_CANDIDATES["lunch"])
            h_stmt = select(Hostel).limit(1)
            h_res = await db.execute(h_stmt)
            hostel = h_res.scalar_one_or_none()
            hid = hostel.id if hostel else "h-hostel-a"

            for item in template:
                cand = MealOptionCandidate(
                    id=f"cand-{sess_clean[:3]}-{random.randint(10000, 99999)}",
                    hostel_id=hid,
                    date=today,
                    session=sess_clean,
                    category=item["category"],
                    dish_name=item["name"],
                    description=item.get("desc"),
                    dietary_type=item.get("dietary", "Vegetarian"),
                    votes=item["votes"],
                    is_active=True,
                    waste_risk="Low",
                    min_threshold_pct=item.get("min_pct", 20.0)
                )
                db.add(cand)
                candidates.append(cand)
            await db.commit()

        return candidates

    async def get_preference_poll(
        self,
        db: AsyncSession,
        session_name: str = "lunch",
        student_id: Optional[str] = None
    ) -> StudentPreferencePollResponse:
        today = date.today()
        sess_clean = session_name.lower()
        candidates = await self.ensure_candidates_seeded(db, sess_clean, today)

        # Check student vote across today (1 preference per user per day limit)
        student_selection: List[str] = []
        has_voted = False
        daily_limit_reached = False
        voted_session = None

        if student_id:
            v_stmt = select(StudentPreferenceVote).where(
                StudentPreferenceVote.student_id == student_id,
                StudentPreferenceVote.date == today
            )
            v_res = await db.execute(v_stmt)
            vote_record = v_res.scalar_one_or_none()
            if vote_record:
                daily_limit_reached = True
                voted_session = vote_record.session.capitalize()
                has_voted = (vote_record.session.lower() == sess_clean)
                try:
                    student_selection = json.loads(vote_record.selected_option_ids)
                except Exception:
                    student_selection = []

        # Group by category
        cat_order = ["Main Course Gravy", "Dal & Lentils", "Breads & Rice", "Sides & Dessert"]
        groups_dict: Dict[str, List[MealOptionCandidate]] = {}
        for c in candidates:
            groups_dict.setdefault(c.category, []).append(c)

        category_groups: List[PreferenceCategoryGroup] = []
        pruned_all: List[str] = []
        total_unique_voters = 0

        # Sort categories nicely
        ordered_cat_keys = [k for k in cat_order if k in groups_dict] + [k for k in groups_dict if k not in cat_order]

        for cat in ordered_cat_keys:
            opts = groups_dict[cat]
            total_cat_votes = sum(o.votes for o in opts)
            if total_cat_votes > total_unique_voters:
                total_unique_voters = total_cat_votes

            winning_opt = None
            max_v = -1
            cat_pruned: List[str] = []

            out_options: List[OptionCandidateOut] = []
            for o in opts:
                pct = round((o.votes / total_cat_votes * 100.0), 1) if total_cat_votes > 0 else 0.0

                # Determine waste risk level
                risk_level = "Low"
                if not o.is_active:
                    risk_level = "Pruned (Low Preference)"
                    cat_pruned.append(o.dish_name)
                    pruned_all.append(o.dish_name)
                elif pct < o.min_threshold_pct:
                    risk_level = "High Wastage Risk (< 20%)"
                elif pct < 35.0:
                    risk_level = "Moderate"

                if o.is_active and o.votes > max_v:
                    max_v = o.votes
                    winning_opt = o.dish_name

                out_options.append(
                    OptionCandidateOut(
                        id=o.id,
                        category=o.category,
                        dish_name=o.dish_name,
                        description=o.description,
                        dietary_type=o.dietary_type,
                        votes=o.votes,
                        vote_percentage=pct,
                        is_active=o.is_active,
                        waste_risk=risk_level,
                        min_threshold_pct=o.min_threshold_pct
                    )
                )

            # Sort options: active first, descending by votes
            out_options.sort(key=lambda x: (x.is_active, x.votes), reverse=True)

            category_groups.append(
                PreferenceCategoryGroup(
                    category=cat,
                    options=out_options,
                    total_category_votes=total_cat_votes,
                    winning_dish=winning_opt,
                    pruned_dishes=cat_pruned
                )
            )

        # Fetch current meal schedule
        sch_stmt = select(MealSchedule).where(
            MealSchedule.date == today,
            MealSchedule.session == sess_clean
        )
        sch_res = await db.execute(sch_stmt)
        schedule = sch_res.scalar_one_or_none()
        current_menu_text = schedule.menu if schedule else "Menu being calibrated from student preferences"

        # Calculate waste prevented: ~14.5 kg per pruned unpopular dish
        num_pruned = len(pruned_all)
        waste_prevented = round(num_pruned * 14.5, 1)
        carbon_saved = round(waste_prevented * 1.8, 1)
        cost_saved = round(waste_prevented * 80.0, 1)

        menu_status = "OPTIMIZED_ZERO_WASTE" if num_pruned > 0 else "VOTING_ACTIVE"

        return StudentPreferencePollResponse(
            date=today.strftime("%a, %d %b %Y"),
            session=sess_clean.capitalize(),
            categories=category_groups,
            total_voters=total_unique_voters,
            has_voted=has_voted,
            daily_limit_reached=daily_limit_reached,
            voted_session=voted_session,
            student_selection=student_selection,
            current_menu=current_menu_text,
            menu_status=menu_status,
            waste_prevented_kg=waste_prevented,
            carbon_saved_kg=carbon_saved,
            cost_saved_inr=cost_saved,
            message="You have already submitted your meal preference for today." if daily_limit_reached else "Live student preference breakdown loaded successfully."
        )

    async def record_student_vote(
        self,
        db: AsyncSession,
        student_id: str,
        req: StudentVoteRequest
    ) -> StudentVoteResponse:
        today = date.today()
        sess_clean = req.session.lower()

        if not req.selected_option_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please select at least one meal dish preference."
            )

        # Enforce strict policy: Each user can fill only ONE preference per day!
        check_stmt = select(StudentPreferenceVote).where(
            StudentPreferenceVote.student_id == student_id,
            StudentPreferenceVote.date == today
        )
        check_res = await db.execute(check_stmt)
        existing_vote_today = check_res.scalar_one_or_none()

        if existing_vote_today:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Daily preference limit reached: You have already filled your meal preference for today ({existing_vote_today.session.capitalize()} session). Each student is permitted only 1 preference entry per day."
            )

        # Update votes on candidates
        candidates = await self.ensure_candidates_seeded(db, sess_clean, today)
        cand_map = {c.id: c for c in candidates}
        # Also map by dish_name in case frontend passed dish name
        cand_name_map = {c.dish_name.lower(): c for c in candidates}

        new_vote = StudentPreferenceVote(
            student_id=student_id,
            date=today,
            session=sess_clean,
            selected_option_ids=json.dumps(req.selected_option_ids),
            notes=req.notes
        )
        db.add(new_vote)

        # Apply new votes
        applied_count = 0
        for opt_id in req.selected_option_ids:
            target = cand_map.get(opt_id) or cand_name_map.get(str(opt_id).lower())
            if target:
                target.votes += 1
                applied_count += 1

        # Reward Eco Points for participating
        prof_stmt = select(StudentProfile).where(StudentProfile.id == student_id)
        prof_res = await db.execute(prof_stmt)
        profile = prof_res.scalar_one_or_none()
        if profile:
            profile.eco_points = (profile.eco_points or 500) + 15

        await db.commit()

        updated_poll = await self.get_preference_poll(db, sess_clean, student_id)

        return StudentVoteResponse(
            success=True,
            message=f"Preferences recorded! +15 Eco Points added to your green campus wallet.",
            eco_points_earned=15,
            updated_poll=updated_poll
        )

    async def optimize_menu_for_wastage(
        self,
        db: AsyncSession,
        req: AdminPreferenceOptimizationRequest
    ) -> AdminPreferenceOptimizationResponse:
        today = date.today()
        sess_clean = req.session.lower()
        threshold = req.threshold_pct

        candidates = await self.ensure_candidates_seeded(db, sess_clean, today)

        # Group by category
        groups: Dict[str, List[MealOptionCandidate]] = {}
        for c in candidates:
            groups.setdefault(c.category, []).append(c)

        pruned_dishes: List[str] = []
        retained_dishes: List[str] = []

        for cat, opts in groups.items():
            total_cat_votes = sum(o.votes for o in opts)
            if total_cat_votes == 0:
                continue

            for o in opts:
                pct = (o.votes / total_cat_votes) * 100.0
                # If below threshold, prune it to prevent wastage!
                if pct < threshold:
                    o.is_active = False
                    o.waste_risk = "Pruned (Low Preference)"
                    pruned_dishes.append(o.dish_name)
                else:
                    o.is_active = True
                    o.waste_risk = "Low"
                    retained_dishes.append(o.dish_name)

        # Build clean winning zero-waste menu
        # Group retained dishes in harmonious order
        category_retained: Dict[str, List[str]] = {}
        for o in candidates:
            if o.is_active:
                category_retained.setdefault(o.category, []).append(o.dish_name)

        menu_parts = []
        for cat in ["Main Course Gravy", "Dal & Lentils", "Breads & Rice", "Sides & Dessert"]:
            items = category_retained.get(cat, [])
            if items:
                menu_parts.append(" / ".join(items))

        new_menu_str = " + ".join(menu_parts) if menu_parts else " + ".join(retained_dishes)

        # Update or create MealSchedule
        sch_stmt = select(MealSchedule).where(
            MealSchedule.date == today,
            MealSchedule.session == sess_clean
        )
        sch_res = await db.execute(sch_stmt)
        sched = sch_res.scalar_one_or_none()

        default_times = {
            "breakfast": "7:00 AM - 9:00 AM",
            "lunch": "12:00 PM - 2:00 PM",
            "snacks": "4:30 PM - 6:00 PM",
            "dinner": "7:30 PM - 9:30 PM"
        }

        if sched:
            sched.menu = new_menu_str
        else:
            h_stmt = select(Hostel).limit(1)
            h_res = await db.execute(h_stmt)
            hostel = h_res.scalar_one_or_none()
            hid = hostel.id if hostel else "h-hostel-a"

            sched = MealSchedule(
                id=f"sched-{sess_clean}-{today.isoformat()}-{random.randint(100, 999)}",
                hostel_id=hid,
                date=today,
                session=sess_clean,
                menu=new_menu_str,
                time_window=default_times.get(sess_clean, "12:00 PM - 2:00 PM")
            )
            db.add(sched)

        # Waste and financial savings calculations
        waste_saved_kg = round(len(pruned_dishes) * 14.5, 1)
        cost_saved_inr = round(waste_saved_kg * 80.0, 1)
        co2_saved_kg = round(waste_saved_kg * 1.8, 1)

        # Audit event
        await impact_service.record_event(
            db=db,
            event_type="PREFERENCE_MENU_OPTIMIZED",
            title=f"Menu Refined via Student Voting ({sess_clean.capitalize()})",
            description=f"Pruned {len(pruned_dishes)} low-demand options ({', '.join(pruned_dishes)}) under {threshold}% threshold. Zero-waste menu synchronized to student portal.",
            quantity=int(waste_saved_kg),
            actor_role="admin",
            actor_name="Mess Kitchen Supervisor"
        )

        await db.commit()

        return AdminPreferenceOptimizationResponse(
            success=True,
            session=sess_clean.capitalize(),
            threshold_pct=threshold,
            pruned_dishes=pruned_dishes,
            retained_dishes=retained_dishes,
            new_menu=new_menu_str,
            estimated_waste_saved_kg=waste_saved_kg,
            estimated_cost_saved_inr=cost_saved_inr,
            estimated_co2_saved_kg=co2_saved_kg,
            message=f"Removed {len(pruned_dishes)} low-preference dish(es) to avoid ~{waste_saved_kg}kg food wastage. Live menu updated!"
        )


preference_service = PreferenceService()
