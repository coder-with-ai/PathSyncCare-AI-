"""
Pytest fixtures and test environment configuration.
Sets up an isolated database, seeds initial test data, and provides FastAPI TestClient.
"""
import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

from app.database import Base, get_db
from app.models import sql_models  # noqa: F401
from app.db_seed import seed_database
from app.main import app


# Isolated test SQLite engine
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)


# Enforce foreign key constraints in SQLite for constraint testing
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("PRAGMA foreign_keys=ON")
    except Exception:
        pass
    finally:
        cursor.close()


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create all schema tables in test engine once per test session."""
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Yields an isolated database session for each test function.
    Rolls back transaction at the end of each test to ensure test isolation.
    """
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Seed initial clinical demo data into the test database
    seed_database(session)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db_session: Session):
    """
    FastAPI TestClient with overridden get_db dependency pointing to the isolated test session.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
