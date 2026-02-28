import uuid
from datetime import date, datetime

from sqlalchemy import (
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


class StageEnum(str, enum.Enum):
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
    "new", "call", "visit", "tasting", "menu",
    "advance", "decor", "fullpay", "post", "feedback",
]
TERMINAL_STAGES = {"converted", "lost"}


class DecorTypeEnum(str, enum.Enum):
    NONE = ""
    INTERNAL = "internal"
    EXTERNAL = "external"


class MenuCategoryEnum(str, enum.Enum):
    STARTERS = "Starters"
    MAIN_COURSE = "Main Course"
    BREADS = "Breads"
    DESSERTS = "Desserts"
    BEVERAGES = "Beverages"


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------
def gen_uuid() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
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

    # Menu total (cached, recalculated on menu change)
    menu_total = Column(Float, default=0.0)
    food_preferences = Column(String, default="")
    allergies = Column(String, default="")

    # Advance
    advance_percent = Column(Integer, default=20)
    advance_paid = Column(Float, default=0.0)

    # Total cost (cached, recalculated)
    total_cost = Column(Float, default=0.0)

    # Decor
    decor_type = Column(String, default="")
    decor_contractors = Column(Text, default="")  # comma-separated contractor IDs

    # Feedback
    feedback_positives = Column(Text, default="")
    feedback_negatives = Column(Text, default="")

    # Relationships
    selected_hall = relationship("Hall", foreign_keys=[selected_hall_id])
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
