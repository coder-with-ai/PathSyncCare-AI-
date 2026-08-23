"""
Simulated XGBoost deviation scorer for PathCareSync AI.
Computes deviation scores based on distance from expected trajectory.
In production, this would use a trained XGBoost model.
"""
import math
import random
from typing import Optional


def compute_deviation_score(
    expected_values: list[float],
    actual_values: list[float],
    disease: str,
    vital_type: str,
) -> dict:
    """
    Compute a deviation score (0-1) by comparing expected vs actual trajectories.
    Uses heuristic statistical analysis to simulate XGBoost output.
    """
    if not expected_values or not actual_values:
        return {
            "deviation_score": 0.0,
            "confidence": 0.5,
            "trend": "insufficient_data",
            "source": "ml-pattern",
            "model": "XGBoost v2.1",
        }

    # Compute mean absolute deviation
    min_len = min(len(expected_values), len(actual_values))
    deviations = [abs(actual_values[i] - expected_values[i]) for i in range(min_len)]
    mean_dev = sum(deviations) / len(deviations) if deviations else 0

    # Compute trend (is the deviation getting worse?)
    if len(deviations) >= 4:
        first_half = sum(deviations[:len(deviations)//2]) / (len(deviations)//2)
        second_half = sum(deviations[len(deviations)//2:]) / (len(deviations) - len(deviations)//2)
        trend = "worsening" if second_half > first_half * 1.1 else (
            "improving" if second_half < first_half * 0.9 else "stable"
        )
    else:
        trend = "stable"

    # Normalize deviation to 0-1 range based on vital type
    normalizers = {
        "bp_systolic": 40,    # 40 mmHg max deviation
        "bp_diastolic": 25,
        "hba1c": 3,           # 3% max deviation
        "egfr": 20,           # 20 mL/min max deviation
        "heart_rate": 30,     # 30 bpm max deviation
        "weight": 10,         # 10 kg max deviation
        "phq9": 10,           # 10 points max deviation
        "spo2": 10,
    }
    normalizer = normalizers.get(vital_type, 30)
    score = min(mean_dev / normalizer, 1.0)

    # Confidence based on data quantity and consistency
    confidence = min(0.5 + (min_len / 20) * 0.4 + (0.1 if trend != "stable" else 0), 1.0)

    return {
        "deviation_score": round(score, 3),
        "confidence": round(confidence, 3),
        "trend": trend,
        "mean_absolute_deviation": round(mean_dev, 2),
        "data_points": min_len,
        "source": "ml-pattern",
        "model": "XGBoost v2.1 (deviation-scorer)",
        "feature_importance": {
            "trajectory_distance": round(random.uniform(0.3, 0.5), 3),
            "trend_slope": round(random.uniform(0.15, 0.3), 3),
            "compliance_factor": round(random.uniform(0.1, 0.2), 3),
            "time_since_discharge": round(random.uniform(0.05, 0.15), 3),
        },
    }


def batch_score(patients_data: list[dict]) -> list[dict]:
    """Score multiple patients in batch (simulated)."""
    results = []
    for pd in patients_data:
        score = compute_deviation_score(
            pd.get("expected", []),
            pd.get("actual", []),
            pd.get("disease", ""),
            pd.get("vital_type", ""),
        )
        score["patient_id"] = pd.get("patient_id", "")
        results.append(score)
    return results
