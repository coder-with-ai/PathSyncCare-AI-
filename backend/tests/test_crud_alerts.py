"""
Unit tests for Alerts CRUD operations and doctor review persistence.
"""
from sqlalchemy.orm import Session
from app.crud.alerts import (
    get_alerts,
    get_alert,
    get_alert_summary,
    review_alert,
)
from app.models.sql_models import Alert, Patient


def test_get_alerts_ordering_and_filtering(db_session: Session):
    all_alerts = get_alerts(db_session)
    assert len(all_alerts) > 0

    # Ensure sorted by triggered_at descending
    for i in range(len(all_alerts) - 1):
        assert all_alerts[i]["triggered_at"] >= all_alerts[i + 1]["triggered_at"]

    # Test filtering by severity
    critical_alerts = get_alerts(db_session, severity="critical")
    assert len(critical_alerts) > 0
    for a in critical_alerts:
        assert a["severity"] == "critical"

    # Test filtering by source
    rule_alerts = get_alerts(db_session, source="rule-based")
    assert len(rule_alerts) > 0
    for a in rule_alerts:
        assert a["source"] == "rule-based"


def test_alert_summary_counts(db_session: Session):
    summary = get_alert_summary(db_session)
    assert "total" in summary
    assert "active" in summary
    assert "by_severity" in summary
    assert "by_source" in summary
    assert summary["total"] >= summary["active"]


def test_review_alert_accept_persists_status(db_session: Session):
    # Find an active alert
    alert = db_session.query(Alert).filter(Alert.status == "active").first()
    assert alert is not None
    alert_id = alert.id
    patient_id = alert.patient_id

    patient_before = db_session.query(Patient).filter(Patient.id == patient_id).first()
    active_before = patient_before.active_alerts

    res = review_alert(db_session, alert_id=alert_id, action="accept", notes="Doctor accepted intervention")
    assert res is not None
    assert res["status"] == "success"
    assert res["action"] == "accept"

    # Verify status changed in database
    updated = db_session.query(Alert).filter(Alert.id == alert_id).first()
    assert updated.status == "reviewed"
    assert updated.review_action == "accept"
    assert updated.review_notes == "Doctor accepted intervention"
    assert updated.reviewed_at is not None

    # Verify patient's active alert count was decremented
    patient_after = db_session.query(Patient).filter(Patient.id == patient_id).first()
    if active_before > 0:
        assert patient_after.active_alerts == active_before - 1


def test_review_alert_dismiss_persists_status(db_session: Session):
    alert = db_session.query(Alert).filter(Alert.status == "active").first()
    assert alert is not None

    res = review_alert(db_session, alert_id=alert.id, action="dismiss", notes="False positive")
    assert res["status"] == "success"
    assert res["action"] == "dismiss"

    updated = db_session.query(Alert).filter(Alert.id == alert.id).first()
    assert updated.status == "dismissed"
    assert updated.review_action == "dismiss"
