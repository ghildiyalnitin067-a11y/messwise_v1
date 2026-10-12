# MessWise Production Deployment Guide

This guide provides complete instructions for deploying the **MessWise** platform across **Vercel** and **Render** with dedicated micro-frontends.

---

## Architecture Overview

* **Backend Service**: FastAPI (Python 3.10+) with Uvicorn, Async SQLAlchemy, ML Demand Forecasting, and WebSockets.
  * **Hosted on**: **Render** (`backend/`)
* **Dedicated Portals**:
  1. **Mess Admin Portal**: Kitchen management, batch scaling, and OTP handover verification (`admin-portal/`).
  2. **Student Portal**: Meal attendance RSVPs, food preferences, and eco-impact leaderboard (`student-portal/`).
  3. **NGO Food Rescue Portal**: Surplus food live broadcast, pickup vehicle dispatch, and distribution logs (`ngo-portal/`).
  * **Hosted on**: **Vercel** (or **Render**)

---

## 1. Deploying Portals to Vercel

Each portal has its own configuration (`vercel.json`) with SPA routing rules.

### Deploying the Admin Portal (`admin-portal/`)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New...** → **Project**.
2. Import the `messwise_v1` repository.
3. In **Root Directory**, click **Edit** and select **`admin-portal`**.
4. Set **Environment Variable**:
   * `VITE_API_URL`: `https://<your-render-backend-url>/api/v1`
5. Click **Deploy**.

### Deploying the Student Portal (`student-portal/`)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New...** → **Project**.
2. Import the `messwise_v1` repository.
3. In **Root Directory**, click **Edit** and select **`student-portal`**.
4. Set **Environment Variable**:
   * `VITE_API_URL`: `https://<your-render-backend-url>/api/v1`
5. Click **Deploy**.

### Deploying the NGO Portal (`ngo-portal/`)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → **Add New...** → **Project**.
2. Import the `messwise_v1` repository.
3. In **Root Directory**, click **Edit** and select **`ngo-portal`**.
4. Set **Environment Variable**:
   * `VITE_API_URL`: `https://<your-render-backend-url>/api/v1`
5. Click **Deploy**.

---

## 2. Deploying Backend to Render

### 1-Click Blueprint (Render)
1. Go to [Render Dashboard](https://dashboard.render.com) → **New +** → **Blueprint**.
2. Select your `messwise_v1` repository.
3. Render automatically provisions:
   * **`messwise-api`**: FastAPI Web Service with Python runtime, Uvicorn, and auto-seeding.
   * **`messwise-admin`**: Static site for `admin-portal`.
   * **`messwise-student`**: Static site for `student-portal`.
   * **`messwise-ngo`**: Static site for `ngo-portal`.
4. Click **Apply**.

### Manual Backend Setup (Render Web Service)
1. Click **New +** → **Web Service**.
2. Set:
   * **Root Directory**: `backend`
   * **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Health Check Path**: `/api/v1/health`
3. Add **Environment Variables**:
   * `ENVIRONMENT`: `production`
   * `PROJECT_NAME`: `MessWise`
   * `SECRET_KEY`: `(generate 32+ character key)`
   * `DATABASE_URL`: `sqlite+aiosqlite:///./messwise.db`
   * `BACKEND_CORS_ORIGINS`: `*`
   * `AUTO_SEED_DATA`: `true`
4. Click **Create Web Service**.

---

## 3. Local Multi-Portal Run Commands

* **Run Admin Portal**: `npm run dev:admin` (runs on `http://localhost:3002`)
* **Run Student Portal**: `npm run dev:student` (runs on `http://localhost:3001`)
* **Run NGO Portal**: `npm run dev:ngo` (runs on `http://localhost:3003`)
* **Build All Portals**: `npm run build`
* **Docker Compose (All Portals + Backend)**: `npm run docker:up`
