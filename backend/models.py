import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base

# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------
import enum


class EventTypeEnum(str, enum.Enum):
    WEDDING = "Wedding"
    RECEPTION = "Reception"
    CORPORATE_EVENT = "Corporate Event"
    BIRTHDAY_PARTY = "Birthday Party"
    ANNIVERSARY = "Anniversary"
    ENGAGEMENT = "Engagement"
    CONFERENCE = "Conference"
    SOCIAL_GATHERING = "Social Gathering"


class SourceEnum(str, enum.Enum):
    WALK_IN = "Walk-in"
    WEBSITE = "Website"
    REFERRAL = "Referral"
    SOCIAL_MEDIA = "Social Media"
    GOOGLE_ADS = "Google Ads"
    WHATSAPP = "WhatsApp"
    PARTNER_REFERRAL = "Partner Referral"


class StageEnum(str, enum.Enum):
    POTENTIAL = "potential"
    NEW = "new"
    CALL = "call"
    VISIT = "visit"
    TASTING = "tasting"
    MENU = "menu"
    ADVANCE = "advance"
    DECOR = "decor"
    FULLPAY = "fullpay"
    POST = "post"
    FEEDBACK = "feedback"
    CONVERTED = "converted"
    LOST = "lost"


STAGE_ORDER = [
    "potential", "new", "call", "visit", "tasting", "menu",
    "advance", "decor", "fullpay", "post", "feedback",
]
TERMINAL_STAGES = {"converted", "lost"}


class DecorTypeEnum(str, enum.Enum):
    NONE = ""
    INTERNAL = "internal"
    EXTERNAL = "external"


class MenuCategoryEnum(str, enum.Enum):
    STARTERS = "Starters"
    SNACKS = "Snacks"
    INDIAN_CHAAT = "Indian Chaat"
    MAIN_COURSE = "Main Course"
    BREADS = "Breads"
    DESSERTS = "Desserts"
    BEVERAGES = "Beverages"


