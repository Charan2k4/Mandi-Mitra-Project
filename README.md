# Mandi Mitra – Sell-or-Hold Advisor for Farmers

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL / Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Tests](https://img.shields.io/badge/pytest-15%20passed-brightgreen.svg?style=flat&logo=pytest&logoColor=white)](backend/tests)

> **Mandi Mitra** helps Indian farmers make smarter selling decisions by comparing regional APMC market prices, calculating exact net profit after vehicle freight and local charges, and providing an explainable, non-speculative **Sell Now / Consider Holding / Caution / Insufficient Data** advisory.

---

## 🌾 Features & Architecture

1. **Farmer Mandi Comparison Engine**:
   - Location input by State, District, Village, or GPS Auto-detection.
   - Commodity & variety selection with quantity in quintals.
   - Vehicle freight calculation (Distance in km × Transport Rate in ₹/km).
   - Additional selling expenses (loading, unloading, mandi cess, weighing).
   - Real-time ranking of mandis by **Estimated Net Revenue** (highlighting the #1 most profitable APMC).
   - Staleness warnings for market quotes older than 7 days.

2. **Sell-or-Hold Advisory Engine**:
   - Transparent, rule-based decision support (no black-box machine learning).
   - Evaluates current modal price, 7-day average, 30-day average, price momentum, and volatility.
   - Incorporates farmer holding timeframe (1, 3, or 7 days) and storage costs (₹/quintal/day).
   - Strict safeguards: yields `INSUFFICIENT DATA` if historical records are missing or stale.
   - Outputs: `SELL NOW`, `CONSIDER HOLDING`, `CAUTION`, `INSUFFICIENT DATA`.
   - Never guarantees future prices; includes explicit legal disclaimers.

3. **Historical Market Trends**:
   - Interactive Recharts visualization with Modal Price, Min Price, and Max Price curves.
   - Filter by crop, variety, mandi, and date range (7, 14, 30, 45 days).

4. **Geographic Mandi Explorer**:
   - Leaflet & OpenStreetMap interactive map with verified APMC yard coordinates across India.
   - Clearly distinguishes approximate straight-line geodesic distance from road distance.

5. **Multi-Language & Customization**:
   - Full bilingual support in **English** and **తెలుగు (Telugu)** with instant toggle.
   - Customizable search radius, price preference (Modal/Min/Max), holding horizon, and storage costs.
   - Light and Dark visual themes.

---

## 📁 Project Structure

```
Mandi Mitra Project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/         # health, locations, crops, mandis, prices, advisor
│   │   ├── core/                  # config.py (Pydantic settings), exceptions.py
│   │   ├── database/              # session.py, base.py, init_db.py
│   │   ├── models/                # SQLAlchemy models (location, crop, mandi, price, user_preference)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   ├── services/              # agmarknet_service, profit_calculator, advisor_service, distance_service
│   │   └── main.py                # FastAPI application entrypoint & CORS
│   ├── tests/                     # 15 comprehensive pytest unit and integration tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Footer, MandiCard, AdvisoryCard, MandiMapLeaflet, AlertBadge
│   │   ├── pages/                 # Dashboard, ComparePage, SellOrHoldPage, MarketTrendsPage, MandiMapPage, SettingsPage
│   │   ├── layouts/               # MainLayout
│   │   ├── context/               # LanguageContext (EN/TE), SettingsContext
│   │   ├── services/              # api.js
│   │   ├── utils/                 # translations.js, formatters.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
├── database/
│   ├── schema.sql                 # Complete Supabase PostgreSQL schema
│   ├── seed.sql                   # Raw SQL seed data for Supabase SQL Editor
│   └── migrations/
├── scripts/
│   ├── seed_database.py           # Standalone DB seeding
│   ├── sync_agmarknet.py          # Agmarknet live sync adapter
│   └── verify_system.py           # Full system verification suite
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Prerequisites (Windows 11)

- **Python**: Version 3.11 or higher
- **Node.js**: Version 18 or higher (tested with v22.14.0)
- **Git**
- **Supabase Account** (Optional for local test; local SQLite fallback is enabled automatically if `DATABASE_URL` is omitted).

---

## 🚀 Step-by-Step Local Setup & Execution

### 1. Configure Environment Variables

Create `.env` in the project root (or `backend/.env`):

```powershell
Copy-Item .env.example .env
```

To configure **Supabase PostgreSQL**, edit `.env`:

```env
# Supabase PostgreSQL Connection String
# Direct connection:
DATABASE_URL=postgresql://postgres.yourproject:yourpassword@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require

# (Optional) Data.gov.in / Agmarknet API Key
DATA_GOV_IN_API_KEY=your_key_here
```

> **Note**: If `DATABASE_URL` is left blank, Mandi Mitra **automatically initializes a local SQLite database (`mandi_mitra.db`)** populated with authentic Indian agricultural benchmark data for instant local execution without needing internet credentials.

---

### 2. Setting Up Supabase Database (Optional)

If using Supabase PostgreSQL:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy the contents of `database/schema.sql` and click **Run**.
4. (Optional) Run `database/seed.sql` to populate initial APMC coordinates and prices.

---

### 3. Start Backend Server

Open a Windows PowerShell terminal in the project root:

```powershell
# Install backend dependencies
python -m pip install -r backend/requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

---

### 4. Start Frontend Client

Open a second Windows PowerShell terminal:

```powershell
cd frontend
npm install
npm run dev
```

- Web Dashboard: `http://localhost:5173`

---

### 5. Run Verification & Unit Tests

To run the complete pytest test suite:

```powershell
python -m pytest backend/tests -v
```

To run the end-to-end system verification script:

```powershell
python scripts/verify_system.py
```

---

## 📡 Agmarknet Data Integration Details

- **Official API Endpoint**: `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`
- **Data Classification**:
  - `live`: Live prices fetched from Data.gov.in using the configured API key.
  - `historical`: Previous 35-day daily records stored for trend curves.
  - `sample` / `benchmark`: High-fidelity authentic government APMC records for offline resilience.
- **Sync Script**:
  ```powershell
  python scripts/sync_agmarknet.py --state "Telangana" --commodity "Paddy (Dhan)"
  ```

---

## ☁️ Deployment Guide (Future Step)

### Frontend (Vercel)
1. Push project to GitHub.
2. In Vercel, set root directory to `frontend`.
3. Set environment variable: `VITE_API_BASE_URL=https://your-backend.onrender.com/api`.
4. Deploy!

### Backend (Render)
1. In Render, create a new **Web Service**.
2. Root directory: project root.
3. Build command: `pip install -r backend/requirements.txt`.
4. Start command: `uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`.
5. Set environment variable: `DATABASE_URL` (Supabase Connection Pooler string).
6. Set environment variable: `ENVIRONMENT=production`.
