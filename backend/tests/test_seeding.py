"""
Unit tests for Idempotent Data Seeding.
Verifies that subsequent seeding runs do not duplicate data or overwrite reviewed alerts.
"""
from sqlalchemy.orm import Session
from app.db_seed import seed_database
from app.models.sql_models import Alert, Patient


def test_seeding_is_idempotent(db_session: Session):
    # db_session is already seeded in conftest fixture
    patient_count_1 = db_session.query(Patient).count()
    alert_count_1 = db_session.query(Alert).count()

    # Run seed again
    second_summary = seed_database(db_session)

    patient_count_2 = db_session.query(Patient).count()
    alert_count_2 = db_session.query(Alert).count()

    # Record counts must not increase
    assert patient_count_1 == patient_count_2
    assert alert_count_1 == alert_count_2
    assert second_summary["patients_inserted"] == 0
    assert second_summary["patients_skipped"] == patient_count_1
    assert second_summary["alerts_inserted"] == 0
    assert second_summary["alerts_skipped"] == alert_count_1


def test_seeding_preserves_reviewed_alerts(db_session: Session):
    # Mark an alert as reviewed
    alert = db_session.query(Alert).first()
    assert alert is not None
    alert_id = alert.id
    alert.status = "reviewed"
    alert.review_action = "accept"
    alert.review_notes = "Custom reviewed note by Doctor"
    db_session.commit()

    # Run seed again
    seed_database(db_session)

    # Check alert still has reviewed status and notes
    preserved_alert = db_session.query(Alert).filter(Alert.id == alert_id).first()
    assert preserved_alert.status == "reviewed"
    assert preserved_alert.review_action == "accept"
    assert preserved_alert.review_notes == "Custom reviewed note by Doctor"
