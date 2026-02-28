from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Lead, STAGE_ORDER, TERMINAL_STAGES
from schemas import PipelineCount, SummaryStats

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/pipeline", response_model=list[PipelineCount])
def pipeline_stats(
    branch: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Lead.stage, func.count(Lead.id)).group_by(Lead.stage)
    if branch:
        q = q.filter(Lead.branch == branch)
    rows = q.all()
    count_map = {stage: cnt for stage, cnt in rows}
    # Return all stages in order (including terminal)
    all_stages = STAGE_ORDER + list(TERMINAL_STAGES)
    return [PipelineCount(stage=s, count=count_map.get(s, 0)) for s in all_stages]


@router.get("/summary", response_model=SummaryStats)
def summary_stats(
    branch: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Lead.stage, func.count(Lead.id)).group_by(Lead.stage)
    if branch:
        q = q.filter(Lead.branch == branch)
    rows = {stage: cnt for stage, cnt in q.all()}

    new_count = rows.get("new", 0)
    converted = rows.get("converted", 0)
    lost = rows.get("lost", 0)
    active = sum(cnt for stg, cnt in rows.items() if stg not in {"new", "converted", "lost"})

    return SummaryStats(new=new_count, active=active, converted=converted, lost=lost)