class PartnerStatusEnum(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class UserRoleEnum(str, enum.Enum):
    OWNER = "owner"
    BRANCH_MANAGER = "branch_manager"


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def gen_uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    """Application user — either an owner or a branch manager."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="branch_manager")  # "owner" | "branch_manager"
    branch_id = Column(String, ForeignKey("branches.id"), nullable=True)  # NULL for owner
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    branch = relationship("Branch", foreign_keys=[branch_id])


class Branch(Base):
    __tablename__ = "branches"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)

    halls = relationship("Hall", back_populates="branch", cascade="all, delete-orphan")


class Hall(Base):
    __tablename__ = "halls"

    id = Column(String, primary_key=True, default=gen_uuid)
    branch_id = Column(String, ForeignKey("branches.id"), nullable=False)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    event_types = Column(Text, default="")  # comma-separated
    cost_per_plate = Column(Float, default=0.0)

    branch = relationship("Branch", back_populates="halls")


class Contractor(Base):
    __tablename__ = "contractors"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    specialty = Column(String, default="")
    phone = Column(String, default="")


class Partner(Base):
    """
    External tie-up / referral partner (jewellery shops, wedding planners, etc.)
    that refers potential leads to the banquet business.
    """
    __tablename__ = "partners"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)          # e.g. "Jewellery Shop", "Wedding Planner"
    contact_person = Column(String, default="")
    phone = Column(String, default="")
    email = Column(String, default="")
    branch_id = Column(String, ForeignKey("branches.id"), nullable=True)
    status = Column(String, default="active")      # "active" | "inactive"
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    branch = relationship("Branch")
    referred_leads = relationship("Lead", back_populates="referred_by_partner", foreign_keys="Lead.referred_by_partner_id")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    phone = Column(String, default="")
    email = Column(String, default="")
    event_type = Column(String, nullable=False)
    event_date = Column(Date, nullable=False)
    guest_count = Column(Integer, default=0)
    budget = Column(String, default="")
    branch = Column(String, ForeignKey("branches.id"), nullable=False)
    source = Column(String, default="Walk-in")
    stage = Column(String, default="new")
    assigned_to = Column(String, default="")
    next_follow_up = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    selected_hall_id = Column(String, ForeignKey("halls.id"), nullable=True)

    # Partner referral link
    referred_by_partner_id = Column(String, ForeignKey("partners.id"), nullable=True)

    # Menu total (cached, recalculated on menu change)
    menu_total = Column(Float, default=0.0)
    food_preferences = Column(String, default="")
    allergies = Column(String, default="")

    # Advance
    advance_percent = Column(Integer, default=20)
    advance_paid = Column(Float, default=0.0)

    # Total cost (cached, recalculated)
    total_cost = Column(Float, default=0.0)

    # Inventory
    inventory_deducted = Column(Boolean, default=False)

    # Decor
    decor_type = Column(String, default="")
    decor_contractors = Column(Text, default="")  # comma-separated contractor IDs

    # Feedback
    feedback_positives = Column(Text, default="")
    feedback_negatives = Column(Text, default="")

    # Relationships
    selected_hall = relationship("Hall", foreign_keys=[selected_hall_id])
    referred_by_partner = relationship("Partner", back_populates="referred_leads", foreign_keys=[referred_by_partner_id])
    menu_items = relationship("MenuItem", back_populates="lead", cascade="all, delete-orphan")
    add_ons = relationship("AddOn", back_populates="lead", cascade="all, delete-orphan")
    remarks = relationship("Remark", back_populates="lead", cascade="all, delete-orphan", order_by="Remark.date")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(String, primary_key=True, default=gen_uuid)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    cost_per_plate = Column(Float, default=0.0)

    lead = relationship("Lead", back_populates="menu_items")
    ingredients = relationship("MenuItemIngredient", back_populates="menu_item", cascade="all, delete-orphan")


class AddOn(Base):
    __tablename__ = "add_ons"

    id = Column(String, primary_key=True, default=gen_uuid)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    desc = Column(String, default="")
    cost = Column(Float, default=0.0)

    lead = relationship("Lead", back_populates="add_ons")


class Remark(Base):
    __tablename__ = "remarks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    text = Column(Text, nullable=False)
    author = Column(String, default="")
    date = Column(Date, default=date.today)
    stage = Column(String, default="")

    lead = relationship("Lead", back_populates="remarks")


class MenuCatalogItem(Base):
    """Reference table: suggested menu items for the catalog endpoint."""
    __tablename__ = "menu_catalog"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    cost_per_plate = Column(Float, default=0.0)

    catalog_ingredients = relationship("CatalogIngredient", back_populates="catalog_item", cascade="all, delete-orphan")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False, unique=True)
    unit = Column(String, nullable=False)  # e.g., kg, liters, units
    quantity = Column(Float, default=0.0)
    low_stock_threshold = Column(Float, default=0.0)


class MenuItemIngredient(Base):
    __tablename__ = "menu_item_ingredients"

    id = Column(String, primary_key=True, default=gen_uuid)
    menu_item_id = Column(String, ForeignKey("menu_items.id"), nullable=False)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False)
    quantity_per_plate = Column(Float, default=0.0)

    menu_item = relationship("MenuItem", back_populates="ingredients")
    inventory_item = relationship("InventoryItem")


class CatalogIngredient(Base):
    __tablename__ = "catalog_ingredients"

    id = Column(String, primary_key=True, default=gen_uuid)
    catalog_item_id = Column(String, ForeignKey("menu_catalog.id"), nullable=False)
    inventory_item_id = Column(String, ForeignKey("inventory_items.id"), nullable=False)
    quantity_per_plate = Column(Float, default=0.0)

    catalog_item = relationship("MenuCatalogItem", back_populates="catalog_ingredients")
    inventory_item = relationship("InventoryItem")


class CallRecord(Base):
    __tablename__ = "call_records"

    id = Column(String, primary_key=True, default=gen_uuid)
    lead_id = Column(String, ForeignKey("leads.id"), nullable=False)
    twilio_sid = Column(String, nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, default=0)
    transcript = Column(Text, default="[]")
    analysis = Column(Text, default="{}")
    status = Column(String, default="in-progress")

    lead = relationship("Lead")
