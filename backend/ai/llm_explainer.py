"""
Simulated LLM explanation agent for PathCareSync AI.
In production, this would call Gemini 1.5 Flash API.
Returns pre-written clinical explanations clearly labelled as LLM-generated.
"""

EXPLANATION_TEMPLATES = {
    "Hypertension": {
        "rising_bp": (
            "Based on available information: The patient's blood pressure trajectory shows a sustained "
            "upward trend over the past {days} days, with systolic readings averaging {avg} mmHg. "
            "This divergence from the expected recovery trajectory (target: <140/90) suggests either "
            "medication non-adherence, dietary indiscretion (high sodium intake), or inadequate "
            "antihypertensive dosing. Consider: (1) Medication reconciliation, (2) 24-hour ambulatory "
            "BP monitoring, (3) Sodium intake counselling, (4) Dose titration of current medications."
        ),
        "low_compliance": (
            "Available information suggests: The patient's compliance rate of {compliance}% is below "
            "the therapeutic threshold for effective hypertension management. Common barriers in the "
            "Indian context include: cost of medications, forgetfulness, polypharmacy fatigue, and "
            "cultural beliefs about long-term medication. Recommend structured adherence programme "
            "with ASHA worker support and simplified dosing."
        ),
    },
    "Type 2 Diabetes": {
        "hba1c_plateau": (
            "Based on available information: The patient's HbA1c trajectory is not following the expected "
            "decline curve. After {days} days of current regimen, the rate of improvement is {rate}%/week, "
            "below the target of 0.5%/month. This may indicate: (1) Insulin resistance progression, "
            "(2) Dietary non-adherence, (3) Insufficient basal insulin dose, or (4) Counterregulatory "
            "hormone effects. Recommend: intensification of insulin regimen and dietary reassessment."
        ),
        "monitoring_gap": (
            "Available information suggests: The absence of glucose monitoring data for {gap_days} days "
            "creates a critical blind spot in diabetes management. Without regular glucose data, insulin "
            "dose titration cannot be safely performed, and hypoglycaemic events may go undetected. "
            "Priority action: Establish reliable daily glucose monitoring before any medication changes."
        ),
    },
    "Chronic Kidney Disease": {
        "egfr_decline": (
            "Based on available information: The patient's eGFR decline of {decline} mL/min over {days} "
            "days exceeds the expected CKD progression rate. The accelerated trajectory suggests possible "
            "acute-on-chronic injury from: nephrotoxic medications, dehydration, urinary obstruction, or "
            "uncontrolled hypertension/diabetes. Urgent nephrology review recommended with consideration "
            "for dialysis access creation if eGFR < 20."
        ),
        "hyperkalemia": (
            "IMPORTANT — Available information suggests: Elevated potassium of {k_level} mEq/L in the "
            "context of CKD Stage {stage} poses immediate cardiac risk. ECG monitoring is advised. "
            "Consider: (1) Dietary potassium restriction reinforcement, (2) Potassium binder initiation, "
            "(3) Review of ACE-I/ARB dosing, (4) Emergency treatment if K+ > 6.0."
        ),
    },
    "Depression": {
        "worsening": (
            "IMPORTANT — Available information suggests: The patient's PHQ-9 trajectory is worsening "
            "(current score: {score}, baseline: {baseline}) with {missed} missed follow-ups and {compliance}% "
            "compliance. This pattern warrants urgent safety screening. Recommend: (1) Immediate teleconsult, "
            "(2) PHQ-9 item 9 specific assessment, (3) Ensure crisis helpline access. This is a clinical safety flag."
        ),
        "non_response": (
            "Based on available information: After {weeks} weeks of {medication}, the PHQ-9 score has not "
            "shown the expected 50% reduction. Consider: (1) Dose optimisation, (2) Switching antidepressant "
            "class, (3) Augmentation with therapy, (4) Screening for comorbid conditions (thyroid, substance use). "
            "SSRI non-response at 4 weeks warrants medication review."
        ),
    },
    "Coronary Artery Disease": {
        "rehab_missed": (
            "Available information suggests: Post-PCI cardiac rehabilitation is critical for reducing "
            "30-day readmission risk by 25% and improving 1-year survival. The patient's {days_overdue}-day "
            "delay in starting Phase 2 rehab increases the risk of deconditioning and stent-related "
            "complications. Priority: Arrange rehab start within 48 hours with transportation support."
        ),
        "statin_concern": (
            "Based on available information: Patient-reported myalgia with {statin} is a recognised "
            "side effect in 5-10% of patients. Recommend: (1) Check CK levels, (2) If CK < 5x ULN, "
            "consider dose reduction or switch to Rosuvastatin (better myalgia profile), (3) If CK "
            "elevated, hold statin and recheck in 2 weeks. Do NOT discontinue statin without "
            "lipid-lowering alternative given CAD history."
        ),
    },
    "Tuberculosis": {
        "adherence_gap": (
            "Based on available information: {missed} missed DOTS sessions in {period} represent a "
            "significant treatment interruption risk. TB treatment requires >90% adherence for cure. "
            "The patient's current adherence of {compliance}% puts them at risk for treatment failure "
            "and drug-resistant TB development. Recommend: (1) DOTS supervisor home visit, (2) Barrier "
            "assessment, (3) Consider daily digital adherence technology (99DOTS)."
        ),
    },
    "Stroke Recovery": {
        "bp_variability": (
            "Available information suggests: Post-stroke blood pressure variability (current index: "
            "{var_index}) exceeds the recommended stability threshold. BP variability is an independent "
            "risk factor for recurrent stroke. Recommend: (1) Switch to long-acting antihypertensives, "
            "(2) Consider ambulatory BP monitoring, (3) Review timing of medication doses."
        ),
    },
}


def generate_explanation(
    disease: str,
    scenario: str,
    context: dict,
) -> dict:
    """
    Generate a clinical explanation for a given scenario.
    In production, this would call Gemini 1.5 Flash.
    """
    templates = EXPLANATION_TEMPLATES.get(disease, {})
    template = templates.get(scenario, "No specific explanation template available for this scenario.")

    if isinstance(template, str):
        try:
            explanation = template.format(**context)
        except KeyError:
            explanation = template
    else:
        explanation = str(template)

    return {
        "explanation": explanation,
        "source": "llm-explanation",
        "model": "Gemini 1.5 Flash (simulated)",
        "confidence": 0.85,
        "disclaimer": "This explanation is AI-generated and should be validated by a clinician before any clinical decision.",
        "tokens_used": len(explanation.split()) * 2,
    }
