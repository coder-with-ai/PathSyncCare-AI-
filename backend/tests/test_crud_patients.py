"""
Unit tests for Patient CRUD repository operations.
"""
from sqlalchemy.orm import Session
from app.crud.patients import (
    get_patients_summary,
    get_patient_detail,
    get_patient_trajectory,
)


def test_get_patients_summary(db_session: Session):
    patients = get_patients_summary(db_session)
    assert len(patients) >= 14
    first = patients[0]
    assert "id" in first
    assert "name" in first
    assert "abha_id" in first
    assert "risk_score" in first
    assert "compliance_rate" in first
    assert "active_alerts" in first


def test_get_patient_detail_nested_structure(db_session: Session):
    detail = get_patient_detail(db_session, "PAT-001")
    assert detail is not None
    assert detail["id"] == "PAT-001"
    assert detail["name"] == "Rajesh Kumar"
    assert "care_plan" in detail
    assert detail["care_plan"]["id"] == "CP-001"
    assert len(detail["care_plan"]["milestones"]) > 0
    assert len(detail["care_plan"]["medications"]) > 0
    assert len(detail["vitals_history"]) > 0
    assert len(detail["trajectory"]) > 0
    assert len(detail["interventions"]) > 0


def test_get_patient_trajectory(db_session: Session):
    traj = get_patient_trajectory(db_session, "PAT-001")
    assert traj is not None
    assert traj["patient_id"] == "PAT-001"
    assert len(traj["trajectory"]) > 0
    assert len(traj["milestones"]) > 0


def test_get_patient_not_found(db_session: Session):
    assert get_patient_detail(db_session, "NON-EXISTENT") is None
    assert get_patient_trajectory(db_session, "NON-EXISTENT") is None
