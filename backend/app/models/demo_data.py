"""
In-memory demo data store for PathCareSync AI.
Contains 14 realistic Indian patients across 7 priority diseases with
vitals history, care plans, trajectories, alerts, and pipeline runs.
"""
import random
import math
from datetime import datetime, date, timedelta
from typing import Optional

from app.schemas.schemas import (
    PatientSummary, PatientDetail, VitalReading, CarePlan, Milestone,
    TrajectoryPoint, AlertBase, PipelineRun, PipelineNode, WorklistItem,
    DashboardStats, DiseaseType, AlertSeverity, AISource, AlertStatus,
    PipelineStatus, MilestoneStatus
)

# ─── Color palette for avatars ─────────────────────────────────────────────────
AVATAR_COLORS = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
    "#E11D48", "#7C3AED", "#0EA5E9", "#D946EF"
]

# ─── Helper: generate vitals time series ───────────────────────────────────────
def _gen_vitals(
    base_date: date,
    days: int,
    vital_type: str,
    unit: str,
    base_val: float,
    expected_trend: float,  # per-day change in expected
    noise: float = 5.0,
    drift: float = 0.0,     # actual drifts from expected by this per-day
) -> tuple[list[VitalReading], list[TrajectoryPoint]]:
    readings = []
    trajectory = []
    for d in range(0, days, 3):  # reading every 3 days
        ts = datetime.combine(base_date + timedelta(days=d), datetime.min.time().replace(hour=9))
        expected = base_val + expected_trend * d
        actual = expected + drift * d + random.uniform(-noise, noise)
        readings.append(VitalReading(
            timestamp=ts,
            type=vital_type,
            value=round(actual, 1),
            unit=unit,
        ))
        trajectory.append(TrajectoryPoint(
            day=d,
            expected=round(expected, 1),
            actual=round(actual, 1),
        ))
    return readings, trajectory


