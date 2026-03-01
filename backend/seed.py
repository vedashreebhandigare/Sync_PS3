import uuid
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from auth import hash_password
from database import SessionLocal, init_db
from models import (
    Branch,
    Contractor,
    Hall,
    Lead,
    MenuCatalogItem,
    MenuItem,
    InventoryItem,
    Partner,
    Remark,
    User,
)

# Menu-data seeding modules
from add_main_course import main as seed_main_course
from add_snacks import main as seed_snacks
from add_extras import main as seed_extras


def gen() -> str:
    return str(uuid.uuid4())


def seed():
    init_db()
    db: Session = SessionLocal()

    # Skip if data already exists
    if db.query(Branch).first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    # ------------------------------------------------------------------
    # Branches
    # ------------------------------------------------------------------
    branches = [
        Branch(id="branch-andheri", name="Andheri Branch"),
        Branch(id="branch-thane", name="Thane Branch"),
        Branch(id="branch-powai", name="Powai Branch"),
        Branch(id="branch-panvel", name="Panvel Branch"),
    ]
    db.add_all(branches)
    db.flush()

    # ------------------------------------------------------------------
    # Users (Owner + Branch Managers)
    # ------------------------------------------------------------------
    users = [
        User(
            id="user-owner",
            username="owner",
            password_hash=hash_password("owner123"),
            name="Rajiv Mehta",
            role="owner",
            branch_id=None,  # owner sees all
            is_active=True,
        ),
        User(
            id="user-mgr-andheri",
            username="andheri.mgr",
            password_hash=hash_password("andheri123"),
            name="Priya Sharma",
            role="branch_manager",
            branch_id="branch-andheri",
            is_active=True,
        ),
        User(
            id="user-mgr-thane",
            username="thane.mgr",
            password_hash=hash_password("thane123"),
            name="Amit Desai",
            role="branch_manager",
            branch_id="branch-thane",
            is_active=True,
        ),
        User(
            id="user-mgr-powai",
            username="powai.mgr",
            password_hash=hash_password("powai123"),
            name="Sneha Nair",
            role="branch_manager",
            branch_id="branch-powai",
            is_active=True,
        ),
        User(
            id="user-mgr-panvel",
            username="panvel.mgr",
            password_hash=hash_password("panvel123"),
            name="Vikram Joshi",
            role="branch_manager",
            branch_id="branch-panvel",
            is_active=True,
        ),
    ]
    db.add_all(users)
    db.flush()

    # ------------------------------------------------------------------
    # Halls (10 across branches)
    # ------------------------------------------------------------------
    halls = [
        Hall(id="hall-1", branch_id="branch-andheri", name="Grand Ballroom", location="Andheri West", capacity=500, event_types="Wedding,Reception,Corporate Event", cost_per_plate=1200.0),
        Hall(id="hall-2", branch_id="branch-andheri", name="Crystal Hall", location="Andheri East", capacity=200, event_types="Birthday Party,Anniversary,Engagement", cost_per_plate=800.0),
        Hall(id="hall-3", branch_id="branch-andheri", name="Garden Terrace", location="Andheri West", capacity=300, event_types="Wedding,Social Gathering", cost_per_plate=1000.0),
        Hall(id="hall-4", branch_id="branch-thane", name="Royal Banquet", location="Thane West", capacity=400, event_types="Wedding,Reception,Conference", cost_per_plate=1100.0),
        Hall(id="hall-5", branch_id="branch-thane", name="Silver Oak Hall", location="Thane East", capacity=150, event_types="Birthday Party,Corporate Event", cost_per_plate=750.0),
        Hall(id="hall-6", branch_id="branch-powai", name="Lakeside Pavilion", location="Powai", capacity=350, event_types="Wedding,Reception,Anniversary", cost_per_plate=1300.0),
        Hall(id="hall-7", branch_id="branch-powai", name="Ivory Room", location="Powai", capacity=100, event_types="Corporate Event,Conference,Engagement", cost_per_plate=900.0),
        Hall(id="hall-8", branch_id="branch-powai", name="Sunset Deck", location="Powai", capacity=250, event_types="Social Gathering,Birthday Party", cost_per_plate=850.0),
        Hall(id="hall-9", branch_id="branch-panvel", name="Emerald Hall", location="Panvel", capacity=600, event_types="Wedding,Reception", cost_per_plate=950.0),
        Hall(id="hall-10", branch_id="branch-panvel", name="Orchid Banquet", location="Panvel", capacity=200, event_types="Birthday Party,Anniversary,Corporate Event", cost_per_plate=700.0),
    ]
    db.add_all(halls)
    db.flush()

    contractors = [
        Contractor(id="cont-1", name="Raj Decorators", specialty="Floral & Stage", phone="9820000001"),
        Contractor(id="cont-2", name="Light Masters", specialty="Lighting & AV", phone="9820000002"),
        Contractor(id="cont-3", name="Shree Caterers", specialty="Live Counters", phone="9820000003"),
        Contractor(id="cont-4", name="DJ Sound Co.", specialty="Music & Entertainment", phone="9820000004"),
        Contractor(id="cont-5", name="Snap Studios", specialty="Photography & Video", phone="9820000005"),
    ]
    db.add_all(contractors)
    db.flush()

    # ------------------------------------------------------------------
    # Logistics Inventory
    # ------------------------------------------------------------------
    inventory = [
        InventoryItem(id=gen(), name="Potatoes", unit="kg", quantity=50.0, low_stock_threshold=10.0),
        InventoryItem(id=gen(), name="Mineral Water", unit="bottles", quantity=200.0, low_stock_threshold=50.0),
        InventoryItem(id=gen(), name="Coffee Beans", unit="kg", quantity=5.0, low_stock_threshold=2.0),
        InventoryItem(id=gen(), name="Milk", unit="liters", quantity=20.0, low_stock_threshold=5.0),
        InventoryItem(id=gen(), name="Tomatoes", unit="kg", quantity=30.0, low_stock_threshold=10.0),
    ]
    db.add_all(inventory)
    db.flush()

    # ------------------------------------------------------------------
    # Partners (Lead Generation tie-ups)
    # ------------------------------------------------------------------
    partners = [
        Partner(
            id="partner-1",
            name="Rajesh Jewellers",
            type="Jewellery Shop",
            contact_person="Rajesh Kumar",
            phone="+91 98765 43210",
            email="rajesh@jewellers.com",
            branch_id="branch-andheri",
            status="active",
            notes="Long-standing tie-up. Refers wedding clients regularly.",
            created_at=datetime.utcnow() - timedelta(days=180),
        ),
        Partner(
            id="partner-2",
            name="Sharma Wedding Planners",
            type="Wedding Planner",
            contact_person="Priya Sharma",
            phone="+91 87654 32109",
            email="priya@sharmaweddings.com",
            branch_id=None,
            status="active",
            notes="Premium wedding planner. High conversion rate.",
            created_at=datetime.utcnow() - timedelta(days=120),
        ),
        Partner(
            id="partner-3",
            name="Mehta Saree House",
            type="Clothing Store",
            contact_person="Anita Mehta",
            phone="+91 76543 21098",
            email="anita@mehtasarees.com",
            branch_id="branch-thane",
            status="active",
            notes="Refers engagement and wedding clients from Thane area.",
            created_at=datetime.utcnow() - timedelta(days=90),
        ),
        Partner(
            id="partner-4",
            name="Patel Caterers",
            type="Catering Partner",
            contact_person="Suresh Patel",
            phone="+91 65432 10987",
            email="suresh@patelcaterers.com",
            branch_id="branch-panvel",
            status="inactive",
            notes="Paused collaboration. May resume next quarter.",
            created_at=datetime.utcnow() - timedelta(days=200),
        ),
        Partner(
            id="partner-5",
            name="Kapoor Photography Studio",
            type="Photography Studio",
            contact_person="Arjun Kapoor",
            phone="+91 99887 76655",
            email="arjun@kapoorstudio.com",
            branch_id="branch-powai",
            status="active",
            notes="Wedding photographer who recommends our venues to clients.",
            created_at=datetime.utcnow() - timedelta(days=60),
        ),
    ]
    db.add_all(partners)
    db.flush()

    # ------------------------------------------------------------------
    # Menu Catalog + Ingredients (via dedicated seeding modules)
    # ------------------------------------------------------------------
    # Commit base data first so the add_* modules can query inventory, etc.
    db.commit()
    db.close()

    print("Seeding menu catalog: Main Course items...")
    seed_main_course()

    print("Seeding menu catalog: Snacks & Chaat items...")
    seed_snacks()

    print("Seeding menu catalog: Extras (starters, breads, desserts, beverages)...")
    seed_extras()

    # Re-open session for leads seeding below
    db = SessionLocal()

    # ------------------------------------------------------------------
    # Sample Leads (14: original 12 + 2 potential leads from partners)
    # ------------------------------------------------------------------
    today = date.today()

    def _lead(
        name, phone, email, etype, edate, guests, budget, branch_id, source,
        stage, assigned, hall_id=None, menu_items=None, advance_paid=0.0,
        decor_type="", decor_contractors="", remarks_text=None,
        feedback_pos="", feedback_neg="", referred_by_partner_id=None,
    ):
        lead_id = gen()
        menu = []
        menu_total = 0.0
        if menu_items:
            for mi in menu_items:
                m = MenuItem(id=gen(), lead_id=lead_id, **mi)
                menu.append(m)
                menu_total += mi["cost_per_plate"]

        total_cost = menu_total * guests

        lead = Lead(
            id=lead_id, name=name, phone=phone, email=email,
            event_type=etype, event_date=edate, guest_count=guests,
            budget=budget, branch=branch_id, source=source, stage=stage,
            assigned_to=assigned, next_follow_up=today + timedelta(days=3),
            created_at=datetime.utcnow(),
            selected_hall_id=hall_id,
            menu_total=menu_total, total_cost=total_cost,
            advance_paid=advance_paid,
            decor_type=decor_type, decor_contractors=decor_contractors,
            feedback_positives=feedback_pos, feedback_negatives=feedback_neg,
            referred_by_partner_id=referred_by_partner_id,
        )
        lead.menu_items = menu
        lead.remarks = [
            Remark(lead_id=lead_id, text=remarks_text or "Lead created.", author="System", date=today, stage=stage)
        ]
        return lead

    sample_menu = [
        {"name": "Paneer Tikka", "category": "Starters", "cost_per_plate": 80},
        {"name": "Dal Makhani", "category": "Main Course", "cost_per_plate": 90},
        {"name": "Naan", "category": "Breads", "cost_per_plate": 20},
        {"name": "Gulab Jamun", "category": "Desserts", "cost_per_plate": 40},
    ]

    leads = [
        _lead("Sanjay Kapoor", "9876543230", "sanjay@example.com", "Wedding",
              today + timedelta(days=70), 350, "₹9,00,000", "branch-andheri",
              "Partner Referral", "potential", "",
              remarks_text="Referred by partner: Rajesh Jewellers (Jewellery Shop)",
              referred_by_partner_id="partner-1"),
        _lead("Meena Agarwal", "9876543231", "meena@example.com", "Engagement",
              today + timedelta(days=40), 200, "₹4,00,000", "branch-thane",
              "Partner Referral", "potential", "",
              remarks_text="Referred by partner: Mehta Saree House (Clothing Store)",
              referred_by_partner_id="partner-3"),
        _lead("Aarav Sharma", "9876543210", "aarav@example.com", "Wedding",
              today + timedelta(days=45), 300, "₹5,00,000", "branch-andheri",
              "Referral", "new", "Priya"),
        _lead("Neha Patel", "9876543211", "neha@example.com", "Corporate Event",
              today + timedelta(days=20), 100, "₹2,00,000", "branch-thane",
              "Website", "call", "Amit"),
        _lead("Rohan Desai", "9876543212", "rohan@example.com", "Reception",
              today + timedelta(days=60), 400, "₹8,00,000", "branch-powai",
              "Google Ads", "visit", "Priya", hall_id="hall-6"),
        _lead("Priya Kulkarni", "9876543213", "priyak@example.com", "Engagement",
              today + timedelta(days=30), 150, "₹3,00,000", "branch-andheri",
              "Walk-in", "tasting", "Amit", hall_id="hall-2", menu_items=sample_menu),
        _lead("Vikram Joshi", "9876543214", "vikram@example.com", "Birthday Party",
              today + timedelta(days=15), 80, "₹1,50,000", "branch-panvel",
              "Social Media", "menu", "Sneha", hall_id="hall-10", menu_items=sample_menu),
        _lead("Anita Mehta", "9876543215", "anita@example.com", "Wedding",
              today + timedelta(days=90), 500, "₹12,00,000", "branch-andheri",
              "Referral", "advance", "Priya", hall_id="hall-1", menu_items=sample_menu,
              advance_paid=50000.0),
        _lead("Suresh Nair", "9876543216", "suresh@example.com", "Anniversary",
              today + timedelta(days=25), 120, "₹2,50,000", "branch-powai",
              "WhatsApp", "decor", "Amit", hall_id="hall-8", menu_items=sample_menu,
              advance_paid=30000.0, decor_type="internal", decor_contractors="cont-1,cont-2"),
        _lead("Kavita Reddy", "9876543217", "kavita@example.com", "Conference",
              today + timedelta(days=10), 200, "₹4,00,000", "branch-thane",
              "Google Ads", "fullpay", "Sneha", hall_id="hall-4", menu_items=sample_menu,
              advance_paid=92000.0),
        _lead("Rahul Verma", "9876543218", "rahul@example.com", "Social Gathering",
              today + timedelta(days=5), 250, "₹6,00,000", "branch-panvel",
              "Website", "post", "Priya", hall_id="hall-9", menu_items=sample_menu,
              advance_paid=57500.0),
        _lead("Deepa Iyer", "9876543219", "deepa@example.com", "Wedding",
              today + timedelta(days=3), 350, "₹7,00,000", "branch-andheri",
              "Walk-in", "feedback", "Amit", hall_id="hall-3", menu_items=sample_menu,
              advance_paid=80500.0, feedback_pos="Great food", feedback_neg="Parking was tight"),
        _lead("Ritu Bhatia", "9876543232", "ritu@example.com", "Wedding",
              today - timedelta(days=5), 280, "₹6,50,000", "branch-andheri",
              "Partner Referral", "converted", "Priya", hall_id="hall-1", menu_items=sample_menu,
              advance_paid=64400.0, remarks_text="Referred by Rajesh Jewellers. Successfully converted.",
              referred_by_partner_id="partner-1"),
        _lead("Karan Shah", "9876543233", "karan@example.com", "Reception",
              today + timedelta(days=35), 180, "₹3,50,000", "branch-powai",
              "Partner Referral", "call", "Amit",
              remarks_text="Referred by Kapoor Photography Studio.",
              referred_by_partner_id="partner-5"),
        _lead("Manish Gupta", "9876543220", "manish@example.com", "Reception",
              today - timedelta(days=10), 200, "₹4,50,000", "branch-thane",
              "Social Media", "converted", "Sneha", hall_id="hall-5", menu_items=sample_menu,
              advance_paid=46000.0, remarks_text="Successfully converted."),
        _lead("Pooja Singh", "9876543221", "pooja@example.com", "Engagement",
              today + timedelta(days=50), 100, "₹1,80,000", "branch-powai",
              "Referral", "lost", "Priya",
              remarks_text="Client chose competitor venue."),
    ]
    db.add_all(leads)
    db.commit()

    # Count total menu items seeded across all modules
    total_menu_items = db.query(MenuCatalogItem).count()
    db.close()
    print(f"Seeded: 4 branches, {len(users)} users, 10 halls, 5 contractors, 5 partners, {total_menu_items} menu items (with ingredients), {len(leads)} leads.")


if __name__ == "__main__":
    seed()
