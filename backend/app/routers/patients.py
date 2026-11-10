"""
Patient API router.
Serves patient cohorts, profiles, and Care Twin trajectories from Azure SQL Database.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import patients as crud_patients

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("")
def list_patients(db: Session = Depends(get_db)):
    """List all patients with summary info."""
    return crud_patients.get_patients_summary(db)


@router.get("/{patient_id}")
def get_patient(patient_id: str, db: Session = Depends(get_db)):
    """Get full patient profile."""
    patient = crud_patients.get_patient_detail(db, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@router.get("/{patient_id}/trajectory")
def get_trajectory(patient_id: str, db: Session = Depends(get_db)):
    """Get expected vs actual trajectory data for Care Twin chart."""
    traj = crud_patients.get_patient_trajectory(db, patient_id)
    if not traj:
        raise HTTPException(status_code=404, detail="Patient not found")
    return traj
