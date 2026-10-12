"""
Used Cooking Oil (UCO) Recycling & Carbon Calculation Service
=============================================================
Manages UCO logs, state progression (Pending -> Collected -> Processed),
partial collection/processing without double-counting, and scientifically
defensible emissions avoidance accounting.
"""
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, date, timezone
from sqlalchemy import select, func, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.uco import UcoRecord
from app.models.impact import ImpactEvent
from app.schemas.uco import (
    UcoCreateRequest,
    UcoUpdateRequest,
    UcoTransitionRequest,
    MonthlyUcoTrend,
    StatusDistribution,
    PathwayInfo,
    UcoSummaryResponse
)
from app.core.carbon_factors import (
    UCO_DENSITY_KG_PER_LITRE,
    REPURPOSING_PATHWAYS,
    normalize_to_kg,
    calculate_uco_carbon_savings
)


SAFETY_GUIDELINES = (
    "Safe Kitchen Protocols for Used Cooking Oil (UCO):\n"
    "1. Thermal Safety: Allow hot oil to cool completely below 40 deg C before pouring into storage drums.\n"
    "2. Container Integrity: Store only in food-grade, airtight, high-density polyethylene (HDPE) or stainless-steel barrels.\n"
    "3. Contamination Prevention: Do not mix oil with food solids, water, chemical detergents, or general trash.\n"
    "4. Drain & Health Prohibition: NEVER dispose of degraded frying oil into sink drains or sewer lines (prevents fatbergs). "
    "Degraded oil must NEVER be reused for human consumption (high polar compound risk).\n"
    "5. Authorized Handover: Release oil only to certified biofuel aggregators or authorized industrial recyclers with signed consignment receipts."
)

METHODOLOGY_SUMMARY = (
    "Emissions avoidance is computed strictly for eligible processed quantities: "
    "Emissions Avoided (kg CO2e) = Eligible UCO Processed (kg) x Pathway Net Factor. "
    "Volume in litres is converted to mass using ASTM D4052 / FSSAI RUCO standard density (0.92 kg/L). "
    "Net emission factors account for displaced fossil baselines minus refining and transport emissions. "
    "Pending collections yield 0.0 carbon credit until recycling is confirmed."
)


