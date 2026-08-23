"""
Cross-model validator agent for PathCareSync AI.
Cross-checks outputs from rule engine, ML scorer, and LLM explainer
to detect inconsistencies and provide a validation verdict.
"""


def validate_outputs(
    rule_result: dict | None,
    ml_result: dict | None,
    llm_result: dict | None,
) -> dict:
    """
    Cross-validate outputs from the three AI sources.
    Returns a validation verdict with confidence.
    """
    issues = []
    consensus_score = 1.0

    # Check if all sources agree on severity
    severities = []
    if rule_result and "severity" in rule_result:
        severities.append(rule_result["severity"])
    if ml_result and "deviation_score" in ml_result:
        ml_sev = (
            "critical" if ml_result["deviation_score"] > 0.85 else
            "high" if ml_result["deviation_score"] > 0.65 else
            "medium" if ml_result["deviation_score"] > 0.4 else "low"
        )
        severities.append(ml_sev)

    if len(severities) >= 2 and len(set(severities)) > 1:
        issues.append({
            "type": "severity_mismatch",
            "detail": f"Sources disagree on severity: {severities}",
            "resolution": "Use highest severity as precautionary principle",
        })
        consensus_score -= 0.15

    # Check ML confidence threshold
    if ml_result and ml_result.get("confidence", 1.0) < 0.7:
        issues.append({
            "type": "low_ml_confidence",
            "detail": f"ML model confidence ({ml_result['confidence']}) below threshold (0.7)",
            "resolution": "Flag for human review — confidence gate activated",
        })
        consensus_score -= 0.1

    # Check if LLM explanation aligns with data
    if llm_result and ml_result:
        if ml_result.get("trend") == "improving" and "worsening" in str(llm_result.get("explanation", "")).lower():
            issues.append({
                "type": "trend_contradiction",
                "detail": "LLM says worsening but ML detects improving trend",
                "resolution": "Prioritise ML trend analysis — LLM may lack recent data",
            })
            consensus_score -= 0.2

    # Determine overall verdict
    if consensus_score >= 0.85:
        verdict = "VALIDATED"
        recommendation = "All AI sources are in agreement — alert can proceed"
    elif consensus_score >= 0.6:
        verdict = "VALIDATED_WITH_CAVEATS"
        recommendation = "Minor inconsistencies detected — proceed with awareness"
    else:
        verdict = "REQUIRES_HUMAN_REVIEW"
        recommendation = "Significant disagreement between AI sources — human review required"

    return {
        "verdict": verdict,
        "consensus_score": round(consensus_score, 3),
        "issues": issues,
        "recommendation": recommendation,
        "sources_checked": {
            "rule_engine": rule_result is not None,
            "ml_scorer": ml_result is not None,
            "llm_explainer": llm_result is not None,
        },
        "source": "validator-agent",
        "model": "Cross-Model Validator v1.0",
    }
