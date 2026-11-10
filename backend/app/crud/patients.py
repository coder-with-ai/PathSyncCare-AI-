"""
CRUD repository operations for Patient records.
Retrieves cohort summaries, detailed patient profiles, and Care Twin trajectories from Azure SQL.
"""
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from app.models.sql_models import Patient, CarePlan, Milestone, VitalReading, TrajectoryPoint, PatientIntervention


def get_patients_summary(db: Session) -> list[dict]:
    """List all patients with summary info matching PatientSummary schema."""
    patients = db.query(Patient).order_by(Patient.id).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "abha_id": p.abha_id,
            "disease": p.disease,
            "discharge_date": str(p.discharge_date),
            "risk_score": p.risk_score,
            "compliance_rate": p.compliance_rate,
            "active_alerts": p.active_alerts,
            "avatar_color": p.avatar_color,
        }
        for p in patients
    ]


def get_patient_detail(db: Session, patient_id: str) -> Optional[dict]:
    """Get full patient profile with care plan, vitals, trajectory, and interventions."""
    patient = (
        db.query(Patient)
        .options(
            joinedload(Patient.care_plan).joinedload(CarePlan.milestones),
            joinedload(Patient.vital_readings),
            joinedload(Patient.trajectory_points),
            joinedload(Patient.interventions),
        )
        .filter(Patient.id == patient_id)
        .first()
    )
    if not patient:
        return None

    cp = patient.care_plan
    care_plan_dict = None
    if cp:
        care_plan_dict = {
            "id": cp.id,
            "disease": cp.disease,
            "created_date": str(cp.created_date),
            "milestones": [
                {
                    "id": m.id,
                    "title": m.title,
                    "description": m.description,
                    "due_date": str(m.due_date),
                    "status": m.status,
                    "completed_date": str(m.completed_date) if m.completed_date else None,
                }
                for m in cp.milestones
            ],
            "medications": cp.medications,
            "instructions": cp.instructions,
        }

    return {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "abha_id": patient.abha_id,
        "disease": patient.disease,
        "discharge_date": str(patient.discharge_date),
        "risk_score": patient.risk_score,
        "compliance_rate": patient.compliance_rate,
        "active_alerts": patient.active_alerts,
        "avatar_color": patient.avatar_color,
        "phone": patient.phone,
        "address": patient.address,
        "care_plan": care_plan_dict,
        "vitals_history": [
            {
                "timestamp": vr.timestamp.isoformat(),
                "type": vr.type,
                "value": vr.value,
                "unit": vr.unit,
            }
            for vr in patient.vital_readings
        ],
        "trajectory": [
            {
                "day": tp.day,
                "expected": tp.expected,
                "actual": tp.actual,
                "label": tp.label,
            }
            for tp in patient.trajectory_points
        ],
        "interventions": [
            {
                "date": item.date,
                "type": item.type,
                "description": item.description,
                "outcome": item.outcome,
            }
            for item in patient.interventions
        ],
    }


def get_patient_trajectory(db: Session, patient_id: str) -> Optional[dict]:
    """Get Care Twin trajectory points and milestone checkpoints for charting."""
    patient = (
        db.query(Patient)
        .options(
            joinedload(Patient.care_plan).joinedload(CarePlan.milestones),
            joinedload(Patient.trajectory_points),
        )
        .filter(Patient.id == patient_id)
        .first()
    )
    if not patient:
        return None

    milestones = []
    if patient.care_plan:
        milestones = [
            {
                "id": m.id,
                "title": m.title,
                "description": m.description,
                "due_date": str(m.due_date),
                "status": m.status,
                "completed_date": str(m.completed_date) if m.completed_date else None,
            }
            for m in patient.care_plan.milestones
        ]

    return {
        "patient_id": patient.id,
        "disease": patient.disease,
        "trajectory": [
            {
                "day": tp.day,
                "expected": tp.expected,
                "actual": tp.actual,
                "label": tp.label,
            }
            for tp in patient.trajectory_points
        ],
        "milestones": milestones,
    }
