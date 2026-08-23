"""Worklist API router."""
from fastapi import APIRouter
from app.models.demo_data import store

router = APIRouter(prefix="/api/worklist", tags=["worklist"])


@router.get("")
def get_worklist():
    """Get priority-ranked patient worklist for today."""
    return [w.model_dump() for w in store.worklist]


@router.get("/stats")
def get_dashboard_stats():
    """Get dashboard KPI statistics."""
    return store.stats.model_dump()
