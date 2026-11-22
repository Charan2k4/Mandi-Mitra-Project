# Cloud Deployment Guide — Mandi Mitra

This guide details how to deploy Mandi Mitra to production using **Supabase** (Database), **Render** (Backend API), and **Vercel** (Frontend UI).

---

## 1. Database Deployment: Supabase PostgreSQL

1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Under **Project Settings $\rightarrow$ Database**, locate your **Connection parameters**.
3. Copy the **URI** connection string using the **Transaction Pooler** (port `6543`, IPv4 compatible).
4. Go to the **SQL Editor** in your Supabase dashboard:
   - Copy and paste `database/schema.sql`, then click **Run**.
   - (Optional) Copy and paste `database/seed.sql`, then click **Run**.

---

## 2. Backend Deployment: Render

1. Log in to [Render](https://render.com) and click **New $\rightarrow$ Web Service**.
2. Connect your GitHub repository.
3. Configure service settings:
   - **Name**: `mandi-mitra-api`
   - **Region**: Singapore or Frankfurt (closest to your users)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (repository root)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
4. Configure **Environment Variables**:
   - `DATABASE_URL`: Your Supabase Transaction Pooler URL (`postgresql://postgres.[REF]:[PASS]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require`).
   - `ENVIRONMENT`: `production`
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app` (your Vercel domain)
   - `DATA_GOV_IN_API_KEY`: Your Data.gov.in API Key (if obtained)
5. Click **Create Web Service**.
6. Once deployed, test your health check at:
   `https://mandi-mitra-api.onrender.com/api/health`

---

## 3. Frontend Deployment: Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New $\rightarrow$ Project**.
2. Import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Configure **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://mandi-mitra-api.onrender.com/api`
5. Click **Deploy**.
6. Once deployed, add your Vercel URL to the `CORS_ORIGINS` environment variable in your Render backend settings.

---

## 4. Production Checklist

- [ ] Supabase password contains no unencoded special characters.
- [ ] Database URL includes `?sslmode=require`.
- [ ] Render `CORS_ORIGINS` matches the exact Vercel production domain.
- [ ] No local `.env` files or SQLite databases are committed to GitHub.
- [ ] Health endpoint returns `"status": "healthy"`.
