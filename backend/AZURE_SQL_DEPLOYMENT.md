# Azure SQL Database Deployment & Operations Guide
**Project:** PathSyncCare-AI  
**Target Database:** Microsoft Azure SQL Database (MSSQL Engine)  
**ORM / Driver Stack:** SQLAlchemy 2.x + pyodbc + Microsoft ODBC Driver 18 for SQL Server  

---

## 1. Architecture Overview

PathSyncCare-AI bridges post-discharge care monitoring for Non-Communicable Diseases (NCDs) by modeling expected clinical trajectories, detecting deviations via rule-based checks, XGBoost, and LLM explanations, and prioritizing doctor workflows.

In production on Azure, the FastAPI backend connects to Azure SQL Database over port `1433` using the TDS protocol with mandatory TLS 1.2+ encryption (`Encrypt=yes;TrustServerCertificate=no;`).

```
[ Azure Front Door / React Frontend ]
                 │
                 ▼  HTTPS
[ Azure App Service / Container App: FastAPI Backend ]
                 │
                 ▼  Port 1433 (TLS 1.2 Encrypted TDS)
[ Azure SQL Database (Logical Server + Database) ]
```

---

## 2. Azure SQL Provisioning Guide

### A. Create Logical Server and Database via Azure CLI

```bash
# 1. Define Variables
RESOURCE_GROUP="rg-pathsynccare-prod"
LOCATION="centralindia"  # Recommended for Indian health data residency (ABHA/ABDM)
SERVER_NAME="sql-pathsynccare-prod"
DATABASE_NAME="pathsynccare_db"
ADMIN_USER="sqladmin"
ADMIN_PASSWORD="<REPLACE_WITH_STRONG_PASSWORD_MIN_16_CHARS>"

# 2. Create Resource Group (if not already created)
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# 3. Create Azure SQL Logical Server (Enforces TLS 1.2 minimum)
az sql server create \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD \
  --minimal-tls-version "1.2"

# 4. Create Azure SQL Database (General Purpose Serverless for optimal cost)
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name $DATABASE_NAME \
  --edition GeneralPurpose \
  --compute-model Serverless \
  --family Gen5 \
  --capacity 1 \
  --min-capacity 0.5 \
  --auto-pause-delay 60
```

---

## 3. Firewall Rules & Network Security

Azure SQL Database denies all incoming network traffic by default. You must configure firewall rules:

### A. Allow Azure Services (App Service / Container Apps)
```bash
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### B. Allow Developer Client IP (for local administration / testing)
```bash
MY_IP=$(curl -s https://api.ipify.org)
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name "DeveloperClientIP" \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP
```

---

## 4. Environment Variables Configuration

Configure the following application settings in your deployment environment or `.env` file:

| Variable | Recommended Production Value | Description |
| :--- | :--- | :--- |
| `AZURE_SQL_SERVER` | `sql-pathsynccare-prod.database.windows.net` | FQDN of the logical server |
| `AZURE_SQL_DATABASE` | `pathsynccare_db` | Name of the database |
| `AZURE_SQL_USERNAME` | `sqladmin` | SQL administrator or service principal |
| `AZURE_SQL_PASSWORD` | `<secure-password>` | Database password |
| `AZURE_SQL_DRIVER` | `ODBC Driver 18 for SQL Server` | Required ODBC Driver |
| `AZURE_SQL_PORT` | `1433` | Standard SQL Server TDS port |
| `AZURE_SQL_ENCRYPT` | `yes` | Mandatory encryption for Azure SQL |
| `AZURE_SQL_TRUST_CERT` | `no` | Reject self-signed/untrusted certificates |
| `AZURE_SQL_TIMEOUT` | `30` | Connection timeout in seconds |

---

## 5. ODBC Driver 18 Installation Guide

### A. Linux (Ubuntu 22.04 / 24.04 LTS / Debian)
```bash
# Add Microsoft repository key and list
curl https://packages.microsoft.com/keys/microsoft.asc | sudo tee /etc/apt/trusted.gpg.d/microsoft.asc
curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list | sudo tee /etc/apt/sources.list.d/mssql-release.list

sudo apt-get update
sudo ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev
```

### B. Windows
1. Download Microsoft ODBC Driver 18 for SQL Server (x64) from Microsoft Download Center.
2. Run `msodbcsql.msi` installer.
3. Verify installation in PowerShell:
   ```powershell
   Get-OdbcDriver -Name "ODBC Driver 18 for SQL Server"
   ```

### C. Dockerfile (Production Container)
```dockerfile
FROM python:3.11-slim

# Install system dependencies & Microsoft ODBC Driver 18
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    unixodbc \
    unixodbc-dev \
    && curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 6. Hosting Environment Compatibility Analysis: Vercel vs Azure

The repository currently includes a `vercel.json` deployment manifest.

> [!WARNING]
> **Vercel Serverless Hosting Limitation:**
> Vercel executes serverless functions on AWS Lambda / Amazon Linux runtimes. These environments do NOT include Microsoft ODBC drivers (`msodbcsql18`) in their base system images and do not permit `apt-get` package installation at build or runtime.
> 
> If `pyodbc` attempts to connect on Vercel without custom binary shared libraries compiled for Lambda, the API will fail with:
> `pyodbc.InterfaceError: Data source name not found and no default driver specified`.

### Recommended Production Solution:
1. **Azure App Service (Linux) or Azure Container Apps:**
   * **Azure App Service (Linux):** Contains Microsoft ODBC drivers pre-installed in Python blessed images.
   * **Azure Container Apps:** Full control over Dockerfile with exact ODBC Driver 18 version.
2. **Hybrid Deployment:**
   * Keep the **React frontend** hosted on Vercel / Azure Static Web Apps.
   * Host the **FastAPI backend** on Azure App Service / Azure Container Apps, and point frontend `API_URL` to the Azure backend domain.

---

## 7. Database Initialization & Schema Migrations

### Apply Migrations via Alembic
```bash
cd backend
alembic upgrade head
```

### Run Idempotent Seeding
The backend automatically creates tables and seeds initial cohort data on first startup if the database is empty. You can also trigger seeding manually:
```bash
cd backend
python -m app.db_seed
```

---

## 8. Verification & Diagnostics

1. **Verify Database Health:**
   ```bash
   curl -s http://localhost:8000/api/health | jq .
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "app": { "status": "running" },
     "database": {
       "status": "connected",
       "connected": true,
       "dialect": "mssql"
     },
     "patients_loaded": 14,
     "alerts_loaded": 29
   }
   ```
2. **Verify Worklist:**
   ```bash
   curl -s http://localhost:8000/api/worklist | jq .
   ```
3. **Verify Alert Review Persistence:**
   ```bash
   curl -X POST http://localhost:8000/api/alerts/ALT-001/review \
     -H "Content-Type: application/json" \
     -d '{"action": "accept", "notes": "Approved by Dr. Sharma"}'
   ```
