"""
CRUD repository operations for Worklist and Dashboard Analytics.
Generates priority rankings and KPI metrics directly from Azure SQL tables.
"""
from datetime import datetime, date
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.sql_models import Patient, Alert, PipelineRun


SEVERITY_ORDER = ["low", "medium", "high", "critical"]
URGENCY_REASONS = {
    "critical": "Critical deviation detected",
    "high": "High-risk pattern identified",
    "medium": "Moderate concern flagged",
    "low": "Routine check needed",
}


def get_worklist(db: Session) -> list[dict]:
    """
    Generate priority-ranked patient worklist from database records.
    Filters for patients with active alerts, ranks by risk score descending.
    """
    patients = db.query(Patient).all()
    active_alerts = db.query(Alert).filter(Alert.status == "active").all()

    # Group alerts by patient
    alerts_by_patient: dict[str, list[Alert]] = {}
    for a in active_alerts:
        alerts_by_patient.setdefault(a.patient_id, []).append(a)

    items = []
    for p in patients:
        p_alerts = alerts_by_patient.get(p.id, [])
        if not p_alerts:
            continue

        # Find top alert by deviation score
        top_alert = max(p_alerts, key=lambda a: a.deviation_score or 0.0)

        # Find highest severity among alerts
        max_severity = max(
            p_alerts,
            key=lambda a: SEVERITY_ORDER.index(a.severity) if a.severity in SEVERITY_ORDER else 0,
        )
        urgency_reason = URGENCY_REASONS.get(max_severity.severity, "Clinical alert requiring review")

        items.append({
            "rank": 0,
            "patient_id": p.id,
            "patient_name": p.name,
            "age": p.age,
            "disease": p.disease,
            "risk_score": p.risk_score,
            "urgency_reason": urgency_reason,
            "top_alert": top_alert.title,
            "deviation_score": top_alert.deviation_score or 0.0,
            "avatar_color": p.avatar_color,
        })

    # Sort descending by risk score
    items.sort(key=lambda x: x["risk_score"], reverse=True)
    for idx, item in enumerate(items):
        item["rank"] = idx + 1

    return items


def get_dashboard_stats(db: Session) -> dict:
    """Calculate dashboard KPI statistics from Azure SQL tables."""
    total_patients = db.query(func.count(Patient.id)).scalar() or 0
    active_alerts = db.query(func.count(Alert.id)).filter(Alert.status == "active").scalar() or 0
    critical_deviations = (
        db.query(func.count(Alert.id))
        .filter(Alert.status == "active", Alert.severity == "critical")
        .scalar()
        or 0
    )

    avg_compliance_raw = db.query(func.avg(Patient.compliance_rate)).scalar()
    avg_compliance = round(float(avg_compliance_raw), 1) if avg_compliance_raw is not None else 0.0

    patients_on_track = (
        db.query(func.count(Patient.id))
        .filter(Patient.risk_score < 0.5)
        .scalar()
        or 0
    )

    # Pipeline runs today
    today_start = datetime.combine(date.today(), datetime.min.time())
    runs_today = (
        db.query(func.count(PipelineRun.id))
        .filter(PipelineRun.triggered_at >= today_start)
        .scalar()
        or 0
    )

    # Disease distribution
    disease_counts = (
        db.query(Patient.disease, func.count(Patient.id))
        .group_by(Patient.disease)
        .all()
    )
    disease_dist = {disease: count for disease, count in disease_counts}

    return {
        "total_patients": total_patients,
        "active_alerts": active_alerts,
        "avg_compliance": avg_compliance,
        "critical_deviations": critical_deviations,
        "patients_on_track": patients_on_track,
        "pipeline_runs_today": runs_today,
        "disease_distribution": disease_dist,
    }
