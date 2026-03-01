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
# Partner (Lead Generation)
# ---------------------------------------------------------------------------
class PartnerCreate(BaseModel):
    name: str
    type: str
    contact_person: str = ""
    phone: str = ""
    email: str = ""
    branch_id: Optional[str] = None
    status: str = "active"
    notes: str = ""


class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    branch_id: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PartnerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    contact_person: str
    phone: str
    email: str
    branch_id: Optional[str]
    status: str
    notes: str
    created_at: datetime


class PartnerStats(BaseModel):
    """Partner record enriched with computed referral statistics."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    type: str
    contact_person: str
    phone: str
    email: str
    branch_id: Optional[str]
    status: str
    notes: str
    created_at: datetime

    # Computed fields (not from ORM directly)
    leads_referred: int = 0
    leads_converted: int = 0
    conversion_rate: float = 0.0


# ---------------------------------------------------------------------------
# Menu Catalog
# ---------------------------------------------------------------------------
class CatalogIngredientIn(BaseModel):
    inventory_item_id: str
    quantity_per_plate: float


class CatalogIngredientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    catalog_item_id: str
    inventory_item_id: str
    quantity_per_plate: float
    inventory_item: Optional["InventoryItemOut"] = None


class MenuCatalogItemIn(BaseModel):
    name: str
    category: str
    cost_per_plate: float
    catalog_ingredients: list[CatalogIngredientIn] = []


class MenuCatalogItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: str
    cost_per_plate: float
    catalog_ingredients: list[CatalogIngredientOut] = []

# ---------------------------------------------------------------------------
# Inventory and Ingredients
# ---------------------------------------------------------------------------
class InventoryItemIn(BaseModel):
    name: str
    unit: str
    quantity: float = 0.0
    low_stock_threshold: float = 0.0


class InventoryItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    unit: str
    quantity: float
    low_stock_threshold: float


class MenuItemIngredientIn(BaseModel):
    inventory_item_id: str
    quantity_per_plate: float


class MenuItemIngredientOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    menu_item_id: str
    inventory_item_id: str
    quantity_per_plate: float
    inventory_item: Optional[InventoryItemOut] = None


# ---------------------------------------------------------------------------
# Lead sub-resources
# ---------------------------------------------------------------------------
class MenuItemIn(BaseModel):
    name: str
    category: str
    cost_per_plate: float
    ingredients: list[MenuItemIngredientIn] = []


class MenuItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: str
    cost_per_plate: float
    ingredients: list[MenuItemIngredientOut] = []


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
    referred_by_partner_id: Optional[str] = None


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
    referred_by_partner_id: Optional[str] = None


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
    referred_by_partner_id: Optional[str]

    menu_total: float
    food_preferences: str
    allergies: str
    advance_percent: int
    advance_paid: float
    total_cost: float
    inventory_deducted: bool

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
    referred_by_partner_id: Optional[str]


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
    potential: int = 0


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------
class HallUtilization(BaseModel):
    hall_id: str
    hall_name: str
    times_booked: int


class BranchPerformance(BaseModel):
    branch_id: str
    branch_name: str
    total_leads: int
    converted_leads: int
    rejected_leads: int
    conversion_rate: float
    total_revenue: float
    overall_performance_score: float
    hall_utilization: list[HallUtilization]


class SourcePerformance(BaseModel):
    source: str
    total_leads: int
    converted_leads: int
    conversion_rate: float
    total_revenue: float


# ---------------------------------------------------------------------------
# Call Coaching
# ---------------------------------------------------------------------------
class CallInitiateRequest(BaseModel):
    phone_number: str


class CallRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    lead_id: str
    twilio_sid: Optional[str]
    start_time: datetime
    end_time: Optional[datetime]
    duration_seconds: int
    transcript: str   # JSON string
    analysis: str     # JSON string
    status: str