# ─── Patients ──────────────────────────────────────────────────────────────────
def _build_patients() -> list[PatientDetail]:
    today = date.today()
    patients = []

    # ── Patient 1: Hypertension ─────────────────────────────────────────────
    p1_discharge = today - timedelta(days=45)
    p1_vitals, p1_traj = _gen_vitals(p1_discharge, 45, "bp_systolic", "mmHg", 155, -0.5, 8, 0.3)
    patients.append(PatientDetail(
        id="PAT-001", name="Rajesh Kumar", age=58, gender="Male",
        abha_id="91-2345-6789-0123", disease=DiseaseType.HYPERTENSION,
        discharge_date=p1_discharge, risk_score=0.78, compliance_rate=62.0,
        active_alerts=3, avatar_color=AVATAR_COLORS[0],
        phone="+91-98765-43210", address="Block C, Sector 12, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-001", disease=DiseaseType.HYPERTENSION, created_date=p1_discharge,
            milestones=[
                Milestone(id="M1", title="7-Day BP Check", description="Post-discharge BP monitoring", due_date=p1_discharge + timedelta(days=7), status=MilestoneStatus.COMPLETED, completed_date=p1_discharge + timedelta(days=8)),
                Milestone(id="M2", title="14-Day Follow-Up", description="Cardiologist consultation", due_date=p1_discharge + timedelta(days=14), status=MilestoneStatus.COMPLETED, completed_date=p1_discharge + timedelta(days=15)),
                Milestone(id="M3", title="30-Day Lab Work", description="Renal function + electrolytes", due_date=p1_discharge + timedelta(days=30), status=MilestoneStatus.OVERDUE),
                Milestone(id="M4", title="45-Day Review", description="Medication adjustment review", due_date=p1_discharge + timedelta(days=45), status=MilestoneStatus.PENDING),
            ],
            medications=["Amlodipine 5mg", "Telmisartan 40mg", "Aspirin 75mg"],
            instructions=["Monitor BP twice daily", "Low sodium diet", "30 min walk daily", "Avoid alcohol"],
        ),
        vitals_history=p1_vitals,
        trajectory=p1_traj,
        interventions=[
            {"date": str(p1_discharge + timedelta(days=10)), "type": "Phone Call", "description": "ASHA worker contacted - patient missed BP reading", "outcome": "Patient resumed monitoring"},
            {"date": str(p1_discharge + timedelta(days=25)), "type": "Medication Alert", "description": "BP trending upward despite medication", "outcome": "Pending review"},
        ],
    ))

    # ── Patient 2: Type 2 Diabetes ──────────────────────────────────────────
    p2_discharge = today - timedelta(days=60)
    p2_vitals, p2_traj = _gen_vitals(p2_discharge, 60, "hba1c", "%", 9.2, -0.03, 0.3, 0.01)
    patients.append(PatientDetail(
        id="PAT-002", name="Sunita Devi", age=52, gender="Female",
        abha_id="91-3456-7890-1234", disease=DiseaseType.TYPE2_DIABETES,
        discharge_date=p2_discharge, risk_score=0.65, compliance_rate=78.0,
        active_alerts=2, avatar_color=AVATAR_COLORS[1],
        phone="+91-98765-43211", address="Gomti Nagar, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-002", disease=DiseaseType.TYPE2_DIABETES, created_date=p2_discharge,
            milestones=[
                Milestone(id="M1", title="Weekly Glucose Monitoring", description="Fasting + PP glucose", due_date=p2_discharge + timedelta(days=7), status=MilestoneStatus.COMPLETED, completed_date=p2_discharge + timedelta(days=7)),
                Milestone(id="M2", title="HbA1c Test (Month 1)", description="Glycemic control check", due_date=p2_discharge + timedelta(days=30), status=MilestoneStatus.COMPLETED, completed_date=p2_discharge + timedelta(days=32)),
                Milestone(id="M3", title="Eye Screening", description="Diabetic retinopathy screening", due_date=p2_discharge + timedelta(days=60), status=MilestoneStatus.PENDING),
                Milestone(id="M4", title="HbA1c Test (Month 2)", description="Follow-up glycemic check", due_date=p2_discharge + timedelta(days=60), status=MilestoneStatus.IN_PROGRESS),
            ],
            medications=["Metformin 500mg BD", "Glimepiride 1mg", "Atorvastatin 10mg"],
            instructions=["Check fasting glucose daily", "Low glycemic index diet", "Walk 45 min daily", "Foot care routine"],
        ),
        vitals_history=p2_vitals,
        trajectory=p2_traj,
        interventions=[
            {"date": str(p2_discharge + timedelta(days=20)), "type": "Diet Counselling", "description": "Nutritionist teleconsult arranged", "outcome": "Patient adopted meal plan"},
        ],
    ))

    # ── Patient 3: Tuberculosis ─────────────────────────────────────────────
    p3_discharge = today - timedelta(days=90)
    p3_vitals, p3_traj = _gen_vitals(p3_discharge, 90, "weight", "kg", 52, 0.08, 1.5, -0.02)
    patients.append(PatientDetail(
        id="PAT-003", name="Mohammad Irfan", age=34, gender="Male",
        abha_id="91-4567-8901-2345", disease=DiseaseType.TUBERCULOSIS,
        discharge_date=p3_discharge, risk_score=0.45, compliance_rate=92.0,
        active_alerts=1, avatar_color=AVATAR_COLORS[2],
        phone="+91-98765-43212", address="Aliganj, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-003", disease=DiseaseType.TUBERCULOSIS, created_date=p3_discharge,
            milestones=[
                Milestone(id="M1", title="DOTS Intensive Phase Start", description="4-drug regimen", due_date=p3_discharge, status=MilestoneStatus.COMPLETED, completed_date=p3_discharge),
                Milestone(id="M2", title="2-Month Sputum Test", description="Sputum conversion check", due_date=p3_discharge + timedelta(days=60), status=MilestoneStatus.COMPLETED, completed_date=p3_discharge + timedelta(days=62)),
                Milestone(id="M3", title="Continuation Phase Start", description="Switch to 2-drug regimen", due_date=p3_discharge + timedelta(days=60), status=MilestoneStatus.COMPLETED, completed_date=p3_discharge + timedelta(days=60)),
                Milestone(id="M4", title="5-Month Sputum Test", description="Follow-up sputum", due_date=p3_discharge + timedelta(days=150), status=MilestoneStatus.PENDING),
            ],
            medications=["Isoniazid", "Rifampicin", "Pyrazinamide", "Ethambutol"],
            instructions=["DOTS daily supervised therapy", "Monthly weight check", "Report any vision changes", "Nutritious diet"],
        ),
        vitals_history=p3_vitals,
        trajectory=p3_traj,
        interventions=[
            {"date": str(p3_discharge + timedelta(days=15)), "type": "DOTS Visit", "description": "Confirmed medication adherence", "outcome": "On track"},
        ],
    ))

    # ── Patient 4: Coronary Artery Disease ──────────────────────────────────
    p4_discharge = today - timedelta(days=30)
    p4_vitals, p4_traj = _gen_vitals(p4_discharge, 30, "heart_rate", "bpm", 88, -0.3, 5, 0.2)
    patients.append(PatientDetail(
        id="PAT-004", name="Anita Sharma", age=63, gender="Female",
        abha_id="91-5678-9012-3456", disease=DiseaseType.CORONARY_ARTERY,
        discharge_date=p4_discharge, risk_score=0.85, compliance_rate=55.0,
        active_alerts=4, avatar_color=AVATAR_COLORS[3],
        phone="+91-98765-43213", address="Hazratganj, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-004", disease=DiseaseType.CORONARY_ARTERY, created_date=p4_discharge,
            milestones=[
                Milestone(id="M1", title="Post-PCI Follow-Up", description="7-day wound + medication check", due_date=p4_discharge + timedelta(days=7), status=MilestoneStatus.COMPLETED, completed_date=p4_discharge + timedelta(days=8)),
                Milestone(id="M2", title="Cardiac Rehab Start", description="Phase 2 cardiac rehabilitation", due_date=p4_discharge + timedelta(days=14), status=MilestoneStatus.OVERDUE),
                Milestone(id="M3", title="Lipid Panel", description="Cholesterol + triglycerides", due_date=p4_discharge + timedelta(days=30), status=MilestoneStatus.PENDING),
                Milestone(id="M4", title="Stress Test", description="Exercise tolerance test", due_date=p4_discharge + timedelta(days=45), status=MilestoneStatus.PENDING),
            ],
            medications=["Clopidogrel 75mg", "Atorvastatin 40mg", "Metoprolol 25mg", "Aspirin 75mg", "Ramipril 5mg"],
            instructions=["Cardiac rehab exercises", "Low fat diet", "No heavy lifting for 6 weeks", "Immediate ER if chest pain"],
        ),
        vitals_history=p4_vitals,
        trajectory=p4_traj,
        interventions=[
            {"date": str(p4_discharge + timedelta(days=12)), "type": "Missed Appointment", "description": "Patient did not attend cardiac rehab", "outcome": "Rescheduled via WhatsApp"},
            {"date": str(p4_discharge + timedelta(days=20)), "type": "Medication Concern", "description": "Patient reports muscle pain with statin", "outcome": "Pending doctor review"},
        ],
    ))

    # ── Patient 5: Chronic Kidney Disease ───────────────────────────────────
    p5_discharge = today - timedelta(days=55)
    p5_vitals, p5_traj = _gen_vitals(p5_discharge, 55, "egfr", "mL/min", 38, 0.1, 3, -0.15)
    patients.append(PatientDetail(
        id="PAT-005", name="Vikram Singh", age=67, gender="Male",
        abha_id="91-6789-0123-4567", disease=DiseaseType.CHRONIC_KIDNEY,
        discharge_date=p5_discharge, risk_score=0.91, compliance_rate=48.0,
        active_alerts=5, avatar_color=AVATAR_COLORS[4],
        phone="+91-98765-43214", address="Indira Nagar, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-005", disease=DiseaseType.CHRONIC_KIDNEY, created_date=p5_discharge,
            milestones=[
                Milestone(id="M1", title="Nephrology Follow-Up", description="Post-discharge renal review", due_date=p5_discharge + timedelta(days=7), status=MilestoneStatus.COMPLETED, completed_date=p5_discharge + timedelta(days=9)),
                Milestone(id="M2", title="Creatinine + eGFR", description="Monthly renal function", due_date=p5_discharge + timedelta(days=30), status=MilestoneStatus.OVERDUE),
                Milestone(id="M3", title="Potassium Check", description="Electrolyte monitoring", due_date=p5_discharge + timedelta(days=30), status=MilestoneStatus.OVERDUE),
                Milestone(id="M4", title="Dietician Review", description="Renal diet adherence", due_date=p5_discharge + timedelta(days=45), status=MilestoneStatus.PENDING),
            ],
            medications=["Sodium Bicarbonate", "Erythropoietin injection", "Calcium Carbonate", "Furosemide 40mg"],
            instructions=["Low protein diet", "Restrict potassium intake", "Monitor urine output", "Weekly weight check"],
        ),
        vitals_history=p5_vitals,
        trajectory=p5_traj,
        interventions=[
            {"date": str(p5_discharge + timedelta(days=18)), "type": "Urgent Call", "description": "eGFR dropping faster than expected", "outcome": "Nephrologist consultation scheduled"},
            {"date": str(p5_discharge + timedelta(days=35)), "type": "Lab Alert", "description": "Potassium elevated at 5.8 mEq/L", "outcome": "Emergency intervention needed"},
        ],
    ))

    # ── Patient 6: Stroke Recovery ──────────────────────────────────────────
    p6_discharge = today - timedelta(days=40)
    p6_vitals, p6_traj = _gen_vitals(p6_discharge, 40, "bp_systolic", "mmHg", 160, -0.6, 10, 0.1)
    patients.append(PatientDetail(
        id="PAT-006", name="Priya Agarwal", age=71, gender="Female",
        abha_id="91-7890-1234-5678", disease=DiseaseType.STROKE_RECOVERY,
        discharge_date=p6_discharge, risk_score=0.72, compliance_rate=70.0,
        active_alerts=2, avatar_color=AVATAR_COLORS[5],
        phone="+91-98765-43215", address="Mahanagar, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-006", disease=DiseaseType.STROKE_RECOVERY, created_date=p6_discharge,
            milestones=[
                Milestone(id="M1", title="Physiotherapy Start", description="Daily PT sessions", due_date=p6_discharge + timedelta(days=3), status=MilestoneStatus.COMPLETED, completed_date=p6_discharge + timedelta(days=4)),
                Milestone(id="M2", title="Speech Therapy", description="Weekly speech sessions", due_date=p6_discharge + timedelta(days=7), status=MilestoneStatus.COMPLETED, completed_date=p6_discharge + timedelta(days=10)),
                Milestone(id="M3", title="30-Day Neuro Review", description="Neurologist follow-up", due_date=p6_discharge + timedelta(days=30), status=MilestoneStatus.COMPLETED, completed_date=p6_discharge + timedelta(days=31)),
                Milestone(id="M4", title="MRI Follow-Up", description="Brain imaging repeat", due_date=p6_discharge + timedelta(days=90), status=MilestoneStatus.PENDING),
            ],
            medications=["Clopidogrel 75mg", "Atorvastatin 20mg", "Amlodipine 5mg", "Escitalopram 10mg"],
            instructions=["Daily physiotherapy", "Fall prevention measures", "Speech exercises", "Caregiver support"],
        ),
        vitals_history=p6_vitals,
        trajectory=p6_traj,
        interventions=[
            {"date": str(p6_discharge + timedelta(days=15)), "type": "Home Visit", "description": "ASHA worker assessed fall risk at home", "outcome": "Handrails recommended"},
        ],
    ))

    # ── Patient 7: Depression ───────────────────────────────────────────────
    p7_discharge = today - timedelta(days=35)
    p7_vitals, p7_traj = _gen_vitals(p7_discharge, 35, "phq9", "score", 18, -0.2, 2, 0.1)
    patients.append(PatientDetail(
        id="PAT-007", name="Amit Verma", age=28, gender="Male",
        abha_id="91-8901-2345-6789", disease=DiseaseType.DEPRESSION,
        discharge_date=p7_discharge, risk_score=0.68, compliance_rate=60.0,
        active_alerts=2, avatar_color=AVATAR_COLORS[6],
        phone="+91-98765-43216", address="Vikas Nagar, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-007", disease=DiseaseType.DEPRESSION, created_date=p7_discharge,
            milestones=[
                Milestone(id="M1", title="Psychiatry Follow-Up", description="2-week medication review", due_date=p7_discharge + timedelta(days=14), status=MilestoneStatus.COMPLETED, completed_date=p7_discharge + timedelta(days=14)),
                Milestone(id="M2", title="PHQ-9 Assessment", description="Monthly depression screening", due_date=p7_discharge + timedelta(days=30), status=MilestoneStatus.IN_PROGRESS),
                Milestone(id="M3", title="Therapy Session", description="CBT session with psychologist", due_date=p7_discharge + timedelta(days=21), status=MilestoneStatus.OVERDUE),
                Milestone(id="M4", title="Family Counselling", description="Include family in care", due_date=p7_discharge + timedelta(days=45), status=MilestoneStatus.PENDING),
            ],
            medications=["Sertraline 50mg", "Clonazepam 0.25mg SOS"],
            instructions=["Daily mood journaling", "Regular sleep schedule", "Avoid alcohol", "Weekly therapy sessions"],
        ),
        vitals_history=p7_vitals,
        trajectory=p7_traj,
        interventions=[
            {"date": str(p7_discharge + timedelta(days=10)), "type": "Teleconsult", "description": "Patient reported insomnia worsening", "outcome": "Sleep hygiene counselling provided"},
        ],
    ))

    # ── Patient 8: Hypertension (Well-controlled) ───────────────────────────
    p8_discharge = today - timedelta(days=50)
    p8_vitals, p8_traj = _gen_vitals(p8_discharge, 50, "bp_systolic", "mmHg", 148, -0.4, 5, -0.05)
    patients.append(PatientDetail(
        id="PAT-008", name="Deepa Mishra", age=45, gender="Female",
        abha_id="91-9012-3456-7890", disease=DiseaseType.HYPERTENSION,
        discharge_date=p8_discharge, risk_score=0.25, compliance_rate=94.0,
        active_alerts=0, avatar_color=AVATAR_COLORS[7],
        phone="+91-98765-43217", address="Chinhat, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-008", disease=DiseaseType.HYPERTENSION, created_date=p8_discharge,
            milestones=[
                Milestone(id="M1", title="7-Day BP Check", description="Initial monitoring", due_date=p8_discharge + timedelta(days=7), status=MilestoneStatus.COMPLETED, completed_date=p8_discharge + timedelta(days=6)),
                Milestone(id="M2", title="30-Day Review", description="Medication review", due_date=p8_discharge + timedelta(days=30), status=MilestoneStatus.COMPLETED, completed_date=p8_discharge + timedelta(days=29)),
                Milestone(id="M3", title="60-Day Lab Work", description="Renal panel", due_date=p8_discharge + timedelta(days=60), status=MilestoneStatus.PENDING),
            ],
            medications=["Amlodipine 5mg"],
            instructions=["Monitor BP daily", "DASH diet", "Regular exercise"],
        ),
        vitals_history=p8_vitals, trajectory=p8_traj, interventions=[],
    ))

    # ── Patient 9: Type 2 Diabetes (High Risk) ─────────────────────────────
    p9_discharge = today - timedelta(days=25)
    p9_vitals, p9_traj = _gen_vitals(p9_discharge, 25, "hba1c", "%", 11.5, -0.05, 0.4, 0.04)
    patients.append(PatientDetail(
        id="PAT-009", name="Ramesh Yadav", age=60, gender="Male",
        abha_id="91-0123-4567-8901", disease=DiseaseType.TYPE2_DIABETES,
        discharge_date=p9_discharge, risk_score=0.88, compliance_rate=40.0,
        active_alerts=4, avatar_color=AVATAR_COLORS[8],
        phone="+91-98765-43218", address="Alambagh, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-009", disease=DiseaseType.TYPE2_DIABETES, created_date=p9_discharge,
            milestones=[
                Milestone(id="M1", title="Insulin Training", description="Self-injection training", due_date=p9_discharge + timedelta(days=3), status=MilestoneStatus.COMPLETED, completed_date=p9_discharge + timedelta(days=5)),
                Milestone(id="M2", title="Glucose Log Review", description="Weekly glucose patterns", due_date=p9_discharge + timedelta(days=7), status=MilestoneStatus.OVERDUE),
                Milestone(id="M3", title="Foot Examination", description="Neuropathy screening", due_date=p9_discharge + timedelta(days=30), status=MilestoneStatus.PENDING),
            ],
            medications=["Insulin Glargine 16U", "Metformin 1000mg", "Empagliflozin 10mg"],
            instructions=["Check glucose 4x daily", "Insulin dose titration log", "Foot inspection daily", "Carry glucose tabs"],
        ),
        vitals_history=p9_vitals, trajectory=p9_traj,
        interventions=[
            {"date": str(p9_discharge + timedelta(days=8)), "type": "Alert", "description": "Patient not logging glucose readings", "outcome": "ASHA worker follow-up initiated"},
        ],
    ))

    # ── Patient 10: TB (DOTS adherence concern) ─────────────────────────────
    p10_discharge = today - timedelta(days=70)
    p10_vitals, p10_traj = _gen_vitals(p10_discharge, 70, "weight", "kg", 48, 0.07, 1.0, -0.05)
    patients.append(PatientDetail(
        id="PAT-010", name="Fatima Begum", age=40, gender="Female",
        abha_id="91-1234-5678-9012", disease=DiseaseType.TUBERCULOSIS,
        discharge_date=p10_discharge, risk_score=0.55, compliance_rate=75.0,
        active_alerts=2, avatar_color=AVATAR_COLORS[9],
        phone="+91-98765-43219", address="Kaiserbagh, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-010", disease=DiseaseType.TUBERCULOSIS, created_date=p10_discharge,
            milestones=[
                Milestone(id="M1", title="DOTS Phase 1", description="Intensive phase start", due_date=p10_discharge, status=MilestoneStatus.COMPLETED, completed_date=p10_discharge),
                Milestone(id="M2", title="2-Month Sputum", description="Sputum conversion", due_date=p10_discharge + timedelta(days=60), status=MilestoneStatus.COMPLETED, completed_date=p10_discharge + timedelta(days=65)),
                Milestone(id="M3", title="Continuation Phase", description="Switch regimen", due_date=p10_discharge + timedelta(days=60), status=MilestoneStatus.IN_PROGRESS),
            ],
            medications=["HRZE fixed-dose combo"],
            instructions=["DOTS daily", "Monthly weight", "Report side effects immediately"],
        ),
        vitals_history=p10_vitals, trajectory=p10_traj,
        interventions=[
            {"date": str(p10_discharge + timedelta(days=40)), "type": "Missed DOTS", "description": "3 missed DOTS sessions", "outcome": "Home visit scheduled"},
        ],
    ))

    # ── Patient 11: CAD (Post-CABG) ────────────────────────────────────────
    p11_discharge = today - timedelta(days=20)
    p11_vitals, p11_traj = _gen_vitals(p11_discharge, 20, "heart_rate", "bpm", 92, -0.4, 6, 0.0)
    patients.append(PatientDetail(
        id="PAT-011", name="Suresh Pandey", age=56, gender="Male",
        abha_id="91-2345-6789-0124", disease=DiseaseType.CORONARY_ARTERY,
        discharge_date=p11_discharge, risk_score=0.60, compliance_rate=82.0,
        active_alerts=1, avatar_color=AVATAR_COLORS[10],
        phone="+91-98765-43220", address="Rajajipuram, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-011", disease=DiseaseType.CORONARY_ARTERY, created_date=p11_discharge,
            milestones=[
                Milestone(id="M1", title="Wound Check", description="Surgical wound review", due_date=p11_discharge + timedelta(days=7), status=MilestoneStatus.COMPLETED, completed_date=p11_discharge + timedelta(days=7)),
                Milestone(id="M2", title="Cardiac Rehab", description="Phase 1 rehab", due_date=p11_discharge + timedelta(days=14), status=MilestoneStatus.IN_PROGRESS),
                Milestone(id="M3", title="Echo Follow-Up", description="Echocardiogram", due_date=p11_discharge + timedelta(days=30), status=MilestoneStatus.PENDING),
            ],
            medications=["Aspirin 150mg", "Clopidogrel 75mg", "Atorvastatin 80mg", "Metoprolol 50mg"],
            instructions=["Gradual activity increase", "Wound care", "Low salt diet", "Smoking cessation"],
        ),
        vitals_history=p11_vitals, trajectory=p11_traj,
        interventions=[],
    ))

    # ── Patient 12: CKD (Dialysis prep) ────────────────────────────────────
    p12_discharge = today - timedelta(days=35)
    p12_vitals, p12_traj = _gen_vitals(p12_discharge, 35, "egfr", "mL/min", 22, 0.05, 2, -0.1)
    patients.append(PatientDetail(
        id="PAT-012", name="Kavita Gupta", age=59, gender="Female",
        abha_id="91-3456-7890-1235", disease=DiseaseType.CHRONIC_KIDNEY,
        discharge_date=p12_discharge, risk_score=0.82, compliance_rate=58.0,
        active_alerts=3, avatar_color=AVATAR_COLORS[11],
        phone="+91-98765-43221", address="Vikas Nagar, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-012", disease=DiseaseType.CHRONIC_KIDNEY, created_date=p12_discharge,
            milestones=[
                Milestone(id="M1", title="AV Fistula Planning", description="Vascular access discussion", due_date=p12_discharge + timedelta(days=14), status=MilestoneStatus.COMPLETED, completed_date=p12_discharge + timedelta(days=16)),
                Milestone(id="M2", title="Renal Diet Review", description="Dietician consultation", due_date=p12_discharge + timedelta(days=21), status=MilestoneStatus.OVERDUE),
                Milestone(id="M3", title="Monthly Labs", description="CMP + CBC", due_date=p12_discharge + timedelta(days=30), status=MilestoneStatus.PENDING),
            ],
            medications=["Erythropoietin", "Calcium Carbonate", "Furosemide 80mg", "Sodium Bicarbonate"],
            instructions=["Strict fluid restriction", "Low potassium diet", "Daily weight", "Monitor swelling"],
        ),
        vitals_history=p12_vitals, trajectory=p12_traj,
        interventions=[
            {"date": str(p12_discharge + timedelta(days=20)), "type": "Urgent", "description": "eGFR dropping below 20, dialysis timeline discussion needed", "outcome": "Pending nephrologist review"},
        ],
    ))

    # ── Patient 13: Stroke Recovery (Good progress) ─────────────────────────
    p13_discharge = today - timedelta(days=60)
    p13_vitals, p13_traj = _gen_vitals(p13_discharge, 60, "bp_systolic", "mmHg", 150, -0.5, 6, -0.1)
    patients.append(PatientDetail(
        id="PAT-013", name="Harish Chandra", age=65, gender="Male",
        abha_id="91-4567-8901-2346", disease=DiseaseType.STROKE_RECOVERY,
        discharge_date=p13_discharge, risk_score=0.35, compliance_rate=88.0,
        active_alerts=0, avatar_color=AVATAR_COLORS[12],
        phone="+91-98765-43222", address="Aminabad, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-013", disease=DiseaseType.STROKE_RECOVERY, created_date=p13_discharge,
            milestones=[
                Milestone(id="M1", title="PT Sessions", description="Physiotherapy", due_date=p13_discharge + timedelta(days=7), status=MilestoneStatus.COMPLETED, completed_date=p13_discharge + timedelta(days=7)),
                Milestone(id="M2", title="30-Day Review", description="Neuro follow-up", due_date=p13_discharge + timedelta(days=30), status=MilestoneStatus.COMPLETED, completed_date=p13_discharge + timedelta(days=30)),
                Milestone(id="M3", title="60-Day Assessment", description="Functional assessment", due_date=p13_discharge + timedelta(days=60), status=MilestoneStatus.IN_PROGRESS),
            ],
            medications=["Aspirin 75mg", "Atorvastatin 20mg", "Amlodipine 5mg"],
            instructions=["Daily PT exercises", "Monitor BP", "Fall prevention"],
        ),
        vitals_history=p13_vitals, trajectory=p13_traj, interventions=[],
    ))

    # ── Patient 14: Depression (Worsening) ──────────────────────────────────
    p14_discharge = today - timedelta(days=28)
    p14_vitals, p14_traj = _gen_vitals(p14_discharge, 28, "phq9", "score", 16, -0.15, 2, 0.15)
    patients.append(PatientDetail(
        id="PAT-014", name="Neha Tiwari", age=32, gender="Female",
        abha_id="91-5678-9012-3457", disease=DiseaseType.DEPRESSION,
        discharge_date=p14_discharge, risk_score=0.75, compliance_rate=50.0,
        active_alerts=3, avatar_color=AVATAR_COLORS[13],
        phone="+91-98765-43223", address="Telibagh, Lucknow, UP",
        care_plan=CarePlan(
            id="CP-014", disease=DiseaseType.DEPRESSION, created_date=p14_discharge,
            milestones=[
                Milestone(id="M1", title="Psychiatry Visit", description="2-week follow-up", due_date=p14_discharge + timedelta(days=14), status=MilestoneStatus.OVERDUE),
                Milestone(id="M2", title="PHQ-9 Recheck", description="Symptom reassessment", due_date=p14_discharge + timedelta(days=21), status=MilestoneStatus.OVERDUE),
                Milestone(id="M3", title="Therapy Referral", description="CBT start", due_date=p14_discharge + timedelta(days=28), status=MilestoneStatus.PENDING),
            ],
            medications=["Fluoxetine 20mg", "Trazodone 50mg HS"],
            instructions=["Mood tracking daily", "Sleep hygiene", "Social engagement", "Crisis helpline info provided"],
        ),
        vitals_history=p14_vitals, trajectory=p14_traj,
        interventions=[
            {"date": str(p14_discharge + timedelta(days=14)), "type": "Missed Visit", "description": "Patient did not attend follow-up", "outcome": "WhatsApp reminder sent"},
            {"date": str(p14_discharge + timedelta(days=21)), "type": "PHQ-9 Concern", "description": "Self-reported score increasing", "outcome": "Urgent teleconsult arranged"},
        ],
    ))

    return patients


