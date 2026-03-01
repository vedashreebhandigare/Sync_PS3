from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_branch_filter, get_current_user
from database import get_db
from models import Lead, User, STAGE_ORDER, TERMINAL_STAGES
from schemas import PipelineCount, SummaryStats, BranchPerformance, HallUtilization, SourcePerformance

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


@router.get("/branch-performance", response_model=list[BranchPerformance])
def branch_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    from models import Branch, Hall

    branches_query = db.query(Branch)
    if branch_filter:
        branches_query = branches_query.filter(Branch.id == branch_filter)

    branches = branches_query.all()

    # --- First pass: collect raw data per branch ---
    raw = []
    for item in branches:
        leads = db.query(Lead).filter(Lead.branch == item.id).all()
        total_leads = len(leads)
        converted_leads = [l for l in leads if l.stage == "converted"]
        rejected_leads = [l for l in leads if l.stage == "lost"]
        num_converted = len(converted_leads)
        num_rejected = len(rejected_leads)
        conversion_rate = (num_converted / total_leads * 100) if total_leads > 0 else 0.0

        total_revenue = sum(l.total_cost for l in converted_leads)

        halls = db.query(Hall).filter(Hall.branch_id == item.id).all()
        hall_util = []
        total_bookings = 0
        for h in halls:
            times_booked = len([l for l in converted_leads if l.selected_hall_id == h.id])
            total_bookings += times_booked
            hall_util.append(HallUtilization(hall_id=h.id, hall_name=h.name, times_booked=times_booked))
        hall_util.sort(key=lambda x: x.times_booked, reverse=True)

        # Hall utilization density = avg bookings per hall
        hall_density = (total_bookings / len(halls)) if halls else 0

        raw.append({
            "branch": item,
            "total_leads": total_leads,
            "num_converted": num_converted,
            "num_rejected": num_rejected,
            "conversion_rate": round(conversion_rate, 2),
            "total_revenue": total_revenue,
            "hall_util": hall_util,
            "hall_density": hall_density,
        })

    # --- Second pass: compute overall performance score ---
    # Weights: Conversion Rate 40%, Revenue Rank 40%, Hall Utilization 20%
    max_revenue = max((r["total_revenue"] for r in raw), default=1) or 1
    max_density = max((r["hall_density"] for r in raw), default=1) or 1

    results = []
    for r in raw:
        # Normalize each metric to 0-100
        conv_score = min(r["conversion_rate"], 100)               # already 0-100
        rev_score = (r["total_revenue"] / max_revenue) * 100      # 0-100
        hall_score = (r["hall_density"] / max_density) * 100       # 0-100

        overall = round(conv_score * 0.40 + rev_score * 0.40 + hall_score * 0.20, 1)

        results.append(BranchPerformance(
            branch_id=r["branch"].id,
            branch_name=r["branch"].name,
            total_leads=r["total_leads"],
            converted_leads=r["num_converted"],
            rejected_leads=r["num_rejected"],
            conversion_rate=r["conversion_rate"],
            total_revenue=r["total_revenue"],
            overall_performance_score=overall,
            hall_utilization=r["hall_util"],
        ))

    # Sort by overall score descending
    results.sort(key=lambda x: x.overall_performance_score, reverse=True)
    return results


@router.get("/source-performance", response_model=list[SourcePerformance])
def source_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    q = db.query(Lead)
    if branch_filter:
        q = q.filter(Lead.branch == branch_filter)
        
    leads = q.all()
    source_dict = {}
    
    for l in leads:
        src = l.source or "Unknown"
        if src not in source_dict:
            source_dict[src] = {"total": 0, "converted": 0, "revenue": 0.0}
        
        source_dict[src]["total"] += 1
        if l.stage == "converted":
            source_dict[src]["converted"] += 1
            source_dict[src]["revenue"] += l.total_cost
            
    results = []
    for src, data in source_dict.items():
        conversion_rate = (data["converted"] / data["total"] * 100) if data["total"] > 0 else 0.0
        results.append(SourcePerformance(
            source=src,
            total_leads=data["total"],
            converted_leads=data["converted"],
            conversion_rate=round(conversion_rate, 2),
            total_revenue=data["revenue"]
        ))
        
    results.sort(key=lambda x: x.total_revenue, reverse=True)
    return results
