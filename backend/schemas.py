from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Branch / Hall
# ---------------------------------------------------------------------------
class BranchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str


class HallOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    branch_id: str
    name: str
    location: str
    capacity: int
    event_types: str  # comma-separated; frontend splits
    cost_per_plate: float


# ---------------------------------------------------------------------------
# Contractor
# ---------------------------------------------------------------------------
class ContractorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    specialty: str
    phone: str


# ---------------------------------------------------------------------------
# Menu Catalog
# ---------------------------------------------------------------------------
class MenuCatalogItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: str
    cost_per_plate: float


# ---------------------------------------------------------------------------
# Lead sub-resources
# ---------------------------------------------------------------------------
class MenuItemIn(BaseModel):
    name: str
    category: str
    cost_per_plate: float


class MenuItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: str
    cost_per_plate: float


class AddOnIn(BaseModel):
    desc: str
    cost: float


class AddOnOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    desc: str
    cost: float


class RemarkIn(BaseModel):
    text: str
    author: str = ""


class RemarkOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    text: str
    author: str
    date: date
    stage: str


# ---------------------------------------------------------------------------
# Lead
# ---------------------------------------------------------------------------
class LeadCreate(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    event_type: str
    event_date: date
    guest_count: int = 0
    budget: str = ""
    branch: str
    source: str = "Walk-in"
    assigned_to: str = ""
    next_follow_up: Optional[date] = None
    food_preferences: str = ""
    allergies: str = ""
    advance_percent: int = 20


class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[date] = None
    guest_count: Optional[int] = None
    budget: Optional[str] = None
    branch: Optional[str] = None
    source: Optional[str] = None
    assigned_to: Optional[str] = None
    next_follow_up: Optional[date] = None
    food_preferences: Optional[str] = None
    allergies: Optional[str] = None
    advance_percent: Optional[int] = None
    advance_paid: Optional[float] = None
    decor_type: Optional[str] = None
    decor_contractors: Optional[str] = None
    feedback_positives: Optional[str] = None
    feedback_negatives: Optional[str] = None


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    phone: str
    email: str
    event_type: str
    event_date: date
    guest_count: int
    budget: str
    branch: str
    source: str
    stage: str
    assigned_to: str
    next_follow_up: Optional[date]
    created_at: datetime

    selected_hall_id: Optional[str]
    menu_total: float
    food_preferences: str
    allergies: str
    advance_percent: int
    advance_paid: float
    total_cost: float

    decor_type: str
    decor_contractors: str

    feedback_positives: str
    feedback_negatives: str

    menu_items: list[MenuItemOut] = []
    add_ons: list[AddOnOut] = []
    remarks: list[RemarkOut] = []


class LeadBrief(BaseModel):
    """Lighter version for list views."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    phone: str
    email: str
    event_type: str
    event_date: date
    guest_count: int
    budget: str
    branch: str
    source: str
    stage: str
    assigned_to: str
    next_follow_up: Optional[date]
    created_at: datetime
    total_cost: float
    advance_paid: float


# ---------------------------------------------------------------------------
# Stage change
# ---------------------------------------------------------------------------
class StageChange(BaseModel):
    stage: str


# ---------------------------------------------------------------------------
# Hall selection
# ---------------------------------------------------------------------------
class HallSelect(BaseModel):
    hall_id: str


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------
class PipelineCount(BaseModel):
    stage: str
    count: int


class SummaryStats(BaseModel):
    new: int
    active: int
    converted: int
    lost: int