# ─── Alerts ────────────────────────────────────────────────────────────────────
def _build_alerts(patients: list[PatientDetail]) -> list[AlertBase]:
    today = datetime.now()
    alerts = []

    alert_templates = [
        # (patient_id_idx, severity, source, title, description, confidence, rule, ml, llm, deviation)
        (0, AlertSeverity.HIGH, AISource.RULE, "BP Consistently Above Target",
         "Systolic BP > 140 mmHg for 5 consecutive readings",
         0.95, "Rule: IF bp_systolic > 140 for 5 consecutive readings THEN flag",
         None, None, 0.72),

        (0, AlertSeverity.MEDIUM, AISource.ML, "Upward BP Trend Detected",
         "ML model detects statistically significant upward trend in BP readings",
         0.82, None, "XGBoost deviation score: 0.72 — BP trajectory diverging from expected decline curve",
         None, 0.72),

        (0, AlertSeverity.MEDIUM, AISource.LLM, "Medication Adherence Concern",
         "Pattern suggests possible medication non-adherence",
         0.71, None, None,
         "Based on available information: Rising BP despite antihypertensive therapy may indicate medication non-adherence. The patient's compliance rate of 62% supports this hypothesis. Recommend medication reconciliation and adherence counselling.",
         0.65),

        (3, AlertSeverity.CRITICAL, AISource.RULE, "Cardiac Rehab Not Started",
         "Cardiac rehabilitation overdue by 16 days",
         0.99, "Rule: IF milestone_status == 'overdue' AND milestone_type == 'cardiac_rehab' AND days_overdue > 7 THEN critical",
         None, None, 0.88),

        (3, AlertSeverity.HIGH, AISource.ML, "Post-PCI Heart Rate Pattern",
         "Heart rate recovery not following expected post-intervention trajectory",
         0.78, None, "XGBoost: heart rate deviation score 0.68 — expected declining trend not materialising",
         None, 0.68),

        (3, AlertSeverity.HIGH, AISource.LLM, "Statin Side Effect Reported",
         "Patient reports muscle pain — potential statin myopathy",
         0.88, None, None,
         "Available information suggests: Patient-reported muscle pain (myalgia) with high-dose statin (Atorvastatin 40mg) is a recognised side effect occurring in 5-10% of patients. Recommend CK level check and consider dose reduction or switch to Rosuvastatin.",
         0.75),

        (3, AlertSeverity.MEDIUM, AISource.RULE, "Low Compliance Score",
         "Patient compliance dropped below 60%",
         0.95, "Rule: IF compliance_rate < 60 THEN flag medium",
         None, None, 0.55),

        (4, AlertSeverity.CRITICAL, AISource.ML, "eGFR Rapid Decline",
         "eGFR declining faster than expected — possible acute-on-chronic kidney injury",
         0.92, None, "XGBoost deviation score: 0.91 — eGFR trajectory shows accelerated decline beyond expected variance",
         None, 0.91),

        (4, AlertSeverity.CRITICAL, AISource.RULE, "Potassium Elevated",
         "Serum potassium 5.8 mEq/L — hyperkalemia risk",
         0.99, "Rule: IF potassium > 5.5 THEN critical alert",
         None, None, 0.95),

        (4, AlertSeverity.HIGH, AISource.LLM, "CKD Progression Risk Assessment",
         "Multi-factor risk assessment indicates accelerated CKD progression",
         0.85, None, None,
         "Based on available information: Combination of declining eGFR (from 38 to 28 over 55 days), elevated potassium, and 48% compliance rate suggests inadequate disease management. Dialysis preparation timeline may need to be accelerated. Recommend urgent nephrology review.",
         0.88),

        (4, AlertSeverity.HIGH, AISource.RULE, "Multiple Overdue Milestones",
         "2 care plan milestones overdue",
         0.99, "Rule: IF count(overdue_milestones) >= 2 THEN high alert",
         None, None, 0.70),

        (4, AlertSeverity.MEDIUM, AISource.ML, "Weight Gain Pattern",
         "Fluid retention suspected — weight trending above expected",
         0.76, None, "XGBoost: weight deviation 0.62 — upward trend suggests fluid accumulation",
         None, 0.62),

        (1, AlertSeverity.MEDIUM, AISource.ML, "HbA1c Not Declining As Expected",
         "Glycemic control improvement slower than care plan trajectory",
         0.74, None, "XGBoost: HbA1c deviation score 0.58 — rate of decline below expected 0.03%/day",
         None, 0.58),

        (1, AlertSeverity.LOW, AISource.RULE, "Eye Screening Due",
         "Diabetic retinopathy screening milestone approaching",
         0.99, "Rule: IF milestone_due_in_days <= 7 THEN reminder",
         None, None, 0.20),

        (6, AlertSeverity.HIGH, AISource.ML, "PHQ-9 Not Improving",
         "Depression score not showing expected improvement trajectory",
         0.80, None, "XGBoost: PHQ-9 deviation score 0.70 — scores plateauing instead of declining",
         None, 0.70),

        (6, AlertSeverity.MEDIUM, AISource.RULE, "Therapy Session Overdue",
         "CBT session missed — 14 days overdue",
         0.99, "Rule: IF milestone_status == 'overdue' AND milestone_type == 'therapy' THEN flag",
         None, None, 0.50),

        (8, AlertSeverity.CRITICAL, AISource.RULE, "Glucose Monitoring Gap",
         "No glucose readings logged for 7 days",
         0.99, "Rule: IF days_since_last_reading('glucose') > 7 THEN critical",
         None, None, 0.80),

        (8, AlertSeverity.HIGH, AISource.ML, "HbA1c Trajectory Worsening",
         "HbA1c not declining despite insulin initiation",
         0.84, None, "XGBoost: deviation score 0.78 — expected rapid improvement with insulin not observed",
         None, 0.78),

        (8, AlertSeverity.HIGH, AISource.LLM, "Insulin Dose Adjustment Needed",
         "Pattern suggests insulin dose may be insufficient",
         0.72, None, None,
         "Available information suggests: With HbA1c at 11.5% and poor glucose logging compliance (40%), the prescribed 16U Glargine may be subtherapeutic. Recommend: (1) Establish reliable glucose monitoring first, (2) Consider insulin dose titration protocol, (3) Re-evaluate oral medications.",
         0.75),

        (8, AlertSeverity.MEDIUM, AISource.RULE, "Low Compliance",
         "Compliance rate critically low at 40%",
         0.99, "Rule: IF compliance_rate < 50 THEN medium alert",
         None, None, 0.60),

        (9, AlertSeverity.MEDIUM, AISource.RULE, "DOTS Adherence Gap",
         "3 missed DOTS sessions in past month",
         0.95, "Rule: IF missed_dots_sessions > 2 THEN flag",
         None, None, 0.55),

        (9, AlertSeverity.MEDIUM, AISource.ML, "Weight Gain Below Expected",
         "TB patient not gaining weight as expected during treatment",
         0.70, None, "XGBoost: weight trajectory deviation 0.52 — expected recovery weight gain not on track",
         None, 0.52),

        (11, AlertSeverity.CRITICAL, AISource.ML, "eGFR Below 20 — Dialysis Window",
         "eGFR has crossed below 20 — dialysis preparation critical",
         0.94, None, "XGBoost: eGFR trajectory at 18.5, below 20 threshold with accelerating decline",
         None, 0.92),

        (11, AlertSeverity.HIGH, AISource.RULE, "Renal Diet Review Overdue",
         "Dietician consultation overdue by 14 days",
         0.99, "Rule: IF milestone_overdue AND type == 'diet_review' THEN flag",
         None, None, 0.60),

        (11, AlertSeverity.HIGH, AISource.LLM, "Fluid Overload Risk",
         "Combined indicators suggest fluid management concern",
         0.79, None, None,
         "Available information suggests: With eGFR < 20, Furosemide 80mg may be insufficient for volume management. Daily weight trending upward by 0.3kg/week suggests progressive fluid retention. Recommend: dose adjustment or addition of metolazone, and strict I/O charting.",
         0.72),

        (5, AlertSeverity.MEDIUM, AISource.ML, "BP Variability Post-Stroke",
         "BP readings show higher-than-expected variability",
         0.73, None, "XGBoost: BP variability index 0.65 — post-stroke BP should be more stable by day 40",
         None, 0.65),

        (5, AlertSeverity.LOW, AISource.RULE, "MRI Follow-Up Scheduled",
         "90-day MRI follow-up approaching in 50 days",
         0.99, "Rule: IF milestone_due_in_days <= 60 THEN info",
         None, None, 0.10),

        (13, AlertSeverity.HIGH, AISource.ML, "Depression Worsening",
         "PHQ-9 scores show worsening trend contrary to expected improvement",
         0.86, None, "XGBoost: PHQ-9 deviation score 0.78 — scores increasing instead of expected decline",
         None, 0.78),

        (13, AlertSeverity.CRITICAL, AISource.RULE, "Multiple Follow-Ups Missed",
         "Psychiatry visit and PHQ-9 recheck both overdue",
         0.99, "Rule: IF count(overdue_milestones) >= 2 AND disease == 'depression' THEN critical",
         None, None, 0.85),

        (13, AlertSeverity.HIGH, AISource.LLM, "Suicide Risk Screening Recommended",
         "Worsening depression trajectory warrants safety assessment",
         0.90, None, None,
         "IMPORTANT — Available information suggests: Patient's PHQ-9 trajectory is worsening (increasing from 16 to estimated 19) with 2 missed follow-ups and 50% compliance. This pattern warrants urgent safety screening. Recommend: immediate teleconsult, PHQ-9 item 9 specific assessment, and ensure crisis helpline access. This is a clinical safety flag.",
         0.90),
    ]

    for i, (pidx, sev, src, title, desc, conf, rule, ml, llm, dev) in enumerate(alert_templates):
        p = patients[pidx]
        hours_ago = random.randint(1, 72)
        alerts.append(AlertBase(
            id=f"ALT-{i+1:03d}",
            patient_id=p.id,
            patient_name=p.name,
            severity=sev,
            source=src,
            title=title,
            description=desc,
            triggered_at=today - timedelta(hours=hours_ago),
            status=AlertStatus.ACTIVE if random.random() > 0.3 else AlertStatus.REVIEWED,
            confidence=conf,
            rule_detail=rule,
            ml_detail=ml,
            llm_detail=llm,
            deviation_score=dev,
            disease=p.disease,
        ))

    return alerts


