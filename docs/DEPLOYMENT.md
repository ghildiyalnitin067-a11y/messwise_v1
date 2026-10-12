# MessWise Production Deployment Guide (Vercel & Render)

This guide provides complete, production-tested instructions for deploying the **MessWise** platform on **Vercel** and **Render**.

---

## Architecture Overview

* **Backend Service**: FastAPI (Python 3.10+) with Uvicorn, SQLAlchemy Async, ML Demand Forecasting, and WebSocket sync.
  * **Recommended Host**: **Render** (Web Service with persistent disk or PostgreSQL)
* **Frontend Ecosystem**: React 18 + Vite SPA with integrated Student, Admin, NGO portals, and optional micro-frontend routing.
  * **Recommended Host**: **Vercel** or **Render** (Static Site)

---

## 1. Deploying to Vercel (Frontend)

Vercel provides blazing-fast edge CDN distribution and instant deployments for the React/Vite frontend.

### Option A: Direct Root Repository Deployment (1-Click)
1. Push your code to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.
3. Import your `Messwise` repository.
4. Keep the **Root Directory** as `./` (the root).
5. Vercel automatically detects `vercel.json` and uses:
   * **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build`
   * **Output Directory**: `frontend/dist`
6. Under **Environment Variables**, add:
   * `VITE_API_URL`: URL of your backend (e.g. `https://messwise-api.onrender.com/api/v1`)
   * *(Optional)* `VITE_STUDENT_PORTAL_URL`: *(Only if deploying separate micro-frontend domains)*
   * *(Optional)* `VITE_ADMIN_PORTAL_URL`: *(Only if deploying separate micro-frontend domains)*
   * *(Optional)* `VITE_NGO_PORTAL_URL`: *(Only if deploying separate micro-frontend domains)*
7. Click **Deploy**.

### Option B: Subdirectory Deployment (`frontend/`)
1. Import repository on Vercel.
2. Edit **Root Directory** and select `frontend`.
3. Vercel automatically detects the **Vite** preset and uses `frontend/vercel.json`:
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Add environment variable `VITE_API_URL=https://messwise-api.onrender.com/api/v1`.
5. Click **Deploy**.

> **Note on Client-Side Routing**: `vercel.json` includes SPA rewrites (`"source": "/(.*)", "destination": "/index.html"`), so refreshing `/admin`, `/student`, `/ngo`, or `/login` will never produce 404 errors.

---

## 2. Deploying to Render (Backend & Full-Stack Blueprint)

Render natively supports Python web services with Uvicorn, as well as static sites and managed PostgreSQL.

### Method A: 1-Click Infrastructure as Code (Render Blueprint)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Select your GitHub repository (`Messwise`).
4. Render automatically reads `render.yaml` and provisions:
   * **`messwise-api`**: FastAPI Web Service running Uvicorn on Python runtime.
     * Auto-detects port via `$PORT`
     * Health check endpoint: `/api/v1/health`
     * Auto-seeds initial campus dataset (`AUTO_SEED_DATA=true`)
   * **`messwise-portal`**: Static site hosting the frontend with client-side SPA routing rules.
5. Click **Apply**.

### Method B: Manual Render Web Service (Backend Only)
If you are deploying frontend on Vercel and backend on Render:
1. Click **New +** → **Web Service**.
2. Connect your repo and set:
   * **Name**: `messwise-api`
   * **Root Directory**: `backend`
   * **Runtime**: `Python`
   * **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Health Check Path**: `/api/v1/health`
3. Add **Environment Variables**:
   * `ENVIRONMENT`: `production`
   * `PROJECT_NAME`: `MessWise`
   * `SECRET_KEY`: `(click Generate or provide random 32+ char string)`
   * `DATABASE_URL`: `sqlite+aiosqlite:///./messwise.db` *(or your Render PostgreSQL async URL)*
   * `BACKEND_CORS_ORIGINS`: `https://your-vercel-domain.vercel.app,*` *(supports comma-separated list or wildcard)*
   * `AUTO_SEED_DATA`: `true`
4. Click **Create Web Service**.
5. Copy your Render service URL (e.g., `https://messwise-api.onrender.com`) and paste it as `VITE_API_URL` (with `/api/v1`) into Vercel.

---

## 3. Environment Variable Reference

| Variable | Target | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | Frontend (Vercel/Render) | Base URL for FastAPI backend endpoints | `https://messwise-api.onrender.com/api/v1` |
| `BACKEND_CORS_ORIGINS` | Backend (Render) | Allowed frontend domains (supports `*`, comma-separated, or JSON) | `https://messwise.vercel.app,*` |
| `SECRET_KEY` | Backend (Render) | JWT signature secret | Random 32+ characters |
| `DATABASE_URL` | Backend (Render) | Database connection string (Async dialect) | `sqlite+aiosqlite:///./messwise.db` |
| `AUTO_SEED_DATA` | Backend (Render) | Populate demo users, meals, and surplus listings | `true` |
| `ENVIRONMENT` | Backend (Render) | Runtime environment mode | `production` |
| `VITE_STUDENT_PORTAL_URL` | Frontend *(Optional)* | Separate origin URL for Student Portal | `https://messwise-student.vercel.app` |
| `VITE_ADMIN_PORTAL_URL` | Frontend *(Optional)* | Separate origin URL for Admin Portal | `https://messwise-admin.vercel.app` |
| `VITE_NGO_PORTAL_URL` | Frontend *(Optional)* | Separate origin URL for NGO Portal | `https://messwise-ngo.vercel.app` |

---

## 4. Verification & Health Checks

After deployment, verify the platform:
1. **API Health**: `https://<YOUR-RENDER-API>/api/v1/health` → returns `{"status":"healthy","database":"connected"}`
2. **Interactive Swagger Docs**: `https://<YOUR-RENDER-API>/api/v1/docs`
3. **Frontend Hub**: `https://<YOUR-VERCEL-URL>/`
4. **Direct Portal Routes**:
   * Student RSVPs: `https://<YOUR-VERCEL-URL>/student`
   * Admin Operations: `https://<YOUR-VERCEL-URL>/admin`
   * NGO Rescue Feed: `https://<YOUR-VERCEL-URL>/ngo`
