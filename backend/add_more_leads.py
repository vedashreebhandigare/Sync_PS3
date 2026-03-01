import uuid
import random
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import (
    Branch,
    Hall,
    Lead,
    MenuItem,
    Remark,
)

def gen() -> str:
    return str(uuid.uuid4())

def add_leads():
    db: Session = SessionLocal()
    
    # Existing halls and branches
    halls = db.query(Hall).all()
    hall_map = {h.id: h for h in halls}
    branch_ids = [b.id for b in db.query(Branch).all()]
    
    assigned = ["Priya", "Amit", "Sneha", "Vikram"]
    sources = ["Website", "Referral", "Google Ads", "Social Media", "Walk-in", "Partner Referral", "WhatsApp"]
    stages = ["potential", "new", "call", "visit", "tasting", "menu", "advance", "decor", "fullpay", "post", "feedback", "converted", "lost"]
    events = ["Wedding", "Reception", "Corporate Event", "Engagement", "Birthday Party", "Anniversary", "Social Gathering", "Conference"]
    
    first_names = [
        "Aarav", "Vihaan", "Vivaan", "Ananya", "Diya", "Isha", "Riya", "Aisha",
        "Advik", "Reyansh", "Aryan", "Ayan", "Krishna", "Ishaan", "Shaurya",
        "Atharva", "Kavya", "Saanvi", "Aditi", "Avani", "Ishita", "Meera",
        "Nisha", "Pooja", "Rahul", "Rohan", "Sanjay", "Vikram", "Neha", "Kiran",
        "Arjun", "Karan", "Manish", "Deepa", "Ritu", "Sneha", "Kavita", "Suresh",
        "Rajesh", "Amit", "Priya", "Anjali", "Rakesh", "Gaurav", "Sunil", "Vivek",
        "Aditya", "Ishaan", "Saanvi", "Tanvi", "Kavya", "Pranav", "Sagar", "Mehul",
        "Siddharth", "Yash", "Kabir", "Arnav", "Ishani", "Anvi", "Aadhya", "Myra",
        "Kiaan", "Zoya", "Sara", "Zara", "Ayan", "Riaan", "Shanaya", "Inaya"
    ]
    
    last_names = [
        "Sharma", "Patel", "Reddy", "Singh", "Kapoor", "Agarwal", "Desai", "Joshi",
        "Mehta", "Nair", "Kulkarni", "Iyer", "Bhatia", "Shah", "Gupta", "Verma",
        "Rao", "Chauhan", "Malhotra", "Pandey", "Mishra", "Tiwari", "Yadav",
        "Goswami", "Dubey", "Raut", "Bose", "Ghosh", "Chatterjee", "Mukherjee"
    ]

    sample_menus = [
        [
            {"name": "Paneer Tikka", "category": "Starters", "cost_per_plate": 80},
            {"name": "Dal Makhani", "category": "Main Course", "cost_per_plate": 90},
            {"name": "Naan", "category": "Breads", "cost_per_plate": 20},
            {"name": "Gulab Jamun", "category": "Desserts", "cost_per_plate": 40},
        ],
        [
            {"name": "Hara Bhara Kabab", "category": "Starters", "cost_per_plate": 70},
            {"name": "Butter Chicken", "category": "Main Course", "cost_per_plate": 110},
            {"name": "Roti", "category": "Breads", "cost_per_plate": 15},
            {"name": "Kulfi", "category": "Desserts", "cost_per_plate": 50},
        ],
        [
            {"name": "Spring Rolls", "category": "Starters", "cost_per_plate": 60},
            {"name": "Veg Manchurian", "category": "Main Course", "cost_per_plate": 85},
            {"name": "Fried Rice", "category": "Breads", "cost_per_plate": 45},
            {"name": "Ice Cream", "category": "Desserts", "cost_per_plate": 30},
        ]
    ]

    new_leads = []
    today = date.today()
    
    print("Generating 150+ diverse leads...")
    
    for _ in range(160):
        # Name
        fn = random.choice(first_names)
        ln = random.choice(last_names)
        name = f"{fn} {ln}"
        
        # Branch & Hall
        branch_id = random.choice(branch_ids)
        branch_halls = [h for h in halls if h.branch_id == branch_id]
        hall = random.choice(branch_halls) if branch_halls else None
        
        # Phone & Email
        phone = f"98{random.randint(10000000, 99999999)}"
        email = f"{fn.lower()}.{ln.lower()}{random.randint(1,999)}@example.com"
        
        # Event details
        etype = random.choice(events)
        # Dates from -30 to +180 days
        days_offset = random.randint(-30, 200)
        edate = today + timedelta(days=days_offset)
        guests = random.randint(30, 800)
        
        # Stage distribution: 20% converted, 15% lost, others mixed
        r = random.random()
        if r < 0.20:
            stage = "converted"
        elif r < 0.35:
            stage = "lost"
        else:
            stage = random.choice(stages[:-2]) # exclude converted and lost
            
        source = random.choice(sources)
        assign = random.choice(assigned)
        
        # Revenue Calculation
        menu_items_data = random.choice(sample_menus)
        menu_total_per_plate = sum(mi["cost_per_plate"] for mi in menu_items_data)
        hall_cost_per_plate = hall.cost_per_plate if hall else 800.0
        
        total_per_plate = hall_cost_per_plate + menu_total_per_plate
        total_cost = total_per_plate * guests
        
        # Budget string
        budget = f"₹{total_cost:,.0f}"
        
        # Advance & Payments
        advance_paid = 0.0
        if stage in ["advance", "decor", "fullpay", "post", "feedback", "converted"]:
            if stage == "converted" or stage == "fullpay":
                advance_paid = total_cost
            else:
                advance_paid = total_cost * random.uniform(0.1, 0.4)
        
        lead_id = gen()
        
        # Create MenuItem objects
        menu_items = []
        for mi in menu_items_data:
            menu_items.append(MenuItem(id=gen(), lead_id=lead_id, **mi))
            
        # Remarks
        remark_text = "Lead created automatically."
        if stage == "converted":
            remark_text = "Client confirmed and paid full amount."
        elif stage == "lost":
            remark_text = "Client went with another venue due to better pricing."
        elif stage == "visit":
            remark_text = "Client visited the gallery and hall. Looks promising."

        lead = Lead(
            id=lead_id,
            name=name,
            phone=phone,
            email=email,
            event_type=etype,
            event_date=edate,
            guest_count=guests,
            budget=budget,
            branch=branch_id,
            source=source,
            stage=stage,
            assigned_to=assign,
            next_follow_up=today + timedelta(days=random.randint(1, 15)),
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            selected_hall_id=hall.id if hall else None,
            menu_total=menu_total_per_plate,
            total_cost=total_cost,
            advance_paid=advance_paid,
            feedback_positives="Very professional team" if stage in ["post", "feedback", "converted"] else "",
        )
        lead.menu_items = menu_items
        lead.remarks = [
            Remark(lead_id=lead_id, text=remark_text, author="System", date=today, stage=stage)
        ]
        
        new_leads.append(lead)

    db.add_all(new_leads)
    db.commit()
    print(f"Successfully added {len(new_leads)} leads to the database.")
    db.close()

if __name__ == "__main__":
    add_leads()
