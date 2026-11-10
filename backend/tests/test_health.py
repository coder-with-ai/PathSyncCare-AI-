"""
Unit tests for Health Check endpoint.
Verifies independent reporting of app status and database connectivity without leaking credentials.
"""
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient


def test_health_check_connected(client: TestClient):
    # Mock test_db_connection to return connected
    mock_db_res = {
        "status": "connected",
        "connected": True,
        "dialect": "sqlite",
        "latency_ms": 1.25,
        "safe_summary": {
            "configured": True,
            "server": "sample-server.database.windows.net",
            "database": "pathsync_db",
            "driver_effective": "ODBC Driver 18 for SQL Server",
        },
    }
    mock_session = MagicMock()
    mock_session.query.return_value.count.return_value = 14

    with patch("app.main.test_db_connection", return_value=mock_db_res), \
         patch("app.main.SessionLocal", return_value=mock_session):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"]["connected"] is True
        assert data["database"]["status"] == "connected"
        assert data["patients_loaded"] == 14
        assert "password" not in str(data)


def test_health_check_disconnected_never_reports_success(client: TestClient):
    mock_db_res = {
        "status": "disconnected",
        "connected": False,
        "message": "Connection test failed: server unreachable",
        "safe_summary": {
            "configured": False,
            "server": "not-configured",
        },
    }
    with patch("app.main.test_db_connection", return_value=mock_db_res):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"
        assert data["database"]["connected"] is False
        assert data["database"]["status"] == "disconnected"
        assert "password" not in str(data)
