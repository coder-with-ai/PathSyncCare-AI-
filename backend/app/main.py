"""
PathCareSync AI — FastAPI Backend
Main application entry point with CORS, routers, Azure SQL health checks, and lifecycle management.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import patients, alerts, pipeline, worklist
from app.database import test_db_connection, engine, Base, SessionLocal

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    On startup, verifies database connectivity, auto-creates tables,
    and seeds initial clinical cohort if the database is newly initialized.
    """
    try:
        conn = test_db_connection()
        if conn.get("connected") and engine is not None and SessionLocal is not None:
            logger.info("Database connection verified on startup. Ensuring tables exist...")
            Base.metadata.create_all(bind=engine)
            db = SessionLocal()
            try:
                from app.models.sql_models import Patient
                from app.db_seed import seed_database
                patient_count = db.query(Patient).count()
                if patient_count == 0:
                    logger.info("Database is empty. Running initial idempotent cohort seed...")
                    summary = seed_database(db)
                    logger.info(f"Startup seed completed: {summary}")
                else:
                    logger.info(f"Database already populated ({patient_count} patients). Skipping initial seed.")
            finally:
                db.close()
        else:
            logger.warning(
                f"Database not connected on startup ({conn.get('message', 'Unreachable')}). "
                "API will report degraded database status until configured."
            )
    except Exception as e:
        logger.error(f"Startup database initialization error: {e}")

    yield


app = FastAPI(
    title="PathCareSync AI",
    description="Adaptive Care Intelligence — Expected vs Actual Deviation Engine with Azure SQL Database",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(patients.router)
app.include_router(alerts.router)
app.include_router(pipeline.router)
app.include_router(worklist.router)


@app.get("/")
def root():
    return {
        "app": "PathCareSync AI",
        "version": "1.0.0",
        "status": "running",
        "database_backend": "Microsoft Azure SQL Database",
        "tagline": "Adaptive Care Intelligence — Bridging hospital discharge to long-term disease management",
    }


@app.get("/api/health")
def health_check():
    """
    Health check endpoint.
    Independently verifies application readiness and database connectivity.
    Never reports a failed database connection as successful.
    """
    db_status = test_db_connection()
    is_db_connected = db_status.get("connected", False)

    patient_count = 0
    alert_count = 0
    run_count = 0

    if is_db_connected and SessionLocal is not None:
        db = SessionLocal()
        try:
            from app.models.sql_models import Patient, Alert, PipelineRun
            patient_count = db.query(Patient).count()
            alert_count = db.query(Alert).count()
            run_count = db.query(PipelineRun).count()
        except Exception as e:
            logger.error(f"Error reading record counts for health check: {e}")
            is_db_connected = False
            db_status["connected"] = False
            db_status["status"] = "error"
            db_status["message"] = f"Record count failed: {str(e).split('[SQL:')[0].strip()}"
        finally:
            db.close()

    overall_status = "healthy" if is_db_connected else "degraded"

    return {
        "status": overall_status,
        "app": {
            "name": "PathCareSync AI",
            "version": "1.0.0",
            "status": "running",
        },
        "database": db_status,
        "patients_loaded": patient_count,
        "alerts_loaded": alert_count,
        "pipeline_runs": run_count,
    }


@app.get("/api/ai/rules/{disease}")
def get_disease_rules(disease: str):
    """Get clinical rules for a specific disease."""
    from ai.rule_engine import get_rules_for_disease
    rules = get_rules_for_disease(disease)
    if not rules:
        return {"disease": disease, "rules": [], "message": "No rules found for this disease"}
    return {"disease": disease, "rules": rules}
