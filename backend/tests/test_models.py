"""
Unit tests for SQLAlchemy ORM models, relationships, and foreign key constraints.
"""
from datetime import date, datetime
import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.models.sql_models import (
    Patient, CarePlan, Milestone, VitalReading, TrajectoryPoint,
    PatientIntervention, Alert, PipelineRun, PipelineNode
)


def test_patient_model_creation(db_session: Session):
    p = Patient(
        id="TEST-001",
        name="Test Patient",
        age=45,
        gender="Male",
        abha_id="91-0000-0000-0001",
        disease="Hypertension",
        discharge_date=date(2026, 1, 15),
        risk_score=0.42,
        compliance_rate=88.5,
        active_alerts=1,
    )
    db_session.add(p)
    db_session.commit()

    queried = db_session.query(Patient).filter(Patient.id == "TEST-001").first()
    assert queried is not None
    assert queried.name == "Test Patient"
    assert queried.age == 45
    assert queried.abha_id == "91-0000-0000-0001"


def test_abha_id_unique_constraint(db_session: Session):
    p1 = Patient(
        id="TEST-U1", name="User One", age=30, gender="F",
        abha_id="91-9999-9999-9999", disease="Hypertension",
        discharge_date=date(2026, 1, 1),
    )
    p2 = Patient(
        id="TEST-U2", name="User Two", age=35, gender="M",
        abha_id="91-9999-9999-9999", disease="Type 2 Diabetes",
        discharge_date=date(2026, 1, 1),
    )
    db_session.add(p1)
    db_session.commit()

    db_session.add(p2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_cascade_delete_patient_removes_care_plan_and_vitals(db_session: Session):
    # Insert patient with care plan, milestones, and vitals
    p = Patient(
        id="TEST-CAS", name="Cascade Test", age=50, gender="F",
        abha_id="91-8888-8888-8888", disease="Hypertension",
        discharge_date=date(2026, 1, 1),
    )
    db_session.add(p)
    db_session.commit()

    cp = CarePlan(
        id="CP-CAS", patient_id="TEST-CAS", disease="Hypertension",
        created_date=date(2026, 1, 1),
    )
    cp.medications = ["Drug A", "Drug B"]
    db_session.add(cp)

    m = Milestone(
        id="M1", care_plan_id="CP-CAS", patient_id="TEST-CAS",
        title="Check", due_date=date(2026, 1, 10), status="completed",
    )
    db_session.add(m)

    vr = VitalReading(
        patient_id="TEST-CAS", timestamp=datetime(2026, 1, 5, 10, 0),
        type="bp_systolic", value=130.0, unit="mmHg",
    )
    db_session.add(vr)
    db_session.commit()

    # Delete patient
    db_session.delete(p)
    db_session.commit()

    # Ensure child records were deleted
    assert db_session.query(CarePlan).filter(CarePlan.id == "CP-CAS").first() is None
    assert db_session.query(Milestone).filter(Milestone.care_plan_id == "CP-CAS").first() is None
    assert db_session.query(VitalReading).filter(VitalReading.patient_id == "TEST-CAS").first() is None
