from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.surplus import SurplusListing, SurplusRequest, DistributionRecord
from app.models.demand import NgoDemand
from app.models.user import NgoProfile
from app.models.hostel import Hostel
from app.services.impact_service import impact_service
from app.schemas.ngo import (
    SurplusFeedResponse,
    SurplusListingOut,
    SurplusRequestCreate,
    SurplusRequestOut,
    DistributionLogRequest,
    DistributionRecordOut,
    NgoDemandCreate,
    NgoDemandOut,
    SmartMatchOut,
    SmartMatchResponse
)


class NgoService:
    async def get_surplus_feed(self, db: AsyncSession, ngo_id: Optional[str] = None) -> SurplusFeedResponse:
        stmt = select(SurplusListing).order_by(desc(SurplusListing.created_at))
        result = await db.execute(stmt)
        listings = result.scalars().all()

        items = []
        for s in listings:
            hostel_name = "Hostel A - Central Mess"
            if s.hostel_id:
                h_stmt = select(Hostel).where(Hostel.id == s.hostel_id)
                h_res = await db.execute(h_stmt)
                h = h_res.scalar_one_or_none()
                if h:
                    hostel_name = h.name

            items.append(SurplusListingOut(
                id=s.id,
                title=s.title,
                meals=s.meals,
                hostel=hostel_name,
                location_detail=s.location_detail or "Kitchen Bay 1",
                distance_km=s.distance_km or 1.8,
                pickup_deadline=s.pickup_deadline or "5:00 PM",
                time_remaining=s.time_remaining or "1h 45m left",
                status=s.status,
                temp_celsius=s.temp_celsius or 65,
                storage_condition=s.storage_condition or "Insulated Warmer",
                food_type=s.food_type or "Main Course",
                dietary=s.dietary or "Vegetarian",
                image_url=s.image_url,
                fssai_safety_passed=s.fssai_safety_passed,
                requested_by_ngo=s.requested_by_ngo,
                pickup_otp=s.pickup_otp
            ))

        return SurplusFeedResponse(count=len(items), items=items)

    async def register_demand(
        self,
        db: AsyncSession,
        ngo_id: str,
        req: NgoDemandCreate
    ) -> NgoDemandOut:
        demand = NgoDemand(
            ngo_id=ngo_id,
            shelter_name=req.shelter_name,
            people_count=req.people_count,
            food_preference=req.food_preference,
            required_before=req.required_before,
            location=req.location or "Community Shelter Care Centre",
            notes=req.notes,
            created_at=datetime.now(timezone.utc)
        )
        db.add(demand)
        await db.commit()
        await db.refresh(demand)

        return NgoDemandOut(
            id=demand.id,
            shelter_name=demand.shelter_name,
            people_count=demand.people_count,
            food_preference=demand.food_preference,
            required_before=demand.required_before,
            location=demand.location,
            status=demand.status,
            created_at=demand.created_at.strftime("%I:%M %p, %d %b")
        )

    async def get_smart_matches(self, db: AsyncSession, ngo_id: str) -> SmartMatchResponse:
        stmt = select(SurplusListing).where(SurplusListing.status == "Published")
        res = await db.execute(stmt)
        listings = res.scalars().all()

        matches = []
        for s in listings:
            dist_score = max(0.0, 1.0 - (s.distance_km / 10.0))
            temp_score = 1.0 if s.temp_celsius >= 60 else 0.8
            diet_score = 1.0 if s.dietary == "Vegetarian" else 0.9

            overall_score = round(0.4 * dist_score + 0.3 * temp_score + 0.3 * diet_score, 2)

            reasons = [
                f"{s.distance_km} km transit distance (Under 15-min radius)",
                f"Holding temperature {s.temp_celsius}°C conforms with FSSAI warm food standards",
                f"{s.dietary} profile matches active shelter dietary preferences",
                f"Pickup window active ({s.pickup_deadline})"
            ]

            hostel_name = "Hostel A - Central Mess"
            if s.hostel_id:
                h_stmt = select(Hostel).where(Hostel.id == s.hostel_id)
                h_res = await db.execute(h_stmt)
                h = h_res.scalar_one_or_none()
                if h:
                    hostel_name = h.name

            matches.append(SmartMatchOut(
                surplus_id=s.id,
                food_title=s.title,
                meals=s.meals,
                hostel=hostel_name,
                distance_km=s.distance_km,
                pickup_deadline=s.pickup_deadline or "5:00 PM",
                match_score=overall_score,
                match_reasons=reasons
            ))

        return SmartMatchResponse(count=len(matches), matches=matches)

    async def create_surplus_request(
        self,
        db: AsyncSession,
        surplus_id: str,
        ngo_id: str,
        req: SurplusRequestCreate,
        ngo_org_name: str = "Helping Hands NGO"
    ) -> SurplusRequestOut:
        stmt = select(SurplusListing).where(SurplusListing.id == surplus_id).with_for_update()
        res = await db.execute(stmt)
        surplus = res.scalar_one_or_none()

        if surplus and surplus.status in ["Claimed", "Requested", "Distributed"]:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surplus listing has already been claimed by another partner."
            )

        if not surplus:
            h_stmt = select(Hostel).limit(1)
            h_res = await db.execute(h_stmt)
            hostel = h_res.scalar_one_or_none()
            hostel_id = hostel.id if hostel else "h-01"
            
            surplus = SurplusListing(
                id=surplus_id,
                hostel_id=hostel_id,
                title="Fresh Cooked Surplus Batch",
                meals=25,
                location_detail="Central Mess Dispatch Bay 2",
                pickup_deadline="5:00 PM",
                status="Claimed",
                requested_by_ngo=ngo_org_name,
                pickup_otp="8294",
                created_at=datetime.now(timezone.utc)
            )
            db.add(surplus)
            await db.flush()
        else:
            surplus.status = "Claimed"
            surplus.requested_by_ngo = ngo_org_name

        req_stmt = select(SurplusRequest).where(SurplusRequest.surplus_id == surplus.id)
        req_res = await db.execute(req_stmt)
        s_req = req_res.scalar_one_or_none()

        if s_req:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Surplus listing has already been claimed by another partner."
            )

        s_req = SurplusRequest(
            surplus_id=surplus.id,
            ngo_id=ngo_id,
            volunteer_name=req.volunteer_name or "Pranav",
            vehicle=req.vehicle or "Electric Scooter (DL 3S PR 9021)",
            eta=req.eta or "Within 15 mins",
            status="Approved",
            otp=surplus.pickup_otp or "8294",
            requested_at=datetime.now(timezone.utc)
        )
        db.add(s_req)
        await db.commit()
        await db.refresh(s_req)

        await impact_service.record_event(
            db=db,
            event_type="SURPLUS_CLAIMED",
            title=f"{surplus.meals} meals claimed by {ngo_org_name}",
            description=f"Volunteer {req.volunteer_name} dispatched with {req.vehicle or 'van'}. Handover OTP: {surplus.pickup_otp}.",
            quantity=surplus.meals,
            actor_role="ngo",
            actor_name=ngo_org_name,
            ngo_id=ngo_id,
            hostel_id=surplus.hostel_id
        )

        hostel_name = "Hostel A - Central Mess"
        if surplus.hostel_id:
            h_stmt = select(Hostel).where(Hostel.id == surplus.hostel_id)
            h_res = await db.execute(h_stmt)
            h = h_res.scalar_one_or_none()
            if h:
                hostel_name = h.name

        return SurplusRequestOut(
            id=s_req.id,
            surplus_id=surplus.id,
            food_title=surplus.title,
            meals=surplus.meals,
            hostel=hostel_name,
            volunteer_name=s_req.volunteer_name,
            vehicle=s_req.vehicle,
            requested_at=s_req.requested_at.strftime("%I:%M %p"),
            status=s_req.status,
            pickup_time_estimated=req.eta or "Within 30 mins",
            otp=s_req.otp
        )

    async def log_distribution(
        self,
        db: AsyncSession,
        ngo_id: str,
        req: DistributionLogRequest,
        ngo_org_name: str = "Helping Hands NGO"
    ) -> DistributionRecordOut:
        co2_val = round(req.beneficiaries_served * 0.45, 1)

        record = DistributionRecord(
            ngo_id=ngo_id,
            food_title=req.food_title,
            beneficiaries_served=req.beneficiaries_served,
            location=req.location,
            proof_status="Verified",
            co2_diverted_kg=co2_val,
            notes=req.notes,
            delivered_at=datetime.now(timezone.utc)
        )
        db.add(record)

        prof_stmt = select(NgoProfile).where(NgoProfile.id == ngo_id)
        p_res = await db.execute(prof_stmt)
        ngo_prof = p_res.scalar_one_or_none()
        if ngo_prof:
            ngo_prof.total_meals_rescued += req.beneficiaries_served
            ngo_prof.people_served += req.beneficiaries_served
            ngo_prof.co2_diverted_kg = round(ngo_prof.co2_diverted_kg + co2_val, 1)

        await db.commit()
        await db.refresh(record)

        await impact_service.record_event(
            db=db,
            event_type="FOOD_DISTRIBUTED",
            title=f"{req.beneficiaries_served} meals served at {req.location}",
            description=f"Verified hunger relief distribution completed by {ngo_org_name}. {co2_val} kg CO₂ diverted.",
            quantity=req.beneficiaries_served,
            actor_role="ngo",
            actor_name=ngo_org_name,
            ngo_id=ngo_id,
            co2_saved_kg=co2_val
        )

        return DistributionRecordOut(
            id=record.id,
            food_title=record.food_title,
            beneficiaries_served=record.beneficiaries_served,
            location=record.location,
            delivered_at=record.delivered_at.strftime("%I:%M %p, %d %b"),
            co2_diverted_kg=record.co2_diverted_kg,
            proof_status=record.proof_status
        )


ngo_service = NgoService()
