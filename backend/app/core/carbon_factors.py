"""
Scientific Carbon Footprint & Emission Factors Configuration for Used Cooking Oil (UCO)
========================================================================================
Defines scientifically defensible emission factors, lifecycle assessment (LCA) baselines,
oil density conversion standards, and net emission calculation utilities.

Methodology Reference:
- EU Renewable Energy Directive II (RED II 2018/2001/EC) Annex V
- ICCT (International Council on Clean Transportation) UCO-to-Biofuel LCA
- FSSAI Repurpose Used Cooking Oil (RUCO) standard & ASTM D4052 density specification
- IPCC Guidelines for National Greenhouse Gas Inventories (Waste-to-Energy Pathways)
"""

from typing import Dict, Any, Optional, Tuple


# Documented physical density for used vegetable cooking oil at 20-25 deg C
# ASTM D4052 / FSSAI RUCO standard: 0.92 kg per litre (range 0.915 - 0.925 kg/L)
UCO_DENSITY_KG_PER_LITRE = 0.92


# Pathway specifications with documented lifecycle accounting
REPURPOSING_PATHWAYS: Dict[str, Dict[str, Any]] = {
    "Biodiesel Production": {
        "name": "Biodiesel Production (UCOME)",
        "net_factor": 2.65,  # kg CO2e avoided per kg of processed UCO
        "baseline": "Fossil Ultra-Low Sulfur Diesel (3.16 kg CO2e / kg)",
        "processing_transport_emissions": 0.51,  # kg CO2e / kg UCO (transesterification & logistics)
        "gross_avoided_emissions": 3.16,
        "source": "EU RED II Directive (2018/2001/EC) Annex V & ICCT Life-Cycle Assessment",
        "description": "Transesterification into fatty acid methyl ester (FAME) displacing fossil diesel."
    },
    "Biodiesel": {  # Alias
        "name": "Biodiesel Production (UCOME)",
        "net_factor": 2.65,
        "baseline": "Fossil Ultra-Low Sulfur Diesel (3.16 kg CO2e / kg)",
        "processing_transport_emissions": 0.51,
        "gross_avoided_emissions": 3.16,
        "source": "EU RED II Directive (2018/2001/EC) Annex V & ICCT Life-Cycle Assessment",
        "description": "Transesterification into fatty acid methyl ester (FAME) displacing fossil diesel."
    },
    "Hydrotreated Vegetable Oil (HVO / SAF)": {
        "name": "Hydrotreated Vegetable Oil (HVO / SAF)",
        "net_factor": 2.85,
        "baseline": "Fossil Jet-A / Diesel (3.40 kg CO2e / kg)",
        "processing_transport_emissions": 0.55,
        "gross_avoided_emissions": 3.40,
        "source": "ICAO CORSIA Default Life Cycle Emissions for SAF & HVO from UCO",
        "description": "Hydrotreating into renewable drop-in diesel and sustainable aviation fuel."
    },
    "Industrial Soap & Bio-lubricants": {
        "name": "Industrial Soap & Bio-lubricants",
        "net_factor": 1.45,
        "baseline": "Virgin Palm Stearin & Petroleum Base Oil (1.92 kg CO2e / kg)",
        "processing_transport_emissions": 0.47,
        "gross_avoided_emissions": 1.92,
        "source": "Journal of Cleaner Production (LCA of Bio-grease & Saponified Oleochemicals)",
        "description": "Saponification and industrial lubricant formulating displacing virgin feedstock."
    },
    "Industrial Soap": {  # Alias
        "name": "Industrial Soap & Bio-lubricants",
        "net_factor": 1.45,
        "baseline": "Virgin Palm Stearin & Petroleum Base Oil (1.92 kg CO2e / kg)",
        "processing_transport_emissions": 0.47,
        "gross_avoided_emissions": 1.92,
        "source": "Journal of Cleaner Production (LCA of Bio-grease & Saponified Oleochemicals)",
        "description": "Saponification and industrial lubricant formulating displacing virgin feedstock."
    },
    "Biogas & Biomass": {
        "name": "Biogas & Anaerobic Co-Digestion",
        "net_factor": 1.80,
        "baseline": "Grid Natural Gas & Open Landfill Methane Release (2.18 kg CO2e / kg)",
        "processing_transport_emissions": 0.38,
        "gross_avoided_emissions": 2.18,
        "source": "IPCC Guidelines for Waste-to-Energy & EPA Anaerobic Co-Digestion LCA",
        "description": "Anaerobic co-digestion generating biomethane and displacing grid natural gas."
    },
    "Biogas": {  # Alias
        "name": "Biogas & Anaerobic Co-Digestion",
        "net_factor": 1.80,
        "baseline": "Grid Natural Gas & Open Landfill Methane Release (2.18 kg CO2e / kg)",
        "processing_transport_emissions": 0.38,
        "gross_avoided_emissions": 2.18,
        "source": "IPCC Guidelines for Waste-to-Energy & EPA Anaerobic Co-Digestion LCA",
        "description": "Anaerobic co-digestion generating biomethane and displacing grid natural gas."
    }
}


