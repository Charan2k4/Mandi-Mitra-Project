# Mandi Mitra – Sell-or-Hold Advisor for Farmers

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?style=flat&logo=supabase&logoColor=white)](https://supabase.com)
[![Pytest](https://img.shields.io/badge/pytest-18%20passed-brightgreen.svg?style=flat&logo=pytest&logoColor=white)](backend/tests)
[![Agmarknet](https://img.shields.io/badge/Agmarknet-Live%20Sync%20%26%20Benchmark-brightgreen.svg)](https://data.gov.in)
[![Localization](https://img.shields.io/badge/Languages-English%20%7C%20%E0%B0%A4%E0%B1%86%E0%B0%B2%E0%B1%81%E0%B0%97%E0%B1%81%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-orange.svg)](frontend/src/utils/translations.js)

> **Mandi Mitra** is a full-stack agricultural decision-support web application designed for Indian farmers. It calculates realistic **Net Revenue** across regional Agricultural Produce Market Committees (APMCs) by deducting actual vehicle transportation freight and local handling charges, and provides an explainable, rule-based **Sell Now / Consider Holding / Caution / Insufficient Data** advisory.

---

## 📌 Table of Contents

- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Technology Stack](#-technology-stack)
- [Architecture Overview](#-architecture-overview)
- [Prerequisites](#-prerequisites)
- [Local Setup & Startup](#-local-setup--startup)
- [Database Architecture](#-database-architecture)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Data Provenance & Disclaimers](#-data-provenance--disclaimers)
- [Deployment Roadmap](#-deployment-roadmap)
- [Documentation Index](#-documentation-index)
- [License](#-license)

---

## 🌾 Key Features

1. **Farmer Mandi Net Profit Comparison**:
   - Location input by State, District, Village, or GPS Auto-detection.
   - Commodity & variety selection with volume in quintals ($1\text{ quintal} = 100\text{ kg}$).
   - Vehicle transport calculation ($\text{Distance in km} \times \text{Rate in ₹/km}$).
   - Additional selling deductions (loading, unloading, mandi cess, weighing).
   - Strict ranking by **Estimated Net Revenue** (highlighting the #1 most profitable APMC).
   - Price staleness detection for quotes older than 7 days.

2. **Sell-or-Hold Decision Engine**:
   - Transparent, rule-based decision support (no black-box machine learning).
   - Evaluates current modal price, 7-day average ($SMA_7$), 30-day average ($SMA_{30}$), momentum, and volatility.
   - Incorporates farmer holding horizon (1, 3, or 7 days) and storage costs (₹/quintal/day).
   - Rigorous safeguards: yields `INSUFFICIENT DATA` if historical records are missing or stale.
   - Deterministic **Rule Signal Strength** score ($0-100\%$) based on freshness, depth, and volatility.
   - Never guarantees future spot rates; includes prominent legal disclaimers.

3. **Historical Market Trends**:
   - Interactive Recharts visualization with daily Modal, Minimum, and Maximum price trajectory curves.
   - Filter by crop, variety, mandi, and date range (7, 14, 30, 45 days).

4. **Geographic APMC Map**:
   - Leaflet & OpenStreetMap interactive view with verified coordinates for major agricultural mandis across India.
   - Farmer reference marker with custom search radius circle.

5. **Trilingual Localization (English, Telugu, Hindi)**:
   - Full interface localization in **English**, **తెలుగు (Telugu)**, and **हिन्दी (Hindi)**.
   - Instant header toggle and persistent preference in Settings.

---

## 📸 Screenshots

> *To add screenshots to your repository, capture views from your browser and place them in `docs/screenshots/`.*

| Dashboard | Mandi Comparison |
| :---: | :---: |
| *(Add `docs/screenshots/dashboard.png`)* | *(Add `docs/screenshots/compare.png`)* |

| Sell-or-Hold Advisor | Market Trends Chart |
| :---: | :---: |
| *(Add `docs/screenshots/advisor.png`)* | *(Add `docs/screenshots/trends.png`)* |

---

## 💻 Technology Stack

- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, React Router v6, Recharts, Leaflet & React-Leaflet, Lucide React.
- **Backend**: Python 3.11+, FastAPI, Pydantic v2, Pydantic-Settings, SQLAlchemy 2.0, NumPy, Pandas, HTTPX, Uvicorn.
- **Database**: 
  - **Production**: Supabase PostgreSQL (Standard & Transaction Pooler port 6543).
  - **Local Development**: SQLite fallback (`mandi_mitra.db`).
- **Testing**: Pytest, Pytest-Asyncio, HTTPX TestClient.

---

## 🏗️ Architecture Overview

```
mandi-mitra/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/         # health, locations, crops, mandis, prices, advisor
│   │   ├── core/                  # config.py, exceptions.py
│   │   ├── database/              # session.py, base.py, init_db.py
│   │   ├── models/                # SQLAlchemy models (location, crop, mandi, price, user_preference)
│   │   ├── schemas/               # Pydantic schemas
│   │   ├── services/              # profit_calculator, advisor_service, distance_service, agmarknet_service
│   │   └── main.py                # FastAPI entrypoint & CORS middleware
│   └── tests/                     # 16 unit and regression tests
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Footer, MandiCard, AdvisoryCard, MandiMapLeaflet, AlertBadge
│   │   ├── context/               # LanguageContext (EN/TE/HI), SettingsContext
│   │   ├── pages/                 # Dashboard, ComparePage, SellOrHoldPage, MarketTrendsPage, MandiMapPage, SettingsPage
│   │   ├── services/              # api.js (centralized fetch client)
│   │   └── utils/                 # translations.js, formatters.js
├── database/
│   ├── schema.sql                 # Supabase PostgreSQL schema
│   └── seed.sql                   # Raw SQL seed records
├── docs/                          # In-depth architectural & user guides
├── scripts/
│   ├── seed_database.py           # Standalone DB seeding
│   ├── sync_agmarknet.py          # Data.gov.in live sync script
│   └── verify_system.py           # Full system verification suite
├── .env.example                   # Master environment template
├── .gitignore
└── README.md
```

---

## ⚡ Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18.x or 20.x or higher (tested on v22.14.0)
- **npm**: 9.x or higher
- **Git**

---

## 🚀 Local Setup & Startup

### 1. Clone Repository & Setup Environment
```powershell
git clone https://github.com/your-username/mandi-mitra.git
cd mandi-mitra

# Copy environment template
Copy-Item .env.example .env
```

### 2. Start Backend Server
```powershell
# Install backend dependencies
python -m pip install -r backend/requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base URL: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

### 3. Start Frontend Client
Open a second terminal window:
```powershell
cd frontend
npm install
npm run dev
```
- Access Web Application at: `http://localhost:5173`

---

## 🗄️ Database Architecture

Mandi Mitra supports a dual database strategy:

1. **Local SQLite Development Mode (`mandi_mitra.db`)**:
   - If `DATABASE_URL` is omitted from `.env`, the backend uses a local SQLite database with 23 verified Indian APMCs and 35 days of daily benchmark price observations.
2. **Supabase PostgreSQL Mode**:
   - Set `DATABASE_URL` in `.env`.
   - FastAPI automatically initializes all 8 tables and seeds baseline data on first startup via `init_db()` (manual execution of `database/schema.sql` is optional).
   - The backend connects directly via SQLAlchemy with psycopg2 and reports any connection errors explicitly rather than silently falling back to SQLite.

---

## 🔄 Live Agmarknet Synchronization

To pull fresh daily mandi prices directly from the Government of India portal:
```powershell
# Sync live prices for all supported crops
python scripts/sync_agmarknet.py

# Or sync specific commodity
python scripts/sync_agmarknet.py --commodity "Tomato" --limit 50
```
Live prices are tagged with `data_classification: "live"` and `data_source: "Agmarknet Official API"`, while seasonal baseline prices are clearly marked as `benchmark`.

---

## 🧪 Testing & Quality Assurance

Run the automated backend test suite (18 tests including idempotency, preferences, and data integrity):
```powershell
$env:PYTHONPATH="." ; python -m pytest backend/tests -v
```

Run the end-to-end system verification suite:
```powershell
$env:PYTHONPATH="." ; python scripts/verify_system.py
```

---

## 🛡️ Data Provenance & Disclaimers

- **Official Agmarknet Integration**: Designed for the public Data.gov.in Daily Mandi Prices resource (`https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi`).
- **Benchmark Data**: Offline fallback prices are clearly classified as `benchmark` data based on historical seasonal trends. They are never falsely labeled as live government prices.
- **Geodesic Distance**: Distances are straight-line approximations calculated using the Haversine formula. Actual road travel distances are 15-25% higher.
- **Non-Speculative Advisory**: Recommendations are decision-support guidelines factoring storage expenses and price momentum. They do not constitute financial advice or guarantee future market rates.

---

## 📖 Documentation Index

Detailed documentation files are available in the [`docs/`](docs/) directory:

1. [Project Overview](docs/PROJECT_OVERVIEW.md)
2. [Farmer & User Guide](docs/USER_GUIDE.md)
3. [Local Development Setup](docs/LOCAL_SETUP.md)
4. [Database Setup & Supabase Guide](docs/DATABASE_SETUP.md)
5. [Agmarknet Data Guide](docs/AGMARKNET_DATA_GUIDE.md)
6. [Features & Mathematical Calculations](docs/FEATURES_AND_CALCULATIONS.md)
7. [API Reference](docs/API_REFERENCE.md)
8. [Testing Guide](docs/TESTING_GUIDE.md)
9. [Cloud Deployment Guide (Render, Vercel, Supabase)](docs/DEPLOYMENT_GUIDE.md)
10. [Contributing Guidelines](docs/CONTRIBUTING.md)

---

## 📄 License

*License choice pending user confirmation (e.g., MIT, Apache 2.0, or GPLv3).*
