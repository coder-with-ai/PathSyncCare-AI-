"""
CRUD repository operations for Pipeline Runs and DAG Nodes.
Persists execution history and DAG telemetry into Azure SQL.
"""
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from app.models.sql_models import PipelineRun, PipelineNode
from app.schemas.schemas import PipelineRun as PydanticPipelineRun


def format_pipeline_run(r: PipelineRun) -> dict:
    """Format ORM PipelineRun into API contract dictionary."""
    return {
        "id": r.id,
        "type": r.type,
        "status": r.status,
        "triggered_at": r.triggered_at.isoformat(),
        "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        "triggered_by": r.triggered_by,
        "patients_processed": r.patients_processed,
        "alerts_generated": r.alerts_generated,
        "nodes": [
            {
                "id": n.id,
                "name": n.name,
                "type": n.type,
                "status": n.status,
                "started_at": n.started_at.isoformat() if n.started_at else None,
                "completed_at": n.completed_at.isoformat() if n.completed_at else None,
                "input_summary": n.input_summary,
                "output_summary": n.output_summary,
                "duration_ms": n.duration_ms,
            }
            for n in r.nodes
        ],
    }


def get_pipeline_runs(db: Session) -> list[dict]:
    """Retrieve all pipeline execution runs with node logs, sorted by triggered_at descending."""
    runs = (
        db.query(PipelineRun)
        .options(joinedload(PipelineRun.nodes))
        .order_by(PipelineRun.triggered_at.desc())
        .all()
    )
    return [format_pipeline_run(r) for r in runs]


def get_pipeline_run(db: Session, run_id: str) -> Optional[dict]:
    """Retrieve a specific pipeline run by ID with detailed node telemetry."""
    run = (
        db.query(PipelineRun)
        .options(joinedload(PipelineRun.nodes))
        .filter(PipelineRun.id == run_id)
        .first()
    )
    if not run:
        return None
    return format_pipeline_run(run)


def save_pipeline_run(db: Session, run_data: PydanticPipelineRun) -> dict:
    """Persist a newly executed or triggered pipeline run and its DAG nodes into Azure SQL."""
    p_run = PipelineRun(
        id=run_data.id,
        type=run_data.type,
        status=run_data.status.value if hasattr(run_data.status, "value") else str(run_data.status),
        triggered_at=run_data.triggered_at,
        completed_at=run_data.completed_at,
        triggered_by=run_data.triggered_by,
        patients_processed=run_data.patients_processed,
        alerts_generated=run_data.alerts_generated,
    )
    db.add(p_run)
    db.flush()

    for n in run_data.nodes:
        node = PipelineNode(
            id=n.id,
            run_id=run_data.id,
            name=n.name,
            type=n.type,
            status=n.status.value if hasattr(n.status, "value") else str(n.status),
            started_at=n.started_at,
            completed_at=n.completed_at,
            input_summary=n.input_summary,
            output_summary=n.output_summary,
            duration_ms=n.duration_ms,
        )
        db.add(node)

    db.commit()
    db.refresh(p_run)
    return format_pipeline_run(p_run)
