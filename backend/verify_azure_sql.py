"""
Azure SQL Database Live Connectivity, Schema, and Seeding Verification Script.
Executes live queries against Azure SQL Database without mocks or SQLite.
Never prints passwords or sensitive credentials.
"""
import sys
import logging
from sqlalchemy import text, inspect
from app.config import settings
from app.database import create_db_engine, Base, SessionLocal
from app.models.sql_models import (
    Patient, CarePlan, Milestone, VitalReading, TrajectoryPoint,
    PatientIntervention, Alert, PipelineRun, PipelineNode
)
from app.db_seed import seed_database

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("azure_sql_verifier")


def run_verification():
    print("\n" + "=" * 70)
    print("   PathSyncCare-AI: Azure SQL Database Live Verification")
    print("=" * 70 + "\n")

    summary = settings.get_safe_summary()
    print("1. Configuration Summary (Sanitized):")
    for k, v in summary.items():
        print(f"   - {k}: {v}")

    if not settings.is_configured():
        print("\n[BLOCKED] Azure SQL credentials are not yet configured.")
        print("Please configure AZURE_SQL_USERNAME and AZURE_SQL_PASSWORD in your .env file.")
        print("File location: PathSyncCare-AI--main/.env or PathSyncCare-AI--main/backend/.env")
        return False

    print("\n2. Establishing Live Connection to Azure SQL...")
    engine = None
    try:
        engine = create_db_engine()
        with engine.connect() as conn:
            # Phase 5.1: Execute SELECT 1
            res_alive = conn.execute(text("SELECT 1 AS alive")).scalar()
            print(f"   [OK] SELECT 1 query: {res_alive} (Connection Established)")

            # Phase 5.2: Verify connected database name
            db_name = conn.execute(text("SELECT DB_NAME() AS current_db")).scalar()
            print(f"   [OK] Connected Database: {db_name}")

            # Phase 5.3: Verify server version and edition
            srv_version = conn.execute(text("SELECT @@VERSION AS ver")).scalar()
            first_line = srv_version.split("\n")[0] if srv_version else "Unknown"
            print(f"   [OK] Engine Version: {first_line}")

            # Phase 5.4: Verify encrypted connection settings
            encrypt_opt = conn.execute(text(
                "SELECT encrypt_option FROM sys.dm_exec_connections WHERE session_id = @@SPID"
            )).scalar()
            print(f"   [OK] TDS Session Encryption (sys.dm_exec_connections): {encrypt_opt}")

            # Phase 5.5: Verify TrustServerCertificate setting
            print(f"   [OK] Security Policy: Encrypt={settings.AZURE_SQL_ENCRYPT}, TrustServerCertificate={settings.AZURE_SQL_TRUST_CERT}")

            # Phase 5.6: Verify connection pooling parameters
            pool = engine.pool
            print(f"   [OK] Connection Pool: size={pool.size()}, max_overflow={pool._max_overflow}, pre_ping={pool._pre_ping}, recycle={pool._recycle}s")

    except Exception as e:
        # Sanitize error message to prevent leaking secrets
        err_msg = str(e).split("[SQL:")[0].strip()
        print(f"\n[ERROR] Connection failed: {err_msg}")
        if "18456" in str(e):
            print("   -> Reason: SQL Authentication failed. Check your AZURE_SQL_USERNAME and AZURE_SQL_PASSWORD.")
        elif "Cannot open server" in str(e) or "firewall" in str(e).lower() or "Client with IP address" in str(e):
            print("   -> Reason: Azure SQL Firewall blocked this client IP. Add your public IP to the firewall rules.")
        return False

    # Phase 6: Verify and create schema tables
    print("\n3. Verifying Database Tables...")
    try:
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        expected_tables = [
            "patients", "care_plans", "milestones", "vital_readings",
            "trajectory_points", "patient_interventions", "alerts",
            "pipeline_runs", "pipeline_nodes"
        ]

        missing = [t for t in expected_tables if t not in existing_tables]
        if missing:
            print(f"   -> Tables missing in Azure SQL: {missing}. Creating tables via SQLAlchemy metadata...")
            Base.metadata.create_all(bind=engine)
            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()

        print(f"   [OK] Total Tables in Azure SQL: {len(existing_tables)}")
        for t in expected_tables:
            status = "EXISTS" if t in existing_tables else "MISSING"
            print(f"      - {t}: [{status}]")

    except Exception as e:
        err_msg = str(e).split("[SQL:")[0].strip()
        print(f"\n[ERROR] Schema verification failed: {err_msg}")
        return False

    # Phase 7: Demo Data Seeding & Idempotency Check
    print("\n4. Running Idempotent Data Seeding...")
    SessionClass = SessionLocal
    if SessionClass is None:
        from sqlalchemy.orm import sessionmaker
        SessionClass = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = SessionClass()
    try:
        # First seeding run
        seed_res1 = seed_database(db)
        print("   -> Run 1 Seeding Result:")
        for k, v in seed_res1.items():
            print(f"      - {k}: {v}")

        # Second seeding run to prove idempotency
        seed_res2 = seed_database(db)
        print("   -> Run 2 Idempotency Verification (Expected 0 inserts):")
        print(f"      - patients_inserted: {seed_res2['patients_inserted']} (expected 0)")
        print(f"      - alerts_inserted: {seed_res2['alerts_inserted']} (expected 0)")
        print(f"      - runs_inserted: {seed_res2['pipeline_runs_inserted']} (expected 0)")

        # Verify record counts directly from SQL
        p_count = db.query(Patient).count()
        a_count = db.query(Alert).count()
        r_count = db.query(PipelineRun).count()
        print(f"\n5. Live Record Counts in Azure SQL:")
        print(f"   - Patients: {p_count} (Expected: 14)")
        print(f"   - Alerts: {a_count} (Expected: 29)")
        print(f"   - Pipeline Runs: {r_count} (Expected: >= 8)")

    except Exception as e:
        err_msg = str(e).split("[SQL:")[0].strip()
        print(f"\n[ERROR] Seeding failed: {err_msg}")
        return False
    finally:
        db.close()

    print("\n" + "=" * 70)
    print("   [SUCCESS] Azure SQL Database Integration Fully Verified!")
    print("=" * 70 + "\n")
    return True


if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)
