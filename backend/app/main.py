"""
PathCareSync AI — FastAPI Backend
Main application entry point with CORS and router registration.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import patients, alerts, pipeline, worklist

app = FastAPI(
    title="PathCareSync AI",
    description="Adaptive Care Intelligence — Expected vs Actual Deviation Engine",
    version="1.0.0",
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(patients.router)
app.include_router(alerts.router)
app.include_router(pipeline.router)
app.include_router(worklist.router)


@app.get("/")
def root():
    return {
        "app": "PathCareSync AI",
        "version": "1.0.0",
        "status": "running",
        "tagline": "Adaptive Care Intelligence — Bridging hospital discharge to long-term disease management",
    }


@app.get("/api/health")
def health_check():
    from app.models.demo_data import store
    return {
        "status": "healthy",
        "patients_loaded": len(store.patients),
        "alerts_loaded": len(store.alerts),
        "pipeline_runs": len(store.pipeline_runs),
    }


@app.get("/api/ai/rules/{disease}")
def get_disease_rules(disease: str):
    """Get clinical rules for a specific disease."""
    from ai.rule_engine import get_rules_for_disease
    rules = get_rules_for_disease(disease)
    if not rules:
        return {"disease": disease, "rules": [], "message": "No rules found for this disease"}
    return {"disease": disease, "rules": rules}
