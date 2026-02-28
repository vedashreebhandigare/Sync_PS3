import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Lead, Partner, TERMINAL_STAGES
from schemas import PartnerCreate, PartnerOut, PartnerStats, PartnerUpdate

router = APIRouter(prefix="/api/partners", tags=["partners"])


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _compute_stats(db: Session, partner: Partner) -> PartnerStats:
    """Enrich a partner record with referral statistics."""
    referred = db.query(func.count(Lead.id)).filter(
        Lead.referred_by_partner_id == partner.id
    ).scalar() or 0

    converted = db.query(func.count(Lead.id)).filter(
        Lead.referred_by_partner_id == partner.id,
        Lead.stage == "converted",
    ).scalar() or 0

    rate = round((converted / referred) * 100, 1) if referred > 0 else 0.0

    return PartnerStats(
        id=partner.id,
        name=partner.name,
        type=partner.type,
        contact_person=partner.contact_person,
        phone=partner.phone,
        email=partner.email,
        branch_id=partner.branch_id,
        status=partner.status,
        notes=partner.notes,
        created_at=partner.created_at,
        leads_referred=referred,
        leads_converted=converted,
        conversion_rate=rate,
    )


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------
@router.get("", response_model=list[PartnerStats])
def list_partners(
    status: Optional[str] = Query(None),
    branch_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """List all partners with computed referral stats."""
    q = db.query(Partner)
    if status:
        q = q.filter(Partner.status == status)
    if branch_id:
        q = q.filter(Partner.branch_id == branch_id)
    if search:
        pattern = f"%{search}%"
        q = q.filter(
            (Partner.name.ilike(pattern))
            | (Partner.contact_person.ilike(pattern))
            | (Partner.type.ilike(pattern))
        )

    partners = q.order_by(Partner.created_at.desc()).all()
    return [_compute_stats(db, p) for p in partners]


@router.get("/summary")
def partner_summary(db: Session = Depends(get_db)):
    """Aggregate stats for the lead generation dashboard header."""
    total_active = db.query(func.count(Partner.id)).filter(
        Partner.status == "active"
    ).scalar() or 0

    total_referred = db.query(func.count(Lead.id)).filter(
        Lead.referred_by_partner_id.isnot(None)
    ).scalar() or 0

    total_converted = db.query(func.count(Lead.id)).filter(
        Lead.referred_by_partner_id.isnot(None),
        Lead.stage == "converted",
    ).scalar() or 0

    rate = round((total_converted / total_referred) * 100, 1) if total_referred > 0 else 0.0

    return {
        "active_partners": total_active,
        "total_referred": total_referred,
        "total_converted": total_converted,
        "conversion_rate": rate,
    }


@router.get("/{partner_id}", response_model=PartnerStats)
def get_partner(partner_id: str, db: Session = Depends(get_db)):
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")
    return _compute_stats(db, partner)


@router.post("", response_model=PartnerStats, status_code=201)
def create_partner(payload: PartnerCreate, db: Session = Depends(get_db)):
    partner = Partner(
        id=str(uuid.uuid4()),
        name=payload.name,
        type=payload.type,
        contact_person=payload.contact_person,
        phone=payload.phone,
        email=payload.email,
        branch_id=payload.branch_id,
        status=payload.status,
        notes=payload.notes,
        created_at=datetime.utcnow(),
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return _compute_stats(db, partner)


@router.put("/{partner_id}", response_model=PartnerStats)
def update_partner(partner_id: str, payload: PartnerUpdate, db: Session = Depends(get_db)):
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    data = payload.model_dump(exclude_unset=True)
    for key, val in data.items():
        setattr(partner, key, val)

    db.commit()
    db.refresh(partner)
    return _compute_stats(db, partner)


@router.delete("/{partner_id}", status_code=204)
def delete_partner(partner_id: str, db: Session = Depends(get_db)):
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    # Unlink any leads that reference this partner (don't delete the leads)
    db.query(Lead).filter(
        Lead.referred_by_partner_id == partner_id
    ).update({"referred_by_partner_id": None})

    db.delete(partner)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Quick-create lead from partner referral
# ---------------------------------------------------------------------------
@router.post("/{partner_id}/refer", status_code=201)
def create_referral_lead(
    partner_id: str,
    payload: dict,
    db: Session = Depends(get_db),
):
    """
    Convenience endpoint: creates a lead in 'potential' stage
    with source='Partner Referral' and the partner linked automatically.

    Expects body: { name, phone?, email?, event_type, event_date, guest_count?,
                    budget?, branch, assigned_to? }
    """
    from models import Remark
    from datetime import date as dt_date

    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    lead = Lead(
        id=str(uuid.uuid4()),
        name=payload.get("name", ""),
        phone=payload.get("phone", ""),
        email=payload.get("email", ""),
        event_type=payload.get("event_type", "Wedding"),
        event_date=payload.get("event_date", dt_date.today()),
        guest_count=int(payload.get("guest_count", 0)),
        budget=payload.get("budget", ""),
        branch=payload.get("branch", partner.branch_id or ""),
        source="Partner Referral",
        stage="potential",
        assigned_to=payload.get("assigned_to", ""),
        referred_by_partner_id=partner.id,
        created_at=datetime.utcnow(),
    )
    lead.remarks.append(
        Remark(
            text=f"Referred by partner: {partner.name} ({partner.type})",
            author="System",
            date=dt_date.today(),
            stage="potential",
        )
    )
    db.add(lead)
    db.commit()

    return {"id": lead.id, "stage": lead.stage, "partner": partner.name}
