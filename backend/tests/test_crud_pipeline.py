"""
Unit tests for Pipeline execution runs and node telemetry persistence.
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.crud.pipeline import (
    get_pipeline_runs,
    get_pipeline_run,
    save_pipeline_run,
)
from app.schemas.schemas import PipelineRun as PydanticRun, PipelineNode as PydanticNode, PipelineStatus


def test_get_pipeline_runs(db_session: Session):
    runs = get_pipeline_runs(db_session)
    assert len(runs) > 0
    first = runs[0]
    assert "id" in first
    assert "status" in first
    assert "nodes" in first
    assert len(first["nodes"]) > 0


def test_save_pipeline_run_persistence(db_session: Session):
    new_run = PydanticRun(
        id="RUN-TEST-999",
        type="daily_sweep",
        status=PipelineStatus.SUCCESS,
        triggered_at=datetime.utcnow(),
        completed_at=datetime.utcnow(),
        triggered_by="Test Suite",
        patients_processed=14,
        alerts_generated=3,
        nodes=[
            PydanticNode(
                id="N1",
                name="ABDM Ingestion",
                type="ingestion",
                status=PipelineStatus.SUCCESS,
                started_at=datetime.utcnow(),
                completed_at=datetime.utcnow(),
                input_summary="Test Input",
                output_summary="Test Output",
                duration_ms=450,
            ),
            PydanticNode(
                id="N2",
                name="Patient State Builder",
                type="state_builder",
                status=PipelineStatus.SUCCESS,
                started_at=datetime.utcnow(),
                completed_at=datetime.utcnow(),
                input_summary="Building state",
                output_summary="State built",
                duration_ms=300,
            ),
        ],
    )

    saved = save_pipeline_run(db_session, new_run)
    assert saved["id"] == "RUN-TEST-999"
    assert len(saved["nodes"]) == 2

    # Query from database directly
    queried = get_pipeline_run(db_session, "RUN-TEST-999")
    assert queried is not None
    assert queried["id"] == "RUN-TEST-999"
    assert queried["status"] == "success"
    assert queried["patients_processed"] == 14
    assert len(queried["nodes"]) == 2
