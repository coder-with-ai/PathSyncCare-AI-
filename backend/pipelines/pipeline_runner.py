"""
Pipeline definitions for PathCareSync AI.
Simulates the RocketRide pipeline execution with realistic delays.
"""
import asyncio
import random
from datetime import datetime, timedelta
from app.schemas.schemas import PipelineRun, PipelineNode, PipelineStatus


PIPELINE_NODES = [
    ("N1", "ABDM Ingestion", "ingestion"),
    ("N2", "Patient State Builder", "state_builder"),
    ("N3", "Expected Trajectory Engine", "trajectory"),
    ("N4", "Deviation Detection (XGBoost)", "deviation"),
    ("N5", "Confidence Gate", "confidence_gate"),
    ("N6", "LLM Explanation Agent", "llm"),
    ("N7", "Validator Agent", "validator"),
    ("N8", "Priority Worklist Generator", "ranking"),
    ("N9", "Action Dispatcher", "dispatcher"),
]


async def simulate_pipeline_run(
    pipeline_type: str = "daily_sweep",
    triggered_by: str = "System (Scheduled)",
    patients_count: int = 14,
) -> PipelineRun:
    """
    Simulate a full pipeline run with realistic node execution.
    Each node takes 200-2500ms to complete.
    """
    run_id = f"RUN-{random.randint(100, 999)}"
    started = datetime.now()
    nodes = []
    elapsed = 0

    for nid, name, ntype in PIPELINE_NODES:
        duration = random.randint(200, 2500)
        node_start = started + timedelta(milliseconds=elapsed)
        node_end = node_start + timedelta(milliseconds=duration)

        nodes.append(PipelineNode(
            id=nid,
            name=name,
            type=ntype,
            status=PipelineStatus.SUCCESS,
            started_at=node_start,
            completed_at=node_end,
            input_summary=f"{name}: Processing {patients_count} patients" if ntype != "dispatcher" else "Dispatching alerts",
            output_summary=f"{name}: Completed successfully",
            duration_ms=duration,
        ))
        elapsed += duration

    alerts_gen = random.randint(2, 8)
    completed = started + timedelta(milliseconds=elapsed)

    return PipelineRun(
        id=run_id,
        type=pipeline_type,
        status=PipelineStatus.SUCCESS,
        triggered_at=started,
        completed_at=completed,
        triggered_by=triggered_by,
        patients_processed=patients_count,
        alerts_generated=alerts_gen,
        nodes=nodes,
    )
