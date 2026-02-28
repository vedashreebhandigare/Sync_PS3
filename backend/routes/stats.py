from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_branch_filter, get_current_user
from database import get_db
from models import Lead, User, STAGE_ORDER, TERMINAL_STAGES
from schemas import PipelineCount, SummaryStats

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/pipeline", response_model=list[PipelineCount])
def pipeline_stats(
    branch: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    q = db.query(Lead.stage, func.count(Lead.id)).group_by(Lead.stage)

    # Branch manager always scoped to their branch
    effective_branch = branch_filter or branch
    if effective_branch:
        q = q.filter(Lead.branch == effective_branch)

    rows = q.all()
    count_map = {stage: cnt for stage, cnt in rows}
    all_stages = STAGE_ORDER + list(TERMINAL_STAGES)
    return [PipelineCount(stage=s, count=count_map.get(s, 0)) for s in all_stages]


@router.get("/summary", response_model=SummaryStats)
def summary_stats(
    branch: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    q = db.query(Lead.stage, func.count(Lead.id)).group_by(Lead.stage)

    effective_branch = branch_filter or branch
    if effective_branch:
        q = q.filter(Lead.branch == effective_branch)

    rows = {stage: cnt for stage, cnt in q.all()}

    new_count = rows.get("new", 0)
    converted = rows.get("converted", 0)
    lost = rows.get("lost", 0)
    potential = rows.get("potential", 0)
    active = sum(cnt for stg, cnt in rows.items() if stg not in {"new", "converted", "lost", "potential"})

    return SummaryStats(new=new_count, active=active, converted=converted, lost=lost, potential=potential)
