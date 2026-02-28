"""
Calendar events endpoint — aggregates leads + follow-ups into calendar-ready data.
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Lead, Hall

router = APIRouter(prefix="/api/calendar", tags=["calendar"])


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
class CalendarEvent(BaseModel):
    id: str
    title: str
    hall_id: Optional[str] = None
    hall_name: Optional[str] = None
    branch_id: str
    date: date
    event_type: str
    guest_count: int
    stage: str
    status: str  # "available" | "tentative" | "confirmed" | "done"
    advance_paid: float
    total_cost: float
    customer_name: str
    type: str  # "booking" | "follow_up"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
TENTATIVE_STAGES = {"new", "call", "visit", "tasting", "menu"}
CONFIRMED_STAGES = {"advance", "decor", "fullpay", "converted"}
DONE_STAGES = {"post", "feedback"}


def _get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _status(stage: str, event_date: date) -> str:
    today = date.today()
    if event_date <= today and stage not in {"lost"}:
        return "done"
    if stage in TENTATIVE_STAGES:
        return "tentative"
    if stage in CONFIRMED_STAGES:
        return "confirmed"
    if stage in DONE_STAGES:
        return "done"
    return "tentative"


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------
@router.get("/events", response_model=list[CalendarEvent])
def get_calendar_events(
    start_date: date = Query(...),
    end_date: date = Query(...),
    branch_id: Optional[str] = Query(None),
    hall_id: Optional[str] = Query(None),
    db: Session = Depends(_get_db),
):
    # Build hall lookup
    halls = {h.id: h for h in db.query(Hall).all()}

    # Query leads in date range
    q = db.query(Lead).filter(
        Lead.stage != "lost",
    )
    if branch_id:
        q = q.filter(Lead.branch == branch_id)
    if hall_id:
        q = q.filter(Lead.selected_hall_id == hall_id)

    leads = q.all()
    events: list[CalendarEvent] = []

    for lead in leads:
        # Booking event (on event_date)
        if lead.event_date and start_date <= lead.event_date <= end_date:
            hall = halls.get(lead.selected_hall_id) if lead.selected_hall_id else None
            events.append(CalendarEvent(
                id=lead.id,
                title=f"{lead.name} — {lead.event_type}",
                hall_id=lead.selected_hall_id,
                hall_name=hall.name if hall else None,
                branch_id=lead.branch,
                date=lead.event_date,
                event_type=lead.event_type,
                guest_count=lead.guest_count,
                stage=lead.stage,
                status=_status(lead.stage, lead.event_date),
                advance_paid=lead.advance_paid,
                total_cost=lead.total_cost,
                customer_name=lead.name,
                type="booking",
            ))

        # Follow-up event (on next_follow_up)
        if lead.next_follow_up and start_date <= lead.next_follow_up <= end_date:
            events.append(CalendarEvent(
                id=f"{lead.id}-followup",
                title=f"Follow-up: {lead.name}",
                hall_id=None,
                hall_name=None,
                branch_id=lead.branch,
                date=lead.next_follow_up,
                event_type=lead.event_type,
                guest_count=lead.guest_count,
                stage=lead.stage,
                status="tentative",
                advance_paid=lead.advance_paid,
                total_cost=lead.total_cost,
                customer_name=lead.name,
                type="follow_up",
            ))

    # Sort by date
    events.sort(key=lambda e: e.date)
    return events


# ---------------------------------------------------------------------------
# Summary endpoint (for the Overview dashboard)
# ---------------------------------------------------------------------------
class CalendarSummary(BaseModel):
    today_events: int
    upcoming_7_days: int
    tentative_holds: int
    pending_followups: int


@router.get("/summary", response_model=CalendarSummary)
def get_calendar_summary(db: Session = Depends(_get_db)):
    from datetime import timedelta
    today = date.today()
    week_end = today + timedelta(days=7)

    leads = db.query(Lead).filter(Lead.stage != "lost").all()

    today_events = sum(1 for l in leads if l.event_date == today)
    upcoming_7_days = sum(
        1 for l in leads
        if l.event_date and today < l.event_date <= week_end
        and l.stage in CONFIRMED_STAGES
    )
    tentative_holds = sum(
        1 for l in leads
        if l.stage in TENTATIVE_STAGES and l.event_date and l.event_date >= today
    )
    pending_followups = sum(1 for l in leads if l.next_follow_up == today)

    return CalendarSummary(
        today_events=today_events,
        upcoming_7_days=upcoming_7_days,
        tentative_holds=tentative_holds,
        pending_followups=pending_followups,
    )
