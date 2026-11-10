"""
SQLAlchemy ORM models for PathSyncCare-AI.
Defines relational tables, constraints, indexes, and relationships for Azure SQL Database.
"""
from datetime import datetime, date, timezone
import json
from sqlalchemy import (
    Column, String, Integer, Float, Date, DateTime,
    ForeignKey, Unicode, UnicodeText, BigInteger,
    PrimaryKeyConstraint, Index
)
from sqlalchemy.orm import relationship
from app.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(32), primary_key=True)
    name = Column(Unicode(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(10), nullable=False)
    abha_id = Column(String(30), unique=True, nullable=False, index=True)
    disease = Column(String(50), nullable=False, index=True)
    discharge_date = Column(Date, nullable=False)
    risk_score = Column(Float, nullable=False, default=0.0)
    compliance_rate = Column(Float, nullable=False, default=0.0)
    active_alerts = Column(Integer, nullable=False, default=0)
    avatar_color = Column(String(10), nullable=False, default="#3B82F6")
    phone = Column(String(20), nullable=False, default="")
    address = Column(Unicode(255), nullable=False, default="")
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    care_plan = relationship("CarePlan", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    vital_readings = relationship("VitalReading", back_populates="patient", cascade="all, delete-orphan", order_by="VitalReading.timestamp")
    trajectory_points = relationship("TrajectoryPoint", back_populates="patient", cascade="all, delete-orphan", order_by="TrajectoryPoint.day")
    interventions = relationship("PatientIntervention", back_populates="patient", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="patient", cascade="all, delete-orphan")


class CarePlan(Base):
    __tablename__ = "care_plans"

    id = Column(String(32), primary_key=True)
    patient_id = Column(String(32), ForeignKey("patients.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    disease = Column(String(50), nullable=False)
    created_date = Column(Date, nullable=False)
    medications_json = Column("medications", UnicodeText, nullable=False, default="[]")
    instructions_json = Column("instructions", UnicodeText, nullable=False, default="[]")
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="care_plan")
    milestones = relationship("Milestone", back_populates="care_plan", cascade="all, delete-orphan", order_by="Milestone.due_date")

    @property
    def medications(self) -> list[str]:
        try:
            return json.loads(self.medications_json) if self.medications_json else []
        except Exception:
            return []

    @medications.setter
    def medications(self, val: list[str]):
        self.medications_json = json.dumps(val)

    @property
    def instructions(self) -> list[str]:
        try:
            return json.loads(self.instructions_json) if self.instructions_json else []
        except Exception:
            return []

    @instructions.setter
    def instructions(self, val: list[str]):
        self.instructions_json = json.dumps(val)


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String(32), nullable=False)
    care_plan_id = Column(String(32), ForeignKey("care_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String(32), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(Unicode(150), nullable=False)
    description = Column(Unicode(500), nullable=False, default="")
    due_date = Column(Date, nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # completed, pending, overdue, in_progress
    completed_date = Column(Date, nullable=True)

    __table_args__ = (
        PrimaryKeyConstraint("care_plan_id", "id", name="pk_milestones"),
    )

    # Relationships
    care_plan = relationship("CarePlan", back_populates="milestones")


class VitalReading(Base):
    __tablename__ = "vital_readings"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    patient_id = Column(String(32), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    type = Column(String(30), nullable=False, index=True)  # bp_systolic, bp_diastolic, hba1c, egfr, etc.
    value = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="vital_readings")


class TrajectoryPoint(Base):
    __tablename__ = "trajectory_points"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    patient_id = Column(String(32), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    day = Column(Integer, nullable=False)
    expected = Column(Float, nullable=False)
    actual = Column(Float, nullable=True)
    label = Column(Unicode(100), nullable=True)

    __table_args__ = (
        Index("ix_trajectory_patient_day", "patient_id", "day"),
    )

    # Relationships
    patient = relationship("Patient", back_populates="trajectory_points")


class PatientIntervention(Base):
    __tablename__ = "patient_interventions"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    patient_id = Column(String(32), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(String(30), nullable=False)
    type = Column(Unicode(100), nullable=False)
    description = Column(Unicode(500), nullable=False)
    outcome = Column(Unicode(500), nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="interventions")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(32), primary_key=True)
    patient_id = Column(String(32), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_name = Column(Unicode(100), nullable=False)
    severity = Column(String(20), nullable=False, index=True)  # critical, high, medium, low
    source = Column(String(30), nullable=False, index=True)    # rule-based, ml-pattern, llm-explanation
    title = Column(Unicode(200), nullable=False)
    description = Column(UnicodeText, nullable=False)
    triggered_at = Column(DateTime, nullable=False, index=True)
    status = Column(String(20), nullable=False, default="active", index=True)  # active, reviewed, dismissed, resolved
    confidence = Column(Float, nullable=False, default=1.0)
    rule_detail = Column(UnicodeText, nullable=True)
    ml_detail = Column(UnicodeText, nullable=True)
    llm_detail = Column(UnicodeText, nullable=True)
    deviation_score = Column(Float, nullable=True)
    disease = Column(String(50), nullable=False, index=True)

    # Review tracking fields
    review_action = Column(String(20), nullable=True)  # accept, dismiss, modify
    review_notes = Column(UnicodeText, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="alerts")


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id = Column(String(32), primary_key=True)
    type = Column(String(50), nullable=False)  # daily_sweep, realtime_event, outcome_learning
    status = Column(String(20), nullable=False, index=True)  # running, success, failed, pending
    triggered_at = Column(DateTime, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    triggered_by = Column(Unicode(100), nullable=False)
    patients_processed = Column(Integer, nullable=False, default=0)
    alerts_generated = Column(Integer, nullable=False, default=0)

    # Relationships
    nodes = relationship("PipelineNode", back_populates="run", cascade="all, delete-orphan", order_by="PipelineNode.id")


class PipelineNode(Base):
    __tablename__ = "pipeline_nodes"

    id = Column(String(32), nullable=False)
    run_id = Column(String(32), ForeignKey("pipeline_runs.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(Unicode(100), nullable=False)
    type = Column(String(50), nullable=False)  # ingestion, state_builder, etc.
    status = Column(String(20), nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    input_summary = Column(UnicodeText, nullable=True)
    output_summary = Column(UnicodeText, nullable=True)
    duration_ms = Column(Integer, nullable=True)

    __table_args__ = (
        PrimaryKeyConstraint("run_id", "id", name="pk_pipeline_nodes"),
    )

    # Relationships
    run = relationship("PipelineRun", back_populates="nodes")
