"""
Unit tests for database connection testing and diagnostics.
"""
from app.database import test_db_connection as check_db_connection
from app.config import settings


def test_connection_unconfigured_reporting():
    # When settings has no credentials and no DATABASE_URL, test_db_connection returns disconnected
    orig_server = settings.AZURE_SQL_SERVER
    orig_url = settings.DATABASE_URL
    try:
        settings.AZURE_SQL_SERVER = None
        settings.DATABASE_URL = None
        res = check_db_connection()
        assert res["connected"] is False
        assert res["status"] == "disconnected"
        assert "not configured" in res["message"]
        assert "password" not in str(res)
    finally:
        settings.AZURE_SQL_SERVER = orig_server
        settings.DATABASE_URL = orig_url
