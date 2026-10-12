# MessWise Enterprise Product Audit & SIH-Ready Architectural Specification

> **Smart India Hackathon (SIH) Evaluation Document**  
> *Campus Food Governance, Demand Forecasting & Closed-Loop Sustainability Platform*

---

## 1. System Architecture & Core Product Flow

MessWise implements a complete closed-loop food governance lifecycle:
$$\text{PREDICT} \longrightarrow \text{PREVENT} \longrightarrow \text{MEASURE} \longrightarrow \text{RESCUE} \longrightarrow \text{VERIFY} \longrightarrow \text{LEARN}$$

```
   ┌─────────────────────────────────────────────────────────────┐
   │                  STUDENT PORTAL (Port 3001)                 │
   │  • Meal Attendance RSVP & Smart Skip (with cutoff timers)   │
   │  • Weekly Dining Menu Calendar                              │
   │  • Digital Entry Pass (QR Code) & Dietary Feedback          │
   │  • Personal Green Impact & Zero-Plate-Waste Records         │
   └───────────────┬─────────────────────────────────────────────┘
                   │ Real-time RSVP / Opt-Out Signals
                   ▼
   ┌─────────────────────────────────────────────────────────────┐
   │             FASTAPI BACKEND & ML ENGINE (Port 8000)          │
   │  • XGBoost Regressor (12 Features, MAE: 6.25 thalis)        │
   │  • Asynchronous SQLAlchemy ORM (14 Relational Models)       │
   │  • JWT Role-Based Access Control (Admin, Student, NGO)      │
   │  • Calibrated Buffer Factor (+2.6% Safety Margin)           │
   └───────┬─────────────────────────────────────────────┬───────┘
           │ Predicted Demand & Prep Target              │ Available Surplus Alert
           ▼                                             ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────┐
│       ADMIN PORTAL (Port 3002)       │     │       NGO PORTAL (Port 3003)      │
│ • Operational KPIs & Shift Audits    │     │ • Verified Surplus Catalog        │
│ • Production & 3-Tier Waste Logger   │     │ • 1-Click Concurrency Claims      │
│ • Mandi & Kitchen Stock Management   │     │ • Rider Telemetry & Dispatch Bay  │
│ • Used Cooking Oil (RUCO/Biofuel)    │     │ • 4-Digit Handover OTP Clearance  │
│ • GreenRoute EV Quick-Commerce Fleet │     │ • Beneficiary Distribution Logs   │
│ • Environmental Impact & Emission CO2│     └───────────────────────────────────┘
└──────────────────────────────────────┘
```

---

## 2. Existing Features & Audit Status

| Subsystem / Feature | Functional State | Architectural Health | UI/UX Status | Action in Current Sprint |
|---|---|---|---|---|
| **Demand Prediction** | Trained XGBoost model active (`val_mae=6.25`, `val_r2=0.9908`) | Excellent (1.00ms latency p95, static float32 buffer) | Needed transparency display for hackathon judges | Expose model metrics, feature weights, latency & compute footprint |
| **Student RSVP & Meal Skipping** | Functional toggle updating database | Healthy (persisted across sessions) | Previously used emojis; cutoff rules needed clarity | Clean Lucide icons, explicit cutoff countdown badges, demand feedback |
| **Kitchen Waste Tracking** | Production & leftover logger functional | Healthy (SQLite/PostgreSQL schema) | Needed clear 3-tier categorization | Standardize: Preparation Waste, Counter Leftover, Plate Waste |
| **Used Cooking Oil (UCO)** | Dedicated UCO management tab | Healthy (TPM testing & drum logging) | Had decorative emoji badges | Replace with clean SVG indicators, RUCO FSSAI compliance badges |
| **GreenRoute Fleet** | Dispatch simulation, HSRP plate, OTP handover | Unified to single component; deduplication active | Emojis in platform tags and selector chips | Clean Lucide vehicle & routing icons; crisp enterprise card layout |
| **NGO Rescue Network** | Concurrency-safe claim & OTP flow | Healthy (BroadcastChannel sync) | Minor emoji badges in cards | Professional enterprise badge tokens and clear status pills |
| **Design System** | Vanilla CSS tokens | Fast load, zero Tailwind dependency | Inconsistent dark/neon gradients and informal emojis | Upgrade to calm enterprise deep forest green (`#123b2a`), Inter typography |

---

## 3. UI/UX Problems Identified & Root Causes

1. **Informal Emoji Contamination**:
   - *Problem*: Interface buttons, tabs, tables, and notifications contained casual emojis (`🌅`, `☀️`, `🌙`, `🥇`, `🛵`, `🌱`, `🍲`, `👑`).
   - *Root Cause*: Early prototype phase used emojis as quick visual placeholders.
   - *Fix*: Replace all emojis with standardized outline icons from `lucide-react` with consistent 14-18px bounding box and 2px stroke width.

2. **Excessive Decorative Gradients & Glassmorphism**:
   - *Problem*: Heavy neon drop shadows and multi-stop gradient headers made the interface appear consumer/gamified rather than serious university administrative software.
   - *Root Cause*: Lack of strict enterprise CSS tokens across sub-portals.
   - *Fix*: Establish calm enterprise styling: deep forest green primary (`#123b2a`), subtle 1px border lines (`#e2e8f0`), warm off-white canvas (`#f8fafc`), and purposeful whitespace.

3. **Data Traceability & Environmental Calculation Claims**:
   - *Problem*: Carbon numbers could be misconstrued as generic estimates.
   - *Root Cause*: Missing explicit methodology disclosures on calculation cards.
   - *Fix*: Clearly display documented emission factors:
     - **Food Waste Avoided**: $2.50\text{ kg CO}_2\text{e per kg food saved}$ (UN FAO / EPA WARM benchmark).
     - **Used Cooking Oil Recycled**: $2.82\text{ kg CO}_2\text{e per liter UCO}$ diverted to certified EN 14214 biodiesel.
     - Label estimates distinctly from raw physical scale measurements.

---

## 4. Prioritized Implementation Plan

1. **Phase 1: Design Token Harmonization (`index.css`)**:
   - Implement deep forest green (`#123b2a`), crisp neutral slate borders, Inter typography, and responsive grid layouts without Tailwind.
2. **Phase 2: Purge Informal Emojis Across All Portals**:
   - Replace every emoji in navigation, tables, badges, headers, and buttons with Lucide React outline icons.
3. **Phase 3: Enterprise Admin Portal Refinement**:
   - Integrate KPIs, 3-tier waste logger, inventory alerts, UCO drum records, and ML transparency drawer.
4. **Phase 4: Student Portal Experience**:
   - Implement clear meal session tabs (Breakfast, Lunch, Dinner), meal skip cutoff badges with real-time feedback, and weekly menu calendar.
5. **Phase 5: NGO Rescue Portal & GreenRoute Dispatch**:
   - Polish surplus catalog, real-time OTP collection counter, and distribution verification logs.
6. **Phase 6: End-to-End Chrome Browser Verification**:
   - Perform automated browser testing on all ports (`:3001`, `:3002`, `:3003`, `:5173`) and document results.
