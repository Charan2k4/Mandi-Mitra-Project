"""
Standalone script to seed the database with verified authentic Indian mandis and benchmarks.
Usage:
    python scripts/seed_database.py
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.database.init_db import init_db

if __name__ == "__main__":
    print("Seeding Mandi Mitra Database...")
    init_db()
    print("Database seeding completed successfully!")
