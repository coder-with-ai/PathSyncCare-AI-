"""
Unit tests for configuration management and security.
"""
from app.config import Settings


def test_default_settings():
    s = Settings()
    assert s.AZURE_SQL_DRIVER == "ODBC Driver 18 for SQL Server"
    assert s.AZURE_SQL_ENCRYPT == "yes"
    assert s.AZURE_SQL_TRUST_CERT == "no"
    assert s.AZURE_SQL_PORT == 1433


def test_safe_summary_never_exposes_password():
    s = Settings(
        AZURE_SQL_SERVER="sample-server.database.windows.net",
        AZURE_SQL_DATABASE="testdb",
        AZURE_SQL_USERNAME="testadmin",
        AZURE_SQL_PASSWORD="SuperSecretPassword!#123",
    )
    summary = s.get_safe_summary()
    assert summary["configured"] is True
    assert summary["server"] == "sample-server.database.windows.net"
    assert summary["database"] == "testdb"
    assert summary["username"] == "testadmin"
    assert "SuperSecretPassword" not in str(summary)
    assert "password" not in summary
    assert "AZURE_SQL_PASSWORD" not in summary


def test_connection_url_encoding_special_chars():
    s = Settings(
        AZURE_SQL_SERVER="sample-server.database.windows.net",
        AZURE_SQL_DATABASE="testdb",
        AZURE_SQL_USERNAME="testadmin",
        AZURE_SQL_PASSWORD="P@$$w0rd;with=special&chars",
    )
    url = s.get_sqlalchemy_url()
    assert url.startswith("mssql+pyodbc:///?odbc_connect=")
    # Password must not appear in raw plain text inside the URL
    assert "P@$$w0rd;with=special&chars" not in url


def test_driver_fallback_resolution():
    s = Settings(AZURE_SQL_DRIVER="ODBC Driver 18 for SQL Server")
    effective = s.get_effective_driver()
    assert effective is not None
    assert isinstance(effective, str)
