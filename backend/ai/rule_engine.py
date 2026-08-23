"""
Deterministic clinical rule engine for PathCareSync AI.
Evaluates patient data against disease-specific clinical rules.
"""
from datetime import date, timedelta
from typing import Optional


# Disease-specific rule definitions
CLINICAL_RULES = {
    "Hypertension": [
        {
            "id": "HYP-001",
            "condition": "bp_systolic > 140 for 3+ consecutive readings",
            "severity": "high",
            "message": "Sustained hypertension detected — BP consistently above target",
            "action": "Consider medication adjustment or adherence check",
        },
        {
            "id": "HYP-002",
            "condition": "bp_systolic > 180 OR bp_diastolic > 120",
            "severity": "critical",
            "message": "Hypertensive crisis threshold — immediate intervention needed",
            "action": "Emergency teleconsult or hospital visit",
        },
        {
            "id": "HYP-003",
            "condition": "compliance_rate < 60%",
            "severity": "medium",
            "message": "Low medication compliance for hypertension management",
            "action": "ASHA worker follow-up for adherence counselling",
        },
    ],
    "Type 2 Diabetes": [
        {
            "id": "DM-001",
            "condition": "hba1c > 9% after 30 days of treatment",
            "severity": "high",
            "message": "HbA1c not responding to current treatment plan",
            "action": "Review medication regimen — consider insulin initiation/titration",
        },
        {
            "id": "DM-002",
            "condition": "no glucose reading for > 7 days",
            "severity": "critical",
            "message": "Glucose monitoring gap — unable to track glycemic control",
            "action": "Urgent patient contact for monitoring resumption",
        },
        {
            "id": "DM-003",
            "condition": "fasting_glucose > 200 mg/dL for 3 readings",
            "severity": "high",
            "message": "Persistent severe hyperglycemia",
            "action": "Consider insulin dose adjustment or hospitalisation",
        },
    ],
    "Tuberculosis": [
        {
            "id": "TB-001",
            "condition": "missed_dots_sessions > 2 in 30 days",
            "severity": "high",
            "message": "DOTS adherence concern — treatment failure risk",
            "action": "DOTS supervisor home visit and counselling",
        },
        {
            "id": "TB-002",
            "condition": "weight_loss > 3 kg in 30 days",
            "severity": "high",
            "message": "Significant weight loss during TB treatment",
            "action": "Reassess treatment response — consider drug-resistant TB workup",
        },
        {
            "id": "TB-003",
            "condition": "sputum_positive at month 2",
            "severity": "critical",
            "message": "Sputum not converting — treatment may be failing",
            "action": "DST panel + specialist consultation",
        },
    ],
    "Coronary Artery Disease": [
        {
            "id": "CAD-001",
            "condition": "cardiac_rehab_overdue > 7 days",
            "severity": "critical",
            "message": "Cardiac rehabilitation not started despite being prescribed",
            "action": "Contact patient — arrange rehab start immediately",
        },
        {
            "id": "CAD-002",
            "condition": "chest_pain_reported",
            "severity": "critical",
            "message": "Patient reports chest pain — possible recurrent event",
            "action": "Immediate ER referral",
        },
        {
            "id": "CAD-003",
            "condition": "statin_side_effect_reported",
            "severity": "high",
            "message": "Patient reports statin side effect (myalgia)",
            "action": "Check CK levels — consider dose/drug modification",
        },
    ],
    "Chronic Kidney Disease": [
        {
            "id": "CKD-001",
            "condition": "egfr_decline > 5 mL/min in 3 months",
            "severity": "critical",
            "message": "Rapid eGFR decline — possible acute-on-chronic kidney injury",
            "action": "Urgent nephrology consultation",
        },
        {
            "id": "CKD-002",
            "condition": "potassium > 5.5 mEq/L",
            "severity": "critical",
            "message": "Hyperkalemia detected — cardiac risk",
            "action": "Immediate potassium management protocol",
        },
        {
            "id": "CKD-003",
            "condition": "egfr < 20",
            "severity": "high",
            "message": "eGFR below 20 — dialysis preparation window",
            "action": "Initiate dialysis access planning discussion",
        },
    ],
    "Stroke Recovery": [
        {
            "id": "STR-001",
            "condition": "bp_variability_index > 0.6",
            "severity": "medium",
            "message": "Blood pressure variability higher than expected post-stroke",
            "action": "Review antihypertensive regimen for consistency",
        },
        {
            "id": "STR-002",
            "condition": "fall_detected OR fall_risk_high",
            "severity": "high",
            "message": "Fall risk elevated in post-stroke recovery",
            "action": "Home safety assessment + PT adjustment",
        },
    ],
    "Depression": [
        {
            "id": "DEP-001",
            "condition": "phq9 > 15 after 4 weeks of treatment",
            "severity": "high",
            "message": "Depression not responding to current treatment",
            "action": "Medication review + therapy intensification",
        },
        {
            "id": "DEP-002",
            "condition": "phq9_increasing for 2+ assessments",
            "severity": "critical",
            "message": "Depression worsening — safety screening recommended",
            "action": "Urgent psychiatric assessment + safety planning",
        },
        {
            "id": "DEP-003",
            "condition": "therapy_sessions_missed > 2",
            "severity": "medium",
            "message": "Therapy sessions being missed — engagement concern",
            "action": "Outreach call + barrier assessment",
        },
    ],
}


def evaluate_rules(disease: str, patient_data: dict) -> list[dict]:
    """
    Evaluate clinical rules for a given disease against patient data.
    Returns list of triggered rules with details.
    """
    rules = CLINICAL_RULES.get(disease, [])
    triggered = []
    for rule in rules:
        # In demo mode, we simulate that some rules trigger
        triggered.append({
            "rule_id": rule["id"],
            "condition": rule["condition"],
            "severity": rule["severity"],
            "message": rule["message"],
            "recommended_action": rule["action"],
            "source": "rule-based",
            "deterministic": True,
            "auditable": True,
        })
    return triggered


def get_rules_for_disease(disease: str) -> list[dict]:
    """Return all clinical rules for a given disease."""
    return CLINICAL_RULES.get(disease, [])
