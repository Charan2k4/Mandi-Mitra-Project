# Local Development Setup — Mandi Mitra

This guide provides instructions for setting up and running Mandi Mitra on a local development workstation.

---

## 1. Prerequisites

Ensure the following tools are installed:

- **Python**: Version 3.11 or higher
- **Node.js**: Version 18.x or higher (Node 20+ recommended)
- **Git**

---

## 2. Cloning the Repository

Open your terminal or PowerShell:

```bash
git clone https://github.com/your-username/mandi-mitra.git
cd mandi-mitra
```

---

## 3. Backend Setup

### Windows 11 (PowerShell / Command Prompt)

```powershell
# 1. Create a Python virtual environment
python -m venv .venv

# 2. Activate the virtual environment
.venv\Scripts\Activate.ps1
# (If on CMD, run: .venv\Scripts\activate.bat)

# 3. Upgrade pip and install backend dependencies
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

### macOS / Linux

```bash
# 1. Create a Python virtual environment
python3 -m venv .venv

# 2. Activate the virtual environment
source .venv/bin/activate

# 3. Upgrade pip and install backend dependencies
python3 -m pip install --upgrade pip
python3 -m pip install -r backend/requirements.txt
```

---

## 4. Environment Variables Configuration

In the project root directory, copy the template `.env.example` to `.env`:

### Windows PowerShell
```powershell
Copy-Item .env.example .env
```

### macOS / Linux
```bash
cp .env.example .env
```

### Explanation of Variables:
```env
# Backend server port
BACKEND_PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Database Connection URL:
# Leave blank to use the built-in local SQLite database (backend/mandi_mitra.db)
DATABASE_URL=

# Data.gov.in / Agmarknet API Key (Optional):
DATA_GOV_IN_API_KEY=

# Frontend Vite configuration
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 5. Frontend Setup

In a separate terminal window:

```bash
cd frontend

# Install Node dependencies
npm install
```

---

## 6. Running the Application Locally

You will need two active terminal sessions:

### Terminal 1: Start FastAPI Backend
```powershell
# From the project root with virtual environment activated:
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Base: `http://localhost:8000`
- Swagger Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/api/health`

### Terminal 2: Start React Frontend
```powershell
# From the frontend directory:
cd frontend
npm run dev
```
- Open your browser at: `http://localhost:5173`

---

## 7. Verifying the Setup

Run the full automated test suite to confirm everything is working properly:

```powershell
# Run Pytest (16 tests)
python -m pytest backend/tests -v

# Run End-to-End System Verification
python scripts/verify_system.py
```
Both commands should execute with zero errors.
