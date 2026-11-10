"""
Database connection, session management, and connection pooling for PathSyncCare-AI.
Supports Azure SQL Database (via SQLAlchemy + pyodbc) with connection pooling and health diagnostics.
"""
import time
import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.pool import QueuePool, NullPool
from app.config import settings

logger = logging.getLogger(__name__)

Base = declarative_base()


def create_db_engine():
    """
    Instantiate SQLAlchemy engine with appropriate pooling and security options.
    Handles both Azure SQL (MSSQL) and SQLite (for testing).
    """
    db_url = settings.get_sqlalchemy_url()

    if db_url.startswith("sqlite"):
        # SQLite configuration for tests
        connect_args = {"check_same_thread": False}
        return create_engine(
            db_url,
            connect_args=connect_args,
            pool_pre_ping=True,
        )

    # Azure SQL / MSSQL configuration
    # Crucial for Azure SQL: pool_pre_ping detects dead/dropped TCP connections;
    # pool_recycle recycles connections before Azure Gateway drops idle TCP after 30 mins.
    return create_engine(
        db_url,
        poolclass=QueuePool,
        pool_pre_ping=True,
        pool_recycle=1800,  # 30 minutes
        pool_size=10,
        max_overflow=20,
        pool_timeout=30,
        echo=False,
    )


# Engine and SessionLocal factory
engine = None
SessionLocal = None


def init_db_engine():
    """Initialize or re-initialize the global engine and session factory."""
    global engine, SessionLocal
    try:
        engine = create_db_engine()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        logger.info("SQLAlchemy database engine initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize SQLAlchemy database engine: {e}")
        engine = None
        SessionLocal = None


# Initial attempt at module import time
init_db_engine()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.
    Ensures sessions are properly closed upon request completion.
    """
    global SessionLocal
    if SessionLocal is None:
        init_db_engine()

    if SessionLocal is None:
        raise RuntimeError(
            "Database is not initialized. Please verify Azure SQL connection parameters."
        )

    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_db_connection() -> dict:
    """
    Verify live connectivity to the database by executing a lightweight query.
    Returns diagnostic details without exposing passwords or sensitive connection strings.
    """
    global engine
    if not settings.is_configured():
        return {
            "status": "disconnected",
            "connected": False,
            "message": "Database credentials are not configured in environment.",
            "safe_summary": settings.get_safe_summary(),
        }

    if engine is None:
        init_db_engine()

    if engine is None:
        return {
            "status": "error",
            "connected": False,
            "message": "Engine initialization failed.",
            "safe_summary": settings.get_safe_summary(),
        }

    start = time.perf_counter()
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1 AS alive")).scalar()
            latency_ms = round((time.perf_counter() - start) * 1000, 2)
            if result == 1:
                return {
                    "status": "connected",
                    "connected": True,
                    "dialect": engine.dialect.name,
                    "latency_ms": latency_ms,
                    "safe_summary": settings.get_safe_summary(),
                }
            return {
                "status": "error",
                "connected": False,
                "message": f"Unexpected ping result: {result}",
                "latency_ms": latency_ms,
            }
    except Exception as e:
        latency_ms = round((time.perf_counter() - start) * 1000, 2)
        logger.error(f"Database connectivity test failed: {e}")
        # Clean error message without exposing connection strings or passwords
        err_msg = str(e).split("[SQL:")[0].strip()
        return {
            "status": "disconnected",
            "connected": False,
            "message": f"Connection test failed: {err_msg}",
            "latency_ms": latency_ms,
            "safe_summary": settings.get_safe_summary(),
        }
