# Database Setup & Supabase Guide — Mandi Mitra

This guide details the database architecture of Mandi Mitra, explaining both the **Local SQLite Development Mode** and the **Production Supabase PostgreSQL Mode**.

---

## 1. Dual Database Strategy

Mandi Mitra supports two database environments:

| Feature | Local Development Mode | Production Mode |
| :--- | :--- | :--- |
| **Engine** | SQLite (`mandi_mitra.db`) | PostgreSQL (Supabase) |
| **Setup Required** | None (Automatic) | Create Supabase project & set `.env` |
| **Port** | In-process file | 6543 (Pooler) or 5432 (Direct) |
| **Connection String** | `sqlite:///.../backend/mandi_mitra.db` | `postgresql+psycopg2://...` |
| **Behavior on Missing Env** | Default fallback | Active when `DATABASE_URL` is set |

> [!IMPORTANT]
> If `DATABASE_URL` is explicitly set in `.env`, the backend strictly connects to PostgreSQL. If the connection fails, the backend will **report the connection error and halt**. It will **never** silently fall back to SQLite when `DATABASE_URL` is configured.

---

## 2. Mode 1: Local SQLite Mode (Default)

If you do not configure `DATABASE_URL` in `.env`, Mandi Mitra initializes a local SQLite database at:
```
backend/mandi_mitra.db
```

### How Initial Data is Loaded:
1. When FastAPI starts up, the `lifespan` handler calls `init_db()`.
2. `Base.metadata.create_all()` creates all required tables if they do not exist.
3. If the database is empty, it automatically seeds:
   - 6 Indian states (Telangana, Andhra Pradesh, Maharashtra, Karnataka, Punjab, Madhya Pradesh).
   - 11 major agricultural districts with verified coordinates.
   - 23 verified APMC mandis.
   - 10 agricultural commodities with realistic market varieties.
   - 35 days of daily benchmark price observations.
4. Initialization is **idempotent**: running it repeatedly checks existing counts and does not corrupt or duplicate data.

---

## 3. Mode 2: Supabase PostgreSQL Mode

### Step 1: Create a Free Supabase Project
1. Visit [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose a project name (e.g., `mandi-mitra`), region (e.g., `ap-south-1` Mumbai), and choose a strong database password.

### Step 2: Obtain Your Connection String
1. In your Supabase dashboard, click the **Settings** gear icon at the bottom of the left sidebar.
2. Select **Database**.
3. Scroll down to the **Connection parameters** / **Connection string** section.
4. Click the **URI** tab.
5. Select **Transaction Pooler** (recommended for serverless/cloud environments, port `6543`) or **Session Pooler** / **Direct** (port `5432`).
6. Copy the connection string:
   ```
   postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```
7. Replace `[YOUR-PASSWORD]` with your actual Supabase database password.

### Step 3: Configure Environment Variables
In your root `.env` file, paste the connection string:
```env
DATABASE_URL=postgresql://postgres.yourprojectref:yourpassword@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### Step 4: Run the Database Schema in Supabase
You can initialize the Supabase database in either of two ways:

#### Option A: Automatic via FastAPI Startup
Simply start the backend server. The SQLAlchemy engine will connect to Supabase, run `Base.metadata.create_all()`, and populate the seed records.

#### Option B: Manual via Supabase SQL Editor (Recommended)
1. In your Supabase dashboard, click the **SQL Editor** icon in the left menu.
2. Click **New Query**.
3. Open `database/schema.sql` from this repository, copy all contents, paste it into the SQL Editor, and click **Run**.
4. (Optional) Open `database/seed.sql`, paste it, and click **Run** to seed all APMC mandis and commodities.

---

## 4. Database Schema Structure

The PostgreSQL schema consists of eight tables:

1. **`states`**: State name and official two-letter code.
2. **`districts`**: District name, state foreign key, and centroid coordinates.
3. **`mandis`**: APMC market yard name, district foreign key, verified latitude and longitude, contact numbers, and operating days.
4. **`commodities`**: Crop name, category (Cereals, Pulses, Oilseeds, Spices, Vegetables, Fibres), unit (Quintal), and shelf-life metadata.
5. **`varieties`**: Sub-varieties belonging to each commodity (e.g., Sona Masuri, Teja, Basmati).
6. **`market_prices`**: Daily modal, minimum, and maximum prices per quintal, arrival volumes in tonnes, data source, and classification tag (`live`, `benchmark`, `historical`).
7. **`farmer_preferences`**: Stores user-configured search radius, price preference, and storage cost assumptions.
8. **`comparison_logs`**: Anonymous analytics logging search queries to monitor regional demand.

---

## 5. Troubleshooting Database Connectivity

- **`Connection refused` / `Timeout`**: Ensure `?sslmode=require` is appended to the connection string.
- **Port 5432 blocked by firewall**: Use the Supabase Transaction Pooler on port `6543`.
- **Special characters in password**: If your Supabase password contains special characters like `@`, `#`, or `%`, URL-encode them (e.g., `@` becomes `%40`).
