"""Patient API router."""
from fastapi import APIRouter, HTTPException
from app.models.demo_data import store

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("")
def list_patients():
    """List all patients with summary info."""
    return [
        {
            "id": p.id, "name": p.name, "age": p.age, "gender": p.gender,
            "abha_id": p.abha_id, "disease": p.disease.value,
            "discharge_date": str(p.discharge_date), "risk_score": p.risk_score,
            "compliance_rate": p.compliance_rate, "active_alerts": p.active_alerts,
            "avatar_color": p.avatar_color,
        }
        for p in store.patients
    ]


@router.get("/{patient_id}")
def get_patient(patient_id: str):
    """Get full patient profile."""
    for p in store.patients:
        if p.id == patient_id:
            return p.model_dump()
    raise HTTPException(status_code=404, detail="Patient not found")


@router.get("/{patient_id}/trajectory")
def get_trajectory(patient_id: str):
    """Get expected vs actual trajectory data for Care Twin chart."""
    for p in store.patients:
        if p.id == patient_id:
            return {
                "patient_id": p.id,
                "disease": p.disease.value,
                "trajectory": [t.model_dump() for t in p.trajectory],
                "milestones": [m.model_dump() for m in p.care_plan.milestones],
            }
    raise HTTPException(status_code=404, detail="Patient not found")
