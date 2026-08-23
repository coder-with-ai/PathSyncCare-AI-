"""Pipeline API router."""
from fastapi import APIRouter, HTTPException
from app.models.demo_data import store
from pipelines.pipeline_runner import simulate_pipeline_run
import asyncio

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])


@router.get("/runs")
def list_runs():
    """List all pipeline runs."""
    return [r.model_dump() for r in store.pipeline_runs]


@router.get("/runs/{run_id}")
def get_run(run_id: str):
    """Get detailed pipeline run with node statuses."""
    for r in store.pipeline_runs:
        if r.id == run_id:
            return r.model_dump()
    raise HTTPException(status_code=404, detail="Pipeline run not found")


@router.post("/trigger")
async def trigger_pipeline(pipeline_type: str = "daily_sweep"):
    """Trigger a new pipeline run (simulated)."""
    new_run = await simulate_pipeline_run(
        pipeline_type=pipeline_type,
        triggered_by="Manual Trigger (Dashboard)",
        patients_count=len(store.patients),
    )
    store.pipeline_runs.insert(0, new_run)
    return new_run.model_dump()


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
