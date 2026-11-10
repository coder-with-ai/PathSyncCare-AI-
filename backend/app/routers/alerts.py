"""
Alerts API router.
Serves clinical alerts, aggregated metrics, and persists doctor reviews in Azure SQL Database.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import AlertReview
from app.crud import alerts as crud_alerts

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


@router.get("")
def list_alerts(
    severity: Optional[str] = None,
    source: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all alerts with optional filtering."""
    return crud_alerts.get_alerts(db, severity=severity, source=source, status=status)


@router.get("/summary")
def alert_summary(db: Session = Depends(get_db)):
    """Get alert counts by severity and source."""
    return crud_alerts.get_alert_summary(db)


@router.get("/{alert_id}")
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    """Get alert detail with full AI explanation."""
    alert = crud_alerts.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/{alert_id}/review")
def review_alert(alert_id: str, review: AlertReview, db: Session = Depends(get_db)):
    """Doctor reviews an alert (accept, dismiss, modify)."""
    result = crud_alerts.review_alert(
        db,
        alert_id=alert_id,
        action=review.action,
        notes=review.notes,
        modified_plan=review.modified_plan,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Alert not found")
    return result
