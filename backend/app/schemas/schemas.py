# Pydantic schemas for PathCareSync AI
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from enum import Enum


class DiseaseType(str, Enum):
    HYPERTENSION = "Hypertension"
    TYPE2_DIABETES = "Type 2 Diabetes"
    TUBERCULOSIS = "Tuberculosis"
    CORONARY_ARTERY = "Coronary Artery Disease"
    CHRONIC_KIDNEY = "Chronic Kidney Disease"
    STROKE_RECOVERY = "Stroke Recovery"
    DEPRESSION = "Depression"


class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class AISource(str, Enum):
    RULE = "rule-based"
    ML = "ml-pattern"
    LLM = "llm-explanation"


class AlertStatus(str, Enum):
    ACTIVE = "active"
    REVIEWED = "reviewed"
    DISMISSED = "dismissed"
    RESOLVED = "resolved"


class PipelineStatus(str, Enum):
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    PENDING = "pending"


class MilestoneStatus(str, Enum):
    COMPLETED = "completed"
    PENDING = "pending"
    OVERDUE = "overdue"
    IN_PROGRESS = "in_progress"


# --- Patient Schemas ---
class VitalReading(BaseModel):
    timestamp: datetime
    type: str  # bp_systolic, bp_diastolic, hba1c, egfr, heart_rate, spo2, weight, phq9
    value: float
    unit: str


class Milestone(BaseModel):
    id: str
    title: str
    description: str
    due_date: date
    status: MilestoneStatus
    completed_date: Optional[date] = None


class CarePlan(BaseModel):
    id: str
    disease: DiseaseType
    created_date: date
    milestones: list[Milestone]
    medications: list[str]
    instructions: list[str]


class TrajectoryPoint(BaseModel):
    day: int
    expected: float
    actual: Optional[float] = None
    label: Optional[str] = None


class PatientSummary(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    abha_id: str
    disease: DiseaseType
    discharge_date: date
    risk_score: float  # 0-1
    compliance_rate: float  # 0-100
    active_alerts: int
    avatar_color: str


class PatientDetail(PatientSummary):
    phone: str
    address: str
    care_plan: CarePlan
    vitals_history: list[VitalReading]
    trajectory: list[TrajectoryPoint]
    interventions: list[dict]


# --- Alert Schemas ---
class AlertBase(BaseModel):
    id: str
    patient_id: str
    patient_name: str
    severity: AlertSeverity
    source: AISource
    title: str
    description: str
    triggered_at: datetime
    status: AlertStatus
    confidence: float  # 0-1
    rule_detail: Optional[str] = None
    ml_detail: Optional[str] = None
    llm_detail: Optional[str] = None
    deviation_score: Optional[float] = None
    disease: DiseaseType


class AlertReview(BaseModel):
    action: str  # accept, dismiss, modify
    notes: Optional[str] = None
    modified_plan: Optional[str] = None


# --- Pipeline Schemas ---
class PipelineNode(BaseModel):
    id: str
    name: str
    type: str  # ingestion, state_builder, trajectory, deviation, llm, validator, dispatcher
    status: PipelineStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    input_summary: Optional[str] = None
    output_summary: Optional[str] = None
    duration_ms: Optional[int] = None


class PipelineRun(BaseModel):
    id: str
    type: str  # daily_sweep, realtime_event, outcome_learning
    status: PipelineStatus
    triggered_at: datetime
    completed_at: Optional[datetime] = None
    triggered_by: str
    patients_processed: int
    alerts_generated: int
    nodes: list[PipelineNode]


# --- Worklist Schemas ---
class WorklistItem(BaseModel):
    rank: int
    patient_id: str
    patient_name: str
    age: int
    disease: DiseaseType
    risk_score: float
    urgency_reason: str
    top_alert: str
    deviation_score: float
    avatar_color: str


class DashboardStats(BaseModel):
    total_patients: int
    active_alerts: int
    avg_compliance: float
    critical_deviations: int
    patients_on_track: int
    pipeline_runs_today: int
    disease_distribution: dict[str, int]