def normalize_to_kg(quantity: float, unit: str) -> float:
    """
    Converts quantity to kilograms using documented density of used cooking oil.
    Standard: 0.92 kg / L for cooking vegetable oils.
    """
    if quantity <= 0:
        return 0.0
    u = unit.strip().lower()
    if u in ["litres", "liter", "l", "ltr", "liters"]:
        return round(quantity * UCO_DENSITY_KG_PER_LITRE, 2)
    return round(quantity, 2)


def get_pathway_details(repurposing_method: Optional[str]) -> Optional[Dict[str, Any]]:
    """Retrieves verified LCA details for a repurposing method, or None if unknown/unverified."""
    if not repurposing_method:
        return None
    method = repurposing_method.strip()
    return REPURPOSING_PATHWAYS.get(method)


def calculate_uco_carbon_savings(
    quantity: float,
    unit: str,
    repurposing_method: Optional[str],
    collection_status: str,
    processed_qty: Optional[float] = None,
    destination: Optional[str] = None,
    reference_number: Optional[str] = None
) -> Tuple[Optional[float], Optional[float], str, str, float]:
    """
    Calculates credible, auditable avoided carbon emissions.
    
    Formula:
        Estimated emissions avoided = Eligible quantity processed (kg) x Applicable net factor

    Rules:
    1. Quantity converted to kg via documented 0.92 kg/L density when recorded in litres.
    2. Emissions savings are calculated ONLY for confirmed Processed quantities.
       Pending or Collected quantities yield 0.0 savings.
    3. If an unrecognized or unverified pathway is selected, returns None for savings,
       displaying "Carbon savings pending verified emission factor".
    4. Measurement status is 'Verified' if destination and reference number exist,
       otherwise 'Estimated'.

    Returns:
        (co2_avoided_kg, factor_used, calculation_basis, measurement_status, quantity_kg)
    """
    total_qty_kg = normalize_to_kg(quantity, unit)

    # Determine eligible processed quantity in kg
    if collection_status == "Processed":
        if processed_qty is not None and processed_qty > 0:
            eligible_kg = normalize_to_kg(min(processed_qty, quantity), unit)
        else:
            eligible_kg = total_qty_kg
    elif processed_qty is not None and processed_qty > 0:
        # Partial processing tracked before full status change
        eligible_kg = normalize_to_kg(min(processed_qty, quantity), unit)
    else:
        eligible_kg = 0.0

    # Unprocessed status
    if eligible_kg <= 0 or collection_status != "Processed":
        return (
            0.0,
            None,
            f"Zero savings counted ({collection_status} status; only confirmed Processed quantities earn carbon credit)",
            "Awaiting Processing",
            total_qty_kg
        )

    # Check pathway
    pathway = get_pathway_details(repurposing_method)
    if not pathway:
        return (
            None,
            None,
            "Carbon savings pending verified emission factor (no scientifically defensible factor available for this pathway)",
            "Pending Factor Verification",
            total_qty_kg
        )

    factor = pathway["net_factor"]
    co2_avoided = round(eligible_kg * factor, 2)
    measurement_status = "Verified" if (destination and reference_number) else "Estimated"

    basis = (
        f"{eligible_kg:.2f} kg UCO processed via {pathway['name']} x "
        f"{factor} kg CO2e/kg net factor ({pathway['source']})"
    )

    return (co2_avoided, factor, basis, measurement_status, total_qty_kg)
