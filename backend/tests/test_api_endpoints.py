"""
Integration tests for FastAPI endpoints against database-backed repository.
Verifies complete compatibility with existing frontend API contracts.
"""
from fastapi.testclient import TestClient


def test_list_patients_endpoint(client: TestClient):
    response = client.get("/api/patients")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 14
    first = data[0]
    for key in ["id", "name", "age", "gender", "abha_id", "disease", "discharge_date", "risk_score", "compliance_rate", "active_alerts", "avatar_color"]:
        assert key in first


def test_get_patient_detail_endpoint(client: TestClient):
    response = client.get("/api/patients/PAT-001")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "PAT-001"
    assert "care_plan" in data
    assert "vitals_history" in data
    assert "trajectory" in data
    assert "interventions" in data


def test_get_patient_detail_404(client: TestClient):
    response = client.get("/api/patients/UNKNOWN-PATIENT")
    assert response.status_code == 404
    assert response.json()["detail"] == "Patient not found"


def test_get_patient_trajectory_endpoint(client: TestClient):
    response = client.get("/api/patients/PAT-001/trajectory")
    assert response.status_code == 200
    data = response.json()
    assert data["patient_id"] == "PAT-001"
    assert "trajectory" in data
    assert "milestones" in data


def test_list_alerts_endpoint(client: TestClient):
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_list_alerts_filtering_endpoint(client: TestClient):
    response = client.get("/api/alerts?severity=critical")
    assert response.status_code == 200
    data = response.json()
    assert all(a["severity"] == "critical" for a in data)


def test_alert_summary_endpoint(client: TestClient):
    response = client.get("/api/alerts/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "active" in data
    assert "by_severity" in data
    assert "by_source" in data


def test_review_alert_endpoint(client: TestClient):
    # Review alert ALT-001
    payload = {"action": "accept", "notes": "Medication adherence follow-up ordered"}
    response = client.post("/api/alerts/ALT-001/review", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["alert_id"] == "ALT-001"
    assert data["action"] == "accept"

    # Verify status changed in get_alert
    check = client.get("/api/alerts/ALT-001")
    assert check.status_code == 200
    assert check.json()["status"] == "reviewed"


def test_get_worklist_endpoint(client: TestClient):
    response = client.get("/api/worklist")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "rank" in first
        assert "patient_id" in first
        assert "urgency_reason" in first
        assert "top_alert" in first
        assert "risk_score" in first


def test_get_dashboard_stats_endpoint(client: TestClient):
    response = client.get("/api/worklist/stats")
    assert response.status_code == 200
    data = response.json()
    for key in ["total_patients", "active_alerts", "avg_compliance", "critical_deviations", "patients_on_track", "pipeline_runs_today", "disease_distribution"]:
        assert key in data


def test_pipeline_runs_endpoint(client: TestClient):
    response = client.get("/api/pipeline/runs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_pipeline_nodes_endpoint(client: TestClient):
    response = client.get("/api/pipeline/nodes")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert "outputs" in data
    assert len(data["nodes"]) == 9


def test_trigger_pipeline_endpoint(client: TestClient):
    response = client.post("/api/pipeline/trigger?pipeline_type=daily_sweep")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "nodes" in data
    assert len(data["nodes"]) == 9