# ─── Pipeline Runs ─────────────────────────────────────────────────────────────
def _build_pipeline_runs() -> list[PipelineRun]:
    today = datetime.now()
    runs = []

    def _make_nodes(status: PipelineStatus, base_time: datetime) -> list[PipelineNode]:
        node_defs = [
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
        nodes = []
        elapsed = 0
        for nid, name, ntype in node_defs:
            dur = random.randint(200, 2500)
            n_status = status
            if status == PipelineStatus.RUNNING:
                # Make first few nodes completed, one running, rest pending
                idx = int(nid[1]) - 1
                if idx < 4:
                    n_status = PipelineStatus.SUCCESS
                elif idx == 4:
                    n_status = PipelineStatus.RUNNING
                else:
                    n_status = PipelineStatus.PENDING
                    dur = 0

            nodes.append(PipelineNode(
                id=nid,
                name=name,
                type=ntype,
                status=n_status if status != PipelineStatus.FAILED else (PipelineStatus.FAILED if nid == "N4" else PipelineStatus.SUCCESS if int(nid[1]) < 4 else PipelineStatus.PENDING),
                started_at=base_time + timedelta(milliseconds=elapsed) if n_status != PipelineStatus.PENDING else None,
                completed_at=base_time + timedelta(milliseconds=elapsed + dur) if n_status == PipelineStatus.SUCCESS else None,
                input_summary=f"{name} input data" if n_status != PipelineStatus.PENDING else None,
                output_summary=f"{name} processed successfully" if n_status == PipelineStatus.SUCCESS else None,
                duration_ms=dur if n_status == PipelineStatus.SUCCESS else None,
            ))
            elapsed += dur
        return nodes

    # Today's runs
    for i in range(5):
        hours = i * 4 + 2
        base = today - timedelta(hours=hours)
        status = PipelineStatus.SUCCESS if i > 0 else PipelineStatus.RUNNING
        runs.append(PipelineRun(
            id=f"RUN-{i+1:03d}",
            type="daily_sweep" if i % 3 == 0 else ("realtime_event" if i % 3 == 1 else "outcome_learning"),
            status=status,
            triggered_at=base,
            completed_at=base + timedelta(seconds=random.randint(15, 45)) if status == PipelineStatus.SUCCESS else None,
            triggered_by="System (Scheduled)" if i % 3 == 0 else ("Vital Reading: PAT-001" if i % 3 == 1 else "Doctor Action: ALT-005"),
            patients_processed=14 if i % 3 == 0 else 1,
            alerts_generated=random.randint(2, 8) if status == PipelineStatus.SUCCESS else 0,
            nodes=_make_nodes(status, base),
        ))

    # Yesterday's runs
    for i in range(3):
        base = today - timedelta(days=1, hours=i * 6 + 1)
        status = PipelineStatus.SUCCESS if i != 1 else PipelineStatus.FAILED
        runs.append(PipelineRun(
            id=f"RUN-{i+6:03d}",
            type="daily_sweep" if i == 0 else ("realtime_event" if i == 1 else "outcome_learning"),
            status=status,
            triggered_at=base,
            completed_at=base + timedelta(seconds=random.randint(15, 45)) if status == PipelineStatus.SUCCESS else base + timedelta(seconds=12),
            triggered_by="System (Scheduled)" if i == 0 else ("Vital Reading: PAT-005" if i == 1 else "Doctor Action: ALT-010"),
            patients_processed=14 if i == 0 else 1,
            alerts_generated=random.randint(3, 10) if status == PipelineStatus.SUCCESS else 0,
            nodes=_make_nodes(status, base),
        ))

    return runs


# ─── Build Worklist ────────────────────────────────────────────────────────────
def build_worklist(patients: list[PatientDetail], alerts: list[AlertBase]) -> list[WorklistItem]:
    """Generate priority-ranked worklist from patients and their alerts."""
    items = []
    for p in patients:
        p_alerts = [a for a in alerts if a.patient_id == p.id and a.status == AlertStatus.ACTIVE]
        if not p_alerts:
            continue
        top_alert = max(p_alerts, key=lambda a: a.deviation_score or 0)
        urgency_reasons = {
            AlertSeverity.CRITICAL: "Critical deviation detected",
            AlertSeverity.HIGH: "High-risk pattern identified",
            AlertSeverity.MEDIUM: "Moderate concern flagged",
            AlertSeverity.LOW: "Routine check needed",
        }
        max_severity = max(p_alerts, key=lambda a: ["low", "medium", "high", "critical"].index(a.severity.value))
        items.append(WorklistItem(
            rank=0,
            patient_id=p.id,
            patient_name=p.name,
            age=p.age,
            disease=p.disease,
            risk_score=p.risk_score,
            urgency_reason=urgency_reasons[max_severity.severity],
            top_alert=top_alert.title,
            deviation_score=top_alert.deviation_score or 0,
            avatar_color=p.avatar_color,
        ))

    items.sort(key=lambda x: x.risk_score, reverse=True)
    for i, item in enumerate(items):
        item.rank = i + 1
    return items


# ─── Dashboard Stats ───────────────────────────────────────────────────────────
def build_dashboard_stats(patients: list[PatientDetail], alerts: list[AlertBase], runs: list[PipelineRun]) -> DashboardStats:
    active = [a for a in alerts if a.status == AlertStatus.ACTIVE]
    critical = [a for a in active if a.severity == AlertSeverity.CRITICAL]
    compliance_vals = [p.compliance_rate for p in patients]
    on_track = [p for p in patients if p.risk_score < 0.5]

    today = datetime.now().date()
    runs_today = [r for r in runs if r.triggered_at.date() == today]

    disease_dist: dict[str, int] = {}
    for p in patients:
        disease_dist[p.disease.value] = disease_dist.get(p.disease.value, 0) + 1

    return DashboardStats(
        total_patients=len(patients),
        active_alerts=len(active),
        avg_compliance=round(sum(compliance_vals) / len(compliance_vals), 1) if compliance_vals else 0,
        critical_deviations=len(critical),
        patients_on_track=len(on_track),
        pipeline_runs_today=len(runs_today),
        disease_distribution=disease_dist,
    )


# ─── Global Data Store ─────────────────────────────────────────────────────────
class DataStore:
    def __init__(self):
        self.patients = _build_patients()
        self.alerts = _build_alerts(self.patients)
        self.pipeline_runs = _build_pipeline_runs()
        self.worklist = build_worklist(self.patients, self.alerts)
        self.stats = build_dashboard_stats(self.patients, self.alerts, self.pipeline_runs)


# Singleton
store = DataStore()
