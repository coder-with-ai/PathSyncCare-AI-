"""
Worklist API router.
Serves priority-ranked daily worklist and dashboard KPI analytics derived from Azure SQL Database.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import worklist as crud_worklist

router = APIRouter(prefix="/api/worklist", tags=["worklist"])


@router.get("")
def get_worklist(db: Session = Depends(get_db)):
    """Get priority-ranked patient worklist for today."""
    return crud_worklist.get_worklist(db)


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard KPI statistics."""
    return crud_worklist.get_dashboard_stats(db)
