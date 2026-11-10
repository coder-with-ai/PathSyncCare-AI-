"""
Pipeline API router.
Manages AI pipeline execution runs, DAG node states, and trigger operations with Azure SQL persistence.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.sql_models import Patient
from app.crud import pipeline as crud_pipeline
from pipelines.pipeline_runner import simulate_pipeline_run

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


@router.get("/runs")
def list_runs(db: Session = Depends(get_db)):
    """List all pipeline runs from Azure SQL."""
    return crud_pipeline.get_pipeline_runs(db)


@router.get("/runs/{run_id}")
def get_run(run_id: str, db: Session = Depends(get_db)):
    """Get detailed pipeline run with node statuses."""
    run = crud_pipeline.get_pipeline_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Pipeline run not found")
    return run


@router.post("/trigger")
async def trigger_pipeline(pipeline_type: str = "daily_sweep", db: Session = Depends(get_db)):
    """Trigger a new pipeline run and persist execution log into Azure SQL."""
    patient_count = db.query(func.count(Patient.id)).scalar() or 14
    new_run = await simulate_pipeline_run(
        pipeline_type=pipeline_type,
        triggered_by="Manual Trigger (Dashboard)",
        patients_count=patient_count,
    )
    saved_run = crud_pipeline.save_pipeline_run(db, new_run)
    return saved_run


@router.get("/nodes")
def get_pipeline_nodes():
    """Get the DAG node definitions for visualization."""
    return {
        "nodes": [
            {"id": "N1", "name": "ABDM Ingestion", "type": "ingestion", "x": 400, "y": 50},
            {"id": "N2", "name": "Patient State Builder", "type": "state_builder", "x": 400, "y": 130},
            {"id": "N3", "name": "Expected Trajectory Engine", "type": "trajectory", "x": 400, "y": 210},
            {"id": "N4", "name": "Deviation Detection (XGBoost)", "type": "deviation", "x": 400, "y": 290},
            {"id": "N5", "name": "Confidence Gate", "type": "confidence_gate", "x": 400, "y": 370},
            {"id": "N6", "name": "LLM Explanation Agent", "type": "llm", "x": 400, "y": 450},
            {"id": "N7", "name": "Validator Agent", "type": "validator", "x": 400, "y": 530},
            {"id": "N8", "name": "Priority Worklist Generator", "type": "ranking", "x": 400, "y": 610},
            {"id": "N9", "name": "Action Dispatcher", "type": "dispatcher", "x": 400, "y": 690},
        ],
        "edges": [
            {"from": "N1", "to": "N2"},
            {"from": "N2", "to": "N3"},
            {"from": "N3", "to": "N4"},
            {"from": "N4", "to": "N5"},
            {"from": "N5", "to": "N6"},
            {"from": "N6", "to": "N7"},
            {"from": "N7", "to": "N8"},
            {"from": "N8", "to": "N9"},
        ],
        "outputs": [
            {"from": "N9", "name": "Doctor Dashboard", "icon": "monitor"},
            {"from": "N9", "name": "WhatsApp / ASHA Alert", "icon": "message-circle"},
            {"from": "N9", "name": "ABDM Update + Audit Log", "icon": "database"},
        ],
    }