class UcoService:
    async def create_record(
        self,
        db: AsyncSession,
        req: UcoCreateRequest,
        recorded_by: str = "Mess Supervisor"
    ) -> UcoRecord:
        """Creates a new UCO entry and runs transparent carbon calculations."""
        # Calculate initial carbon savings
        co2_avoided, factor, basis, measurement_status, qty_kg = calculate_uco_carbon_savings(
            quantity=req.quantity,
            unit=req.unit,
            repurposing_method=req.repurposing_method,
            collection_status=req.collection_status,
            destination=req.destination,
            reference_number=req.reference_number
        )

        collected = req.quantity if req.collection_status in ["Collected", "Processed"] else 0.0
        processed = req.quantity if req.collection_status == "Processed" else 0.0

        record = UcoRecord(
            recorded_by=recorded_by,
            disposal_date=req.disposal_date or date.today(),
            quantity=req.quantity,
            unit=req.unit,
            quantity_kg=qty_kg,
            collected_qty=collected,
            processed_qty=processed,
            oil_type=req.oil_type or "Mixed Cooking Oil",
            destination=req.destination,
            repurposing_method=req.repurposing_method,
            collection_status=req.collection_status,
            co2_avoided_kg=co2_avoided,
            emission_factor_used=factor,
            calculation_basis=basis,
            measurement_status=measurement_status,
            reference_number=req.reference_number,
            remarks=req.remarks
        )

        db.add(record)
        await db.commit()
        await db.refresh(record)

        # Record impact event if processed immediately
        if record.collection_status == "Processed" and (co2_avoided or 0) > 0:
            await self._record_impact_event(db, record)

        return record

    async def update_record(
        self,
        db: AsyncSession,
        record_id: str,
        req: UcoUpdateRequest
    ) -> UcoRecord:
        """Updates an existing UCO entry and recalibrates carbon calculations."""
        stmt = select(UcoRecord).where(UcoRecord.id == record_id)
        result = await db.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Used cooking oil record with id '{record_id}' not found."
            )

        # Update scalar fields if provided
        if req.disposal_date is not None:
            record.disposal_date = req.disposal_date
        if req.quantity is not None:
            record.quantity = req.quantity
        if req.unit is not None:
            record.unit = req.unit
        if req.oil_type is not None:
            record.oil_type = req.oil_type
        if req.destination is not None:
            record.destination = req.destination
        if req.repurposing_method is not None:
            record.repurposing_method = req.repurposing_method
        if req.collection_status is not None:
            record.collection_status = req.collection_status
        if req.reference_number is not None:
            record.reference_number = req.reference_number
        if req.remarks is not None:
            record.remarks = req.remarks

        # Handle partial amounts if specified, otherwise reconcile with status
        if req.collected_qty is not None:
            record.collected_qty = min(req.collected_qty, record.quantity)
        elif record.collection_status in ["Collected", "Processed"]:
            record.collected_qty = record.quantity
        elif record.collection_status == "Pending":
            record.collected_qty = 0.0

        if req.processed_qty is not None:
            record.processed_qty = min(req.processed_qty, record.quantity)
        elif record.collection_status == "Processed":
            record.processed_qty = record.collected_qty if record.collected_qty else record.quantity
        elif record.collection_status != "Processed":
            record.processed_qty = 0.0

        # Recalculate carbon savings
        co2_avoided, factor, basis, measurement_status, qty_kg = calculate_uco_carbon_savings(
            quantity=record.quantity,
            unit=record.unit,
            repurposing_method=record.repurposing_method,
            collection_status=record.collection_status,
            processed_qty=record.processed_qty,
            destination=record.destination,
            reference_number=record.reference_number
        )

        record.quantity_kg = qty_kg
        record.co2_avoided_kg = co2_avoided
        record.emission_factor_used = factor
        record.calculation_basis = basis
        record.measurement_status = measurement_status
        record.updated_at = datetime.now(timezone.utc)

        await db.commit()
        await db.refresh(record)

        if record.collection_status == "Processed" and (co2_avoided or 0) > 0:
            await self._record_impact_event(db, record)

        return record

    async def transition_record(
        self,
        db: AsyncSession,
        record_id: str,
        req: UcoTransitionRequest,
        admin_name: str = "Mess Supervisor"
    ) -> UcoRecord:
        """
        Transitions status along the recycling chain: Pending -> Collected -> Processed.
        Supports partial transitions by splitting into a confirmed processed child batch
        to ensure exact quantity accounting and zero double-counting.
        """
        stmt = select(UcoRecord).where(UcoRecord.id == record_id)
        result = await db.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Used cooking oil record '{record_id}' not found."
            )

        # Validate transition order
        if req.target_status == "Processed" and record.collection_status == "Pending":
            # Auto-advance collection with destination check
            if not req.destination and not record.destination:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A destination or authorized recycling partner is required to transition to Processed."
                )

        target_qty = req.quantity_to_transition
        if target_qty and target_qty < record.quantity:
            # Partial transition: split the record
            remaining_qty = round(record.quantity - target_qty, 2)
            unit = record.unit

            # Update parent record to hold remaining quantity at current status
            record.quantity = remaining_qty
            record.quantity_kg = normalize_to_kg(remaining_qty, unit)
            if record.collection_status == "Pending":
                record.collected_qty = 0.0
                record.processed_qty = 0.0
            elif record.collection_status == "Collected":
                record.collected_qty = remaining_qty
                record.processed_qty = 0.0
            record.updated_at = datetime.now(timezone.utc)

            # Create child record for the transitioned portion
            destination = req.destination or record.destination
            repurposing_method = req.repurposing_method or record.repurposing_method
            ref_no = req.reference_number or record.reference_number
            remarks = req.remarks or f"Partial transition from batch {record.id[:8]}"

            co2_avoided, factor, basis, measurement_status, child_qty_kg = calculate_uco_carbon_savings(
                quantity=target_qty,
                unit=unit,
                repurposing_method=repurposing_method,
                collection_status=req.target_status,
                destination=destination,
                reference_number=ref_no
            )

            child_record = UcoRecord(
                recorded_by=record.recorded_by,
                disposal_date=record.disposal_date,
                quantity=target_qty,
                unit=unit,
                quantity_kg=child_qty_kg,
                collected_qty=target_qty if req.target_status in ["Collected", "Processed"] else 0.0,
                processed_qty=target_qty if req.target_status == "Processed" else 0.0,
                oil_type=record.oil_type,
                destination=destination,
                repurposing_method=repurposing_method,
                collection_status=req.target_status,
                co2_avoided_kg=co2_avoided,
                emission_factor_used=factor,
                calculation_basis=basis,
                measurement_status=measurement_status,
                reference_number=ref_no,
                remarks=remarks
            )
            db.add(child_record)
            await db.commit()
            await db.refresh(child_record)

            if child_record.collection_status == "Processed" and (co2_avoided or 0) > 0:
                await self._record_impact_event(db, child_record)

            return child_record
        else:
            # Full transition of existing record
            record.collection_status = req.target_status
            if req.destination:
                record.destination = req.destination
            if req.repurposing_method:
                record.repurposing_method = req.repurposing_method
            if req.reference_number:
                record.reference_number = req.reference_number
            if req.remarks:
                record.remarks = req.remarks

            if req.target_status == "Collected":
                record.collected_qty = record.quantity
                record.processed_qty = 0.0
            elif req.target_status == "Processed":
                record.collected_qty = record.quantity
                record.processed_qty = record.quantity

            co2_avoided, factor, basis, measurement_status, qty_kg = calculate_uco_carbon_savings(
                quantity=record.quantity,
                unit=record.unit,
                repurposing_method=record.repurposing_method,
                collection_status=record.collection_status,
                processed_qty=record.processed_qty,
                destination=record.destination,
                reference_number=record.reference_number
            )

            record.quantity_kg = qty_kg
            record.co2_avoided_kg = co2_avoided
            record.emission_factor_used = factor
            record.calculation_basis = basis
            record.measurement_status = measurement_status
            record.updated_at = datetime.now(timezone.utc)

            await db.commit()
            await db.refresh(record)

            if record.collection_status == "Processed" and (co2_avoided or 0) > 0:
                await self._record_impact_event(db, record)

            return record

    async def get_records(
        self,
        db: AsyncSession,
        status_filter: Optional[str] = None,
        oil_type: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[UcoRecord]:
        """Retrieves UCO entries with optional multi-attribute filters."""
        stmt = select(UcoRecord).order_by(desc(UcoRecord.disposal_date), desc(UcoRecord.created_at))

        conditions = []
        if status_filter and status_filter.lower() != "all":
            conditions.append(UcoRecord.collection_status == status_filter.capitalize())
        if oil_type and oil_type.lower() != "all":
            conditions.append(UcoRecord.oil_type.ilike(f"%{oil_type}%"))
        if start_date:
            conditions.append(UcoRecord.disposal_date >= start_date)
        if end_date:
            conditions.append(UcoRecord.disposal_date <= end_date)

        if conditions:
            stmt = stmt.where(and_(*conditions))

        stmt = stmt.offset(offset).limit(limit)
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def get_record_by_id(self, db: AsyncSession, record_id: str) -> UcoRecord:
        """Retrieves a single UCO entry by UUID."""
        stmt = select(UcoRecord).where(UcoRecord.id == record_id)
        result = await db.execute(stmt)
        record = result.scalar_one_or_none()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Record '{record_id}' not found."
            )
        return record

    async def delete_record(self, db: AsyncSession, record_id: str) -> Dict[str, Any]:
        """Deletes a UCO entry."""
        record = await self.get_record_by_id(db, record_id)
        await db.delete(record)
        await db.commit()
        return {"success": True, "message": f"UCO record '{record_id}' deleted successfully."}

    async def get_summary(
        self,
        db: AsyncSession,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> UcoSummaryResponse:
        """
        Computes aggregate metrics, monthly recycling trends, status distribution,
        and net carbon footprint benefits.
        """
        records = await self.get_records(db, start_date=start_date, end_date=end_date, limit=1000)

        tot_gen_kg = 0.0
        tot_gen_l = 0.0
        tot_col_kg = 0.0
        tot_col_l = 0.0
        tot_pro_kg = 0.0
        tot_pro_l = 0.0
        tot_co2 = 0.0
        verified_co2 = 0.0

        pending_count = 0
        collected_count = 0
        processed_count = 0

        pending_l = 0.0
        collected_l = 0.0
        processed_l = 0.0

        monthly_map: Dict[str, Dict[str, float]] = {}

        for r in records:
            # Volume in litres (normalise if recorded in kg)
            vol_l = r.quantity if r.unit == "litres" else round(r.quantity / UCO_DENSITY_KG_PER_LITRE, 2)
            weight_kg = r.quantity_kg or normalize_to_kg(r.quantity, r.unit)

            tot_gen_kg += weight_kg
            tot_gen_l += vol_l

            month_key = r.disposal_date.strftime("%Y-%m") if r.disposal_date else "2025-09"
            if month_key not in monthly_map:
                monthly_map[month_key] = {
                    "generated_litres": 0.0,
                    "collected_litres": 0.0,
                    "processed_litres": 0.0,
                    "co2_avoided_kg": 0.0
                }
            monthly_map[month_key]["generated_litres"] += vol_l

            if r.collection_status == "Pending":
                pending_count += 1
                pending_l += vol_l
            elif r.collection_status == "Collected":
                collected_count += 1
                collected_l += vol_l
                tot_col_l += vol_l
                tot_col_kg += weight_kg
                monthly_map[month_key]["collected_litres"] += vol_l
            elif r.collection_status == "Processed":
                processed_count += 1
                processed_l += vol_l
                tot_col_l += vol_l
                tot_col_kg += weight_kg
                tot_pro_l += vol_l
                tot_pro_kg += weight_kg
                monthly_map[month_key]["collected_litres"] += vol_l
                monthly_map[month_key]["processed_litres"] += vol_l

                if r.co2_avoided_kg:
                    tot_co2 += r.co2_avoided_kg
                    monthly_map[month_key]["co2_avoided_kg"] += r.co2_avoided_kg
                    if r.measurement_status == "Verified":
                        verified_co2 += r.co2_avoided_kg

        # Format monthly trends sorted chronologically
        trends = [
            MonthlyUcoTrend(
                month=m,
                generated_litres=round(data["generated_litres"], 1),
                collected_litres=round(data["collected_litres"], 1),
                processed_litres=round(data["processed_litres"], 1),
                co2_avoided_kg=round(data["co2_avoided_kg"], 1)
            )
            for m, data in sorted(monthly_map.items())
        ]

        # Status distribution
        distribution = StatusDistribution(
            pending_litres=round(pending_l, 1),
            collected_litres=round(collected_l, 1),
            processed_litres=round(processed_l, 1),
            pending_count=pending_count,
            collected_count=collected_count,
            processed_count=processed_count
        )

        # Supported pathways formatted
        pathways_dict: Dict[str, PathwayInfo] = {
            k: PathwayInfo(
                name=v["name"],
                net_factor=v["net_factor"],
                baseline=v["baseline"],
                processing_transport_emissions=v["processing_transport_emissions"],
                gross_avoided_emissions=v["gross_avoided_emissions"],
                source=v["source"],
                description=v["description"]
            )
            for k, v in REPURPOSING_PATHWAYS.items()
            if k in ["Biodiesel Production", "Hydrotreated Vegetable Oil (HVO / SAF)", "Industrial Soap & Bio-lubricants", "Biogas & Biomass"]
        }

        pending_col_l = max(0.0, tot_gen_l - tot_col_l)
        pending_col_kg = max(0.0, tot_gen_kg - tot_col_kg)

        return UcoSummaryResponse(
            total_oil_generated_litres=round(tot_gen_l, 1),
            total_oil_generated_kg=round(tot_gen_kg, 1),
            total_oil_collected_litres=round(tot_col_l, 1),
            total_oil_collected_kg=round(tot_col_kg, 1),
            total_oil_processed_litres=round(tot_pro_l, 1),
            total_oil_processed_kg=round(tot_pro_kg, 1),
            pending_collection_litres=round(pending_col_l, 1),
            pending_collection_kg=round(pending_col_kg, 1),
            estimated_net_co2e_avoided_kg=round(tot_co2, 2),
            verified_co2e_avoided_kg=round(verified_co2, 2),
            total_records=len(records),
            monthly_trends=trends,
            status_distribution=distribution,
            supported_pathways=pathways_dict,
            oil_density_kg_per_litre=UCO_DENSITY_KG_PER_LITRE,
            safety_guidelines=SAFETY_GUIDELINES,
            methodology_summary=METHODOLOGY_SUMMARY
        )

    async def _record_impact_event(self, db: AsyncSession, record: UcoRecord):
        """Logs a public audit event into the sustainability impact ledger."""
        try:
            ev = ImpactEvent(
                event_type="UCO_RECYCLED",
                title=f"{record.quantity} {record.unit} UCO Repurposed into {record.repurposing_method or 'Biodiesel'}",
                description=(
                    f"Used cooking oil transferred to {record.destination or 'Authorized Recycler'}. "
                    f"Avoided {record.co2_avoided_kg:.1f} kg CO2e via verified fossil fuel displacement."
                ),
                quantity=int(record.quantity),
                unit=record.unit,
                actor_role="admin",
                actor_name=record.recorded_by,
                co2_saved_kg=record.co2_avoided_kg or 0.0,
                created_at=datetime.now(timezone.utc)
            )
            db.add(ev)
            await db.commit()
        except Exception:
            # Non-blocking impact event
            pass


uco_service = UcoService()
