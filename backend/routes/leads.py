import csv
import io
import uuid
from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from auth import get_branch_filter, get_current_user
from database import get_db
from models import (
    AddOn,
    Lead,
    MenuItem,
    Partner,
    Remark,
    User,
    STAGE_ORDER,
    TERMINAL_STAGES,
)
from schemas import (
    AddOnIn,
    AddOnOut,
    HallSelect,
    LeadBrief,
    LeadCreate,
    LeadOut,
    LeadUpdate,
    MenuItemIn,
    MenuItemOut,
    RemarkIn,
    RemarkOut,
    StageChange,
)

router = APIRouter(prefix="/api/leads", tags=["leads"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _recalc(lead: Lead):
    """Recalculate menu_total and total_cost."""
    lead.menu_total = sum(m.cost_per_plate for m in lead.menu_items)
    lead.total_cost = lead.menu_total * lead.guest_count


def _stage_index(stage: str) -> int:
    try:
        return STAGE_ORDER.index(stage)
    except ValueError:
        return -1


def _auto_advance(lead: Lead):
    """Apply auto-advance rules after field changes."""
    if lead.selected_hall_id and lead.stage == "visit":
        lead.stage = "tasting"
    if lead.menu_items and lead.stage == "tasting":
        lead.stage = "menu"


def _load_lead(db: Session, lead_id: str) -> Lead:
    lead = (
        db.query(Lead)
        .options(
            joinedload(Lead.menu_items),
            joinedload(Lead.add_ons),
            joinedload(Lead.remarks),
        )
        .filter(Lead.id == lead_id)
        .first()
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


def _check_branch_access(lead: Lead, branch_filter: Optional[str]):
    """Ensure branch manager can only access their own branch's leads."""
    if branch_filter and lead.branch != branch_filter:
        raise HTTPException(status_code=403, detail="Access denied to this lead")


def _resolve_initial_stage(source: str, partner_id: Optional[str]) -> str:
    if source == "Partner Referral" or partner_id:
        return "potential"
    return "new"


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------
@router.get("", response_model=list[LeadBrief])
def list_leads(
    search: Optional[str] = Query(None),
    branch: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    stage: Optional[str] = Query(None),
    partner_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    q = db.query(Lead)

    # Branch managers always see only their branch
    if branch_filter:
        q = q.filter(Lead.branch == branch_filter)
    elif branch:
        q = q.filter(Lead.branch == branch)

    if search:
        pattern = f"%{search}%"
        q = q.filter(
            (Lead.name.ilike(pattern))
            | (Lead.phone.ilike(pattern))
            | (Lead.email.ilike(pattern))
        )
    if event_type:
        q = q.filter(Lead.event_type == event_type)
    if source:
        q = q.filter(Lead.source == source)
    if stage:
        q = q.filter(Lead.stage == stage)
    if partner_id:
        q = q.filter(Lead.referred_by_partner_id == partner_id)
    return q.order_by(Lead.created_at.desc()).all()


@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    lead = _load_lead(db, lead_id)
    _check_branch_access(lead, branch_filter)
    return lead


@router.post("", response_model=LeadOut, status_code=201)
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    # Branch manager can only create leads for their own branch
    if branch_filter and payload.branch != branch_filter:
        raise HTTPException(status_code=403, detail="Cannot create leads for another branch")

    if payload.referred_by_partner_id:
        partner = db.query(Partner).filter(
            Partner.id == payload.referred_by_partner_id
        ).first()
        if not partner:
            raise HTTPException(400, "Invalid partner ID")

    initial_stage = _resolve_initial_stage(
        payload.source, payload.referred_by_partner_id
    )

    lead = Lead(
        id=str(uuid.uuid4()),
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        event_type=payload.event_type,
        event_date=payload.event_date,
        guest_count=payload.guest_count,
        budget=payload.budget,
        branch=payload.branch,
        source=payload.source,
        stage=initial_stage,
        assigned_to=payload.assigned_to,
        next_follow_up=payload.next_follow_up,
        food_preferences=payload.food_preferences,
        allergies=payload.allergies,
        advance_percent=payload.advance_percent,
        referred_by_partner_id=payload.referred_by_partner_id,
        created_at=datetime.utcnow(),
    )

    remark_text = "Lead created."
    if payload.referred_by_partner_id:
        partner = db.query(Partner).filter(
            Partner.id == payload.referred_by_partner_id
        ).first()
        if partner:
            remark_text = f"Lead created via partner referral: {partner.name}"

    lead.remarks.append(
        Remark(
            text=remark_text,
            author="System",
            date=date.today(),
            stage=initial_stage,
        )
    )
    db.add(lead)
    db.commit()
    return _load_lead(db, lead.id)


@router.put("/{lead_id}", response_model=LeadOut)
def update_lead(
    lead_id: str,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    lead = _load_lead(db, lead_id)
    _check_branch_access(lead, branch_filter)
    data = payload.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(lead, key, val)
    _recalc(lead)
    _auto_advance(lead)
    db.commit()
    return _load_lead(db, lead.id)


@router.patch("/{lead_id}/stage", response_model=LeadOut)
def change_stage(
    lead_id: str,
    payload: StageChange,
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    lead = _load_lead(db, lead_id)
    _check_branch_access(lead, branch_filter)
    current = lead.stage
    target = payload.stage

    if target not in [s for s in STAGE_ORDER] + list(TERMINAL_STAGES):
        raise HTTPException(400, f"Invalid stage: {target}")
    if current in TERMINAL_STAGES:
        raise HTTPException(400, f"Cannot move from terminal stage '{current}'")
    if target in TERMINAL_STAGES:
        lead.stage = target
        db.commit()
        return _load_lead(db, lead.id)

    cur_idx = _stage_index(current)
    tgt_idx = _stage_index(target)
    if tgt_idx < cur_idx and (cur_idx - tgt_idx) > 1:
        raise HTTPException(400, "Backward movement allowed only one step at a time")

    lead.stage = target
    db.commit()
    return _load_lead(db, lead.id)


@router.delete("/{lead_id}", status_code=204)
def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    lead = _load_lead(db, lead_id)
    _check_branch_access(lead, branch_filter)
    db.delete(lead)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Sub-resources
# ---------------------------------------------------------------------------
@router.post("/{lead_id}/remarks", response_model=RemarkOut, status_code=201)
def add_remark(
    lead_id: str,
    payload: RemarkIn,
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    lead = _load_lead(db, lead_id)
    _check_branch_access(lead, branch_filter)
    remark = Remark(
        lead_id=lead.id,
        text=payload.text,
        author=payload.author,
        date=date.today(),
        stage=lead.stage,
    )
    db.add(remark)
    db.commit()
    db.refresh(remark)
    return remark


@router.put("/{lead_id}/menu", response_model=list[MenuItemOut])
def replace_menu(
    lead_id: str,
    items: list[MenuItemIn],
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    lead = _load_lead(db, lead_id)
    _check_branch_access(lead, branch_filter)
    for mi in lead.menu_items:
        db.delete(mi)
    db.flush()
    new_items = []
    for item in items:
        mi = MenuItem(
            id=str(uuid.uuid4()),
            lead_id=lead.id,
            name=item.name,
            category=item.category,
            cost_per_plate=item.cost_per_plate,
        )
        db.add(mi)
        new_items.append(mi)
    lead.menu_items = new_items
    _recalc(lead)
    _auto_advance(lead)
    db.commit()
    return _load_lead(db, lead.id).menu_items


@router.put("/{lead_id}/hall", response_model=LeadOut)
def set_hall(
    lead_id: str,
    payload: HallSelect,
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    lead = _load_lead(db, lead_id)
    _check_branch_access(lead, branch_filter)
    lead.selected_hall_id = payload.hall_id
    _auto_advance(lead)
    db.commit()
    return _load_lead(db, lead.id)


@router.put("/{lead_id}/addons", response_model=list[AddOnOut])
def replace_addons(
    lead_id: str,
    items: list[AddOnIn],
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    lead = _load_lead(db, lead_id)
    _check_branch_access(lead, branch_filter)
    for ao in lead.add_ons:
        db.delete(ao)
    db.flush()
    new_addons = []
    for item in items:
        ao = AddOn(
            id=str(uuid.uuid4()),
            lead_id=lead.id,
            desc=item.desc,
            cost=item.cost,
        )
        db.add(ao)
        new_addons.append(ao)
    lead.add_ons = new_addons
    db.commit()
    return _load_lead(db, lead.id).add_ons


# ---------------------------------------------------------------------------
# CSV Import
# ---------------------------------------------------------------------------
@router.post("/import-csv", status_code=201)
async def import_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    content = await file.read()
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    count = 0
    for row in reader:
        row_branch = row.get("branch", "")

        # Branch manager can only import for their branch
        if branch_filter and row_branch and row_branch != branch_filter:
            continue  # skip rows for other branches

        source = row.get("source", "Walk-in")
        partner_id = row.get("partnerID", "").strip() or None

        if partner_id:
            partner = db.query(Partner).filter(Partner.id == partner_id).first()
            if not partner:
                partner_id = None

        initial_stage = _resolve_initial_stage(source, partner_id)

        lead = Lead(
            id=str(uuid.uuid4()),
            name=row.get("name", ""),
            phone=row.get("phone", ""),
            email=row.get("email", ""),
            event_type=row.get("eventType", "Wedding"),
            event_date=date.fromisoformat(row.get("eventDate", str(date.today()))),
            guest_count=int(row.get("guestCount", 0)),
            budget=row.get("budget", ""),
            branch=branch_filter or row_branch,
            source=source,
            assigned_to=row.get("assignedTo", ""),
            stage=initial_stage,
            referred_by_partner_id=partner_id,
            created_at=datetime.utcnow(),
        )
        lead.remarks.append(
            Remark(
                text="Imported from CSV.",
                author="System",
                date=date.today(),
                stage=initial_stage,
            )
        )
        db.add(lead)
        count += 1
    db.commit()
    return {"imported": count}
