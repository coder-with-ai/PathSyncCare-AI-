"""
CRUD repository operations for Clinical Alerts.
Handles alert retrieval, filtering, aggregated summaries, and doctor review status persistence in Azure SQL.
"""
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.sql_models import Alert, Patient


def format_alert(a: Alert) -> dict:
    """Format ORM Alert model into API contract dictionary."""
    return {
        "id": a.id,
        "patient_id": a.patient_id,
        "patient_name": a.patient_name,
        "severity": a.severity,
        "source": a.source,
        "title": a.title,
        "description": a.description,
        "triggered_at": a.triggered_at.isoformat(),
        "status": a.status,
        "confidence": a.confidence,
        "rule_detail": a.rule_detail,
        "ml_detail": a.ml_detail,
        "llm_detail": a.llm_detail,
        "deviation_score": a.deviation_score,
        "disease": a.disease,
    }


def get_alerts(
    db: Session,
    severity: Optional[str] = None,
    source: Optional[str] = None,
    status: Optional[str] = None,
) -> list[dict]:
    """List all alerts with optional filtering, sorted by triggered_at descending."""
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if source:
        query = query.filter(Alert.source == source)
    if status:
        query = query.filter(Alert.status == status)

    alerts = query.order_by(Alert.triggered_at.desc()).all()
    return [format_alert(a) for a in alerts]


def get_alert(db: Session, alert_id: str) -> Optional[dict]:
    """Get single alert by ID."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return None
    return format_alert(alert)


def get_alert_summary(db: Session) -> dict:
    """Get aggregated alert metrics by severity and AI source."""
    total = db.query(func.count(Alert.id)).scalar() or 0
    active = db.query(func.count(Alert.id)).filter(Alert.status == "active").scalar() or 0

    severity_counts = (
        db.query(Alert.severity, func.count(Alert.id))
        .group_by(Alert.severity)
        .all()
    )
    by_severity = {sev: count for sev, count in severity_counts}

    source_counts = (
        db.query(Alert.source, func.count(Alert.id))
        .group_by(Alert.source)
        .all()
    )
    by_source = {src: count for src, count in source_counts}

    return {
        "total": total,
        "active": active,
        "by_severity": by_severity,
        "by_source": by_source,
    }


def review_alert(
    db: Session,
    alert_id: str,
    action: str,
    notes: Optional[str] = None,
    modified_plan: Optional[str] = None,
) -> Optional[dict]:
    """
    Doctor reviews an alert (accept, dismiss, modify).
    Persists review action and updates active alert counts for the patient.
    """
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return None

    prev_status = alert.status
    if action == "accept":
        alert.status = "reviewed"
    elif action == "dismiss":
        alert.status = "dismissed"
    elif action == "modify":
        alert.status = "reviewed"
    else:
        alert.status = "reviewed"

    alert.review_action = action
    alert.review_notes = notes or modified_plan
    alert.reviewed_at = datetime.now(timezone.utc)

    # If status transitioned from active to reviewed/dismissed, decrement patient active_alerts
    if prev_status == "active" and alert.status != "active":
        patient = db.query(Patient).filter(Patient.id == alert.patient_id).first()
        if patient and patient.active_alerts > 0:
            patient.active_alerts -= 1

    db.commit()
    return {"status": "success", "alert_id": alert_id, "action": action}
