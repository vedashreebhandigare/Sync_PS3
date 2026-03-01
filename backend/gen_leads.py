import random
from datetime import timedelta
import sys
import codecs

branches = ["branch-andheri", "branch-thane", "branch-powai", "branch-panvel"]
sources = ["Website", "Referral", "Google Ads", "Social Media", "Walk-in", "Partner Referral", "WhatsApp"]
stages_active = ["new", "call", "visit", "tasting", "menu", "advance", "decor", "fullpay", "post"]
# some completed/missed:
stages_end = ["converted", "lost", "feedback", "potential"]

stages_all = stages_active * 3 + stages_end * 2

events = ["Wedding", "Reception", "Corporate Event", "Engagement", "Birthday Party", "Anniversary", "Social Gathering", "Conference"]
assigned = ["Priya", "Amit", "Sneha", "Vikram"]

halls = {
    "branch-andheri": ["hall-1", "hall-2", "hall-3", None],
    "branch-thane": ["hall-4", "hall-5", None],
    "branch-powai": ["hall-6", "hall-7", "hall-8", None],
    "branch-panvel": ["hall-9", "hall-10", None]
}

first_names = [
    "Aarav", "Vihaan", "Vivaan", "Ananya", "Diya", "Isha", "Riya", "Aisha",
    "Advik", "Reyansh", "Aryan", "Ayan", "Krishna", "Ishaan", "Shaurya",
    "Atharva", "Kavya", "Saanvi", "Aditi", "Avani", "Ishita", "Meera",
    "Nisha", "Pooja", "Rahul", "Rohan", "Sanjay", "Vikram", "Neha", "Kiran",
    "Arjun", "Karan", "Manish", "Deepa", "Ritu", "Sneha", "Kavita", "Suresh",
    "Rajesh", "Amit", "Priya", "Anjali", "Rakesh", "Gaurav", "Sunil", "Vivek"
]

last_names = [
    "Sharma", "Patel", "Reddy", "Singh", "Kapoor", "Agarwal", "Desai", "Joshi",
    "Mehta", "Nair", "Kulkarni", "Iyer", "Bhatia", "Shah", "Gupta", "Verma",
    "Rao", "Chauhan", "Malhotra", "Pandey", "Mishra", "Tiwari", "Yadav"
]

out = []

for i in range(50):
    fn = random.choice(first_names)
    ln = random.choice(last_names)
    name = f"{fn} {ln}"
    phone = f"98{random.randint(10000000, 99999999)}"
    email = f"{fn.lower()}.{ln.lower()}{random.randint(1,99)}@example.com"
    etype = random.choice(events)
    guests = random.randint(50, 600)
    budget = f"₹{guests * random.randint(1000, 2500):,}"
    branch = random.choice(branches)
    source = random.choice(sources)
    
    stage = random.choice(stages_all)
    assign = random.choice(assigned)
    
    days_offset = random.randint(-20, 150)
    edate_str = f"today {'+' if days_offset >= 0 else '-'} timedelta(days={abs(days_offset)})"
    
    hall_id = random.choice(halls[branch])
    
    extra = []
    if hall_id:
        extra.append(f"hall_id=\"{hall_id}\"")
        if random.random() > 0.5:
            extra.append("menu_items=sample_menu")
            if stage in ["advance", "decor", "fullpay", "post", "feedback", "converted"]:
                adv = guests * random.choice([500, 1000, 1500])
                extra.append(f"advance_paid={adv:.1f}")

    if stage == "converted":
        extra.append('remarks_text="Successfully converted."')
    elif stage == "lost":
        extra.append('remarks_text="Missed / Lost to competitor."')
    elif stage == "feedback":
        extra.append('feedback_pos="Awesome venue"')
        if random.random() > 0.5:
            extra.append('feedback_neg="Need better AC"')
            
    if source == "Partner Referral":
        p_ids = ["partner-1", "partner-2", "partner-3", "partner-4", "partner-5"]
        p_id = random.choice(p_ids)
        extra.append(f'referred_by_partner_id="{p_id}"')
        
    extra_str = ", ".join(extra)
    if extra_str:
        extra_str = ", " + extra_str

    line = f"""        _lead("{name}", "{phone}", "{email}", "{etype}",
              {edate_str}, {guests}, "{budget}", "{branch}",
              "{source}", "{stage}", "{assign}"{extra_str}),"""
    out.append(line)

with codecs.open("leads_gen.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
