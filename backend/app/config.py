"""
Configuration management for PathSyncCare-AI backend.
Handles environment variables, Azure SQL credentials, and dynamic driver detection.
"""
import logging
import urllib.parse
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

# Base paths for robust .env file discovery regardless of current working directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    # Azure SQL Connection Parameters
    AZURE_SQL_SERVER: Optional[str] = None
    AZURE_SQL_DATABASE: Optional[str] = None
    AZURE_SQL_USERNAME: Optional[str] = None
    AZURE_SQL_PASSWORD: Optional[str] = None
    AZURE_SQL_DRIVER: str = "ODBC Driver 18 for SQL Server"
    AZURE_SQL_PORT: int = 1433
    AZURE_SQL_ENCRYPT: str = "yes"
    AZURE_SQL_TRUST_CERT: str = "no"
    AZURE_SQL_TIMEOUT: int = 30

    # Optional generic database URL override (e.g. for testing with sqlite)
    DATABASE_URL: Optional[str] = None

    # Application settings
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=(
            ".env",
            "../.env",
            str(BACKEND_DIR / ".env"),
            str(ROOT_DIR / ".env"),
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @staticmethod
    def get_installed_odbc_drivers() -> list[str]:
        """Query installed ODBC drivers via pyodbc."""
        try:
            import pyodbc
            return pyodbc.drivers()
        except Exception as e:
            logger.warning(f"Could not query installed ODBC drivers: {e}")
            return []

    def get_effective_driver(self) -> str:
        """
        Determine the effective ODBC driver to use.
        Prioritizes the configured AZURE_SQL_DRIVER. If the driver is not
        found on the host, falls back to an available SQL Server driver if present.
        """
        installed = self.get_installed_odbc_drivers()
        if not installed:
            return self.AZURE_SQL_DRIVER

        # If configured driver is directly installed, use it
        if self.AZURE_SQL_DRIVER in installed:
            return self.AZURE_SQL_DRIVER

        # If configured is Driver 18 but host only has Driver 17, fall back gracefully
        if "ODBC Driver 18 for SQL Server" in self.AZURE_SQL_DRIVER and "ODBC Driver 17 for SQL Server" in installed:
            logger.warning(
                f"Configured driver '{self.AZURE_SQL_DRIVER}' not found on host. "
                f"Falling back to available 'ODBC Driver 17 for SQL Server'."
            )
            return "ODBC Driver 17 for SQL Server"

        # Check for any SQL Server driver
        for d in installed:
            if "SQL Server" in d:
                logger.warning(
                    f"Configured driver '{self.AZURE_SQL_DRIVER}' not found on host. "
                    f"Falling back to available '{d}'."
                )
                return d

        return self.AZURE_SQL_DRIVER

    def is_configured(self) -> bool:
        """Check if all required database credentials or DATABASE_URL are set."""
        if self.DATABASE_URL:
            return True
        return bool(
            self.AZURE_SQL_SERVER
            and self.AZURE_SQL_DATABASE
            and self.AZURE_SQL_USERNAME
            and self.AZURE_SQL_PASSWORD
        )

    def get_connection_string(self) -> str:
        """
        Construct raw ODBC connection string for pyodbc.
        """
        driver = self.get_effective_driver()
        server = self.AZURE_SQL_SERVER
        if server and "," not in server and self.AZURE_SQL_PORT != 1433:
            server = f"{server},{self.AZURE_SQL_PORT}"

        params = [
            f"Driver={{{driver}}}",
            f"Server={server}",
            f"Database={self.AZURE_SQL_DATABASE}",
            f"Uid={self.AZURE_SQL_USERNAME}",
            f"Pwd={self.AZURE_SQL_PASSWORD}",
            f"Encrypt={self.AZURE_SQL_ENCRYPT}",
            f"TrustServerCertificate={self.AZURE_SQL_TRUST_CERT}",
            f"Connection Timeout={self.AZURE_SQL_TIMEOUT}",
        ]
        return ";".join(params) + ";"

    def get_sqlalchemy_url(self) -> str:
        """
        Construct safe SQLAlchemy database URL.
        Properly encodes special characters in passwords and parameters.
        """
        if self.DATABASE_URL:
            return self.DATABASE_URL

        odbc_str = self.get_connection_string()
        params = urllib.parse.quote_plus(odbc_str)
        return f"mssql+pyodbc:///?odbc_connect={params}"

    def get_safe_summary(self) -> dict:
        """
        Return sanitized database configuration for health checks and logs.
        Never returns passwords or complete connection strings.
        """
        return {
            "configured": self.is_configured(),
            "server": self.AZURE_SQL_SERVER or "not-configured",
            "database": self.AZURE_SQL_DATABASE or "not-configured",
            "username": self.AZURE_SQL_USERNAME or "not-configured",
            "driver_configured": self.AZURE_SQL_DRIVER,
            "driver_effective": self.get_effective_driver(),
            "encrypt": self.AZURE_SQL_ENCRYPT,
            "trust_server_certificate": self.AZURE_SQL_TRUST_CERT,
            "has_direct_url": bool(self.DATABASE_URL),
        }


settings = Settings()
