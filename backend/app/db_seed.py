"""
Idempotent Database Seeding Script for PathSyncCare-AI.
Migrates synthetic/demo patients, care plans, vitals, trajectories, alerts,
and pipeline runs into Azure SQL Database while preserving referential integrity
and existing reviewed alerts.
"""
import sys
import logging
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.models.sql_models import (
    Patient, CarePlan, Milestone, VitalReading, TrajectoryPoint,
    PatientIntervention, Alert, PipelineRun, PipelineNode
)
from app.models.demo_data import store as demo_store

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")


def seed_database(db: Session, force_update: bool = False) -> dict:
    """
    Seed Azure SQL Database with clinical cohort and pipeline run data.
    Idempotent: Safe to execute repeatedly without duplicating records or
    overwriting previously reviewed alerts.
    """
    summary = {
        "patients_inserted": 0,
        "patients_skipped": 0,
        "care_plans_inserted": 0,
        "milestones_inserted": 0,
        "vital_readings_inserted": 0,
        "trajectory_points_inserted": 0,
        "interventions_inserted": 0,
        "alerts_inserted": 0,
        "alerts_skipped": 0,
        "alerts_preserved": 0,
        "pipeline_runs_inserted": 0,
        "pipeline_runs_skipped": 0,
        "pipeline_nodes_inserted": 0,
    }

    # -------------------------------------------------------------------------
    # 1. Seed Patients and Nested Entities (Care Plans, Milestones, Vitals, Trajectories, Interventions)
    # -------------------------------------------------------------------------
    for demo_p in demo_store.patients:
        existing_patient = db.query(Patient).filter(Patient.id == demo_p.id).first()
        if existing_patient:
            summary["patients_skipped"] += 1
            if not force_update:
                continue

        # Insert or update patient
        if not existing_patient:
            patient = Patient(
                id=demo_p.id,
                name=demo_p.name,
                age=demo_p.age,
                gender=demo_p.gender,
                abha_id=demo_p.abha_id,
                disease=demo_p.disease.value,
                discharge_date=demo_p.discharge_date,
                risk_score=demo_p.risk_score,
                compliance_rate=demo_p.compliance_rate,
                active_alerts=demo_p.active_alerts,
                avatar_color=demo_p.avatar_color,
                phone=demo_p.phone,
                address=demo_p.address,
            )
            db.add(patient)
            db.flush()  # Flush so patient exists for foreign keys
            summary["patients_inserted"] += 1

            # Insert Care Plan
            cp = demo_p.care_plan
            care_plan = CarePlan(
                id=cp.id,
                patient_id=demo_p.id,
                disease=cp.disease.value,
                created_date=cp.created_date,
            )
            care_plan.medications = cp.medications
            care_plan.instructions = cp.instructions
            db.add(care_plan)
            db.flush()
            summary["care_plans_inserted"] += 1

            # Insert Milestones
            for m in cp.milestones:
                milestone = Milestone(
                    id=m.id,
                    care_plan_id=cp.id,
                    patient_id=demo_p.id,
                    title=m.title,
                    description=m.description,
                    due_date=m.due_date,
                    status=m.status.value,
                    completed_date=m.completed_date,
                )
                db.add(milestone)
                summary["milestones_inserted"] += 1

            # Insert Vital Readings
            for vr in demo_p.vitals_history:
                reading = VitalReading(
                    patient_id=demo_p.id,
                    timestamp=vr.timestamp,
                    type=vr.type,
                    value=vr.value,
                    unit=vr.unit,
                )
                db.add(reading)
                summary["vital_readings_inserted"] += 1

            # Insert Trajectory Points
            for tp in demo_p.trajectory:
                point = TrajectoryPoint(
                    patient_id=demo_p.id,
                    day=tp.day,
                    expected=tp.expected,
                    actual=tp.actual,
                    label=tp.label,
                )
                db.add(point)
                summary["trajectory_points_inserted"] += 1

            # Insert Interventions
            for item in demo_p.interventions:
                intervention = PatientIntervention(
                    patient_id=demo_p.id,
                    date=str(item.get("date", "")),
                    type=item.get("type", "Clinical Note"),
                    description=item.get("description", ""),
                    outcome=item.get("outcome", ""),
                )
                db.add(intervention)
                summary["interventions_inserted"] += 1

    # -------------------------------------------------------------------------
    # 2. Seed Alerts (Ensures reviewed alerts are NEVER overwritten)
    # -------------------------------------------------------------------------
    for demo_a in demo_store.alerts:
        existing_alert = db.query(Alert).filter(Alert.id == demo_a.id).first()
        if existing_alert:
            # Check if this alert was reviewed by doctor (status != active or has review action)
            if existing_alert.status != "active" or existing_alert.review_action is not None:
                summary["alerts_preserved"] += 1
                summary["alerts_skipped"] += 1
                continue
            summary["alerts_skipped"] += 1
            continue

        alert = Alert(
            id=demo_a.id,
            patient_id=demo_a.patient_id,
            patient_name=demo_a.patient_name,
            severity=demo_a.severity.value,
            source=demo_a.source.value,
            title=demo_a.title,
            description=demo_a.description,
            triggered_at=demo_a.triggered_at,
            status=demo_a.status.value,
            confidence=demo_a.confidence,
            rule_detail=demo_a.rule_detail,
            ml_detail=demo_a.ml_detail,
            llm_detail=demo_a.llm_detail,
            deviation_score=demo_a.deviation_score,
            disease=demo_a.disease.value,
        )
        db.add(alert)
        summary["alerts_inserted"] += 1

    # -------------------------------------------------------------------------
    # 3. Seed Pipeline Runs and Nodes
    # -------------------------------------------------------------------------
    for demo_run in demo_store.pipeline_runs:
        existing_run = db.query(PipelineRun).filter(PipelineRun.id == demo_run.id).first()
        if existing_run:
            summary["pipeline_runs_skipped"] += 1
            continue

        p_run = PipelineRun(
            id=demo_run.id,
            type=demo_run.type,
            status=demo_run.status.value,
            triggered_at=demo_run.triggered_at,
            completed_at=demo_run.completed_at,
            triggered_by=demo_run.triggered_by,
            patients_processed=demo_run.patients_processed,
            alerts_generated=demo_run.alerts_generated,
        )
        db.add(p_run)
        db.flush()
        summary["pipeline_runs_inserted"] += 1

        for n in demo_run.nodes:
            node = PipelineNode(
                id=n.id,
                run_id=demo_run.id,
                name=n.name,
                type=n.type,
                status=n.status.value,
                started_at=n.started_at,
                completed_at=n.completed_at,
                input_summary=n.input_summary,
                output_summary=n.output_summary,
                duration_ms=n.duration_ms,
            )
            db.add(node)
            summary["pipeline_nodes_inserted"] += 1

    db.commit()
    logger.info("Database seeding completed successfully.")
    return summary


def run_seeding():
    """CLI runner to create tables and seed database."""
    if SessionLocal is None:
        logger.error("SessionLocal is not initialized. Check your database configuration.")
        sys.exit(1)

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created via metadata.")

    db = SessionLocal()
    try:
        res = seed_database(db)
        print("\n=== PathSyncCare-AI Seeding Summary ===")
        for k, v in res.items():
            print(f"  {k}: {v}")
        print("=======================================\n")
    finally:
        db.close()


if __name__ == "__main__":
    run_seeding()
