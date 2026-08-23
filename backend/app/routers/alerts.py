"""Alerts API router."""
from fastapi import APIRouter, HTTPException
from app.models.demo_data import store
from app.schemas.schemas import AlertReview, AlertStatus

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("")
def list_alerts(severity: str | None = None, source: str | None = None, status: str | None = None):
    """List all alerts with optional filtering."""
    alerts = store.alerts
    if severity:
        alerts = [a for a in alerts if a.severity.value == severity]
    if source:
        alerts = [a for a in alerts if a.source.value == source]
    if status:
        alerts = [a for a in alerts if a.status.value == status]
    return [a.model_dump() for a in sorted(alerts, key=lambda x: x.triggered_at, reverse=True)]


@router.get("/summary")
def alert_summary():
    """Get alert counts by severity and source."""
    by_severity = {}
    by_source = {}
    for a in store.alerts:
        by_severity[a.severity.value] = by_severity.get(a.severity.value, 0) + 1
        by_source[a.source.value] = by_source.get(a.source.value, 0) + 1
    active = len([a for a in store.alerts if a.status == AlertStatus.ACTIVE])
    return {
        "total": len(store.alerts),
        "active": active,
        "by_severity": by_severity,
        "by_source": by_source,
    }


@router.get("/{alert_id}")
def get_alert(alert_id: str):
    """Get alert detail with full AI explanation."""
    for a in store.alerts:
        if a.id == alert_id:
            return a.model_dump()
    raise HTTPException(status_code=404, detail="Alert not found")


@router.post("/{alert_id}/review")
def review_alert(alert_id: str, review: AlertReview):
    """Doctor reviews an alert (accept, dismiss, modify)."""
    for a in store.alerts:
        if a.id == alert_id:
            if review.action == "accept":
                a.status = AlertStatus.REVIEWED
            elif review.action == "dismiss":
                a.status = AlertStatus.DISMISSED
            elif review.action == "modify":
                a.status = AlertStatus.REVIEWED
            return {"status": "success", "alert_id": alert_id, "action": review.action}
    raise HTTPException(status_code=404, detail="Alert not found")
