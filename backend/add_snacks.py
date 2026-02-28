import uuid
import re
from database import SessionLocal
from models import MenuCatalogItem, InventoryItem, CatalogIngredient

RAW_TEXT = """
PART 3 – SNACKS (All Items – 1 Plate Each)
1️⃣ Achari Paneer Tikka (6–8 pieces)
Paneer – 120 g
Thick curd – 50 g
Mustard oil – 15 ml
Pickle masala – 10 g
Ginger garlic paste – 5 g
Red chilli powder – 2 g
Turmeric – 1 g
Coriander powder – 2 g
Garam masala – 1 g
Ajwain – 1 g
Kasuri methi – 1 g
Salt – 2 g
Capsicum – 40 g
Onion – 40 g
Lemon juice – 5 ml
Chaat masala – 1 g

2️⃣ Haryali Paneer Tikka
Paneer – 120 g
Thick curd – 50 g
Mint leaves – 15 g
Coriander leaves – 20 g
Green chilli – 5 g
Ginger – 2 g
Garlic – 2 g
Lemon juice – 5 ml
Cumin powder – 1 g
Chaat masala – 1 g
Garam masala – 1 g
Salt – 2 g
Oil – 5 ml

3️⃣ Tandoori Mushroom
Button mushroom – 150 g
Thick curd – 50 g
Ginger garlic paste – 5 g
Red chilli powder – 2 g
Turmeric – 1 g
Garam masala – 1 g
Lemon juice – 5 ml
Mustard oil – 15 ml
Salt – 2 g

4️⃣ Vegetable Cutlet (2 pcs)
Boiled potato – 150 g
Carrot – 40 g
Beans – 30 g
Peas – 30 g
Bread crumbs – 30 g
Ginger – 2 g
Green chilli – 2 g
Garam masala – 1 g
Red chilli powder – 1 g
Salt – 2 g
Cornflour – 10 g
Oil – 100 ml

5️⃣ Cheese Balls (6 pcs)
Boiled potato – 150 g
Mozzarella cheese – 60 g
Cornflour – 10 g
Bread crumbs – 40 g
Black pepper – 1 g
Salt – 1 g
Oil – 200 ml

6️⃣ Hara Bhara Kabab (4 pcs)
Spinach – 80 g
Boiled potato – 100 g
Green peas – 50 g
Ginger – 2 g
Green chilli – 2 g
Cumin powder – 1 g
Garam masala – 1 g
Cornflour – 10 g
Salt – 2 g
Oil – 30 ml

7️⃣ Soya Malai Chaap
Soya chaap – 150 g
Fresh cream – 30 ml
Thick curd – 40 g
Ginger garlic paste – 5 g
White pepper – 1 g
Cardamom powder – 1 g
Oil – 15 ml
Salt – 2 g
Butter – 5 g

8️⃣ Veg Manchurian (Dry)
Cabbage – 80 g
Carrot – 60 g
Capsicum – 40 g
Cornflour – 30 g
Maida – 10 g
Ginger garlic – 5 g
Soya sauce – 5 ml
Vinegar – 5 ml
Black pepper – 2 g
Salt – 2 g
Oil – 250 ml

9️⃣ Veg Salt & Pepper
Mixed vegetables – 200 g
Cornflour – 10 g
Garlic – 5 g
Crushed black pepper – 5 g
Soya sauce – 5 ml
Salt – 2 g
Oil – 30 ml

🔟 French Fries
Potato – 300 g
Salt – 2 g
Oil – 500 ml
Chaat masala – 1 g

1️⃣1️⃣ Chilli Honey Potato
Potato – 250 g
Cornflour – 20 g
Garlic – 5 g
Honey – 15 g
Red chilli sauce – 15 ml
Soya sauce – 5 ml
Vinegar – 2 ml
Sesame seeds – 2 g
Oil – 300 ml

1️⃣2️⃣ Spring Roll (2 pcs)
Spring roll sheets – 2 pcs
Cabbage – 60 g
Carrot – 50 g
Capsicum – 40 g
Noodles – 50 g
Ginger garlic – 5 g
Soya sauce – 5 ml
Vinegar – 2 ml
Black pepper – 1 g
Salt – 2 g
Cornflour slurry – 10 g
Oil – 400 ml


PART 4 – INDIAN CHAAT (All Items – 1 Plate Each)
1️⃣ Golgappa (6 pcs)
Golgappa puri – 6 pcs
Mint leaves – 20 g
Coriander leaves – 20 g
Green chilli – 5 g
Ginger – 2 g
Tamarind pulp – 15 g
Roasted cumin powder – 1 g
Black salt – 1 g
Chaat masala – 1 g
Salt – 1 g
Cold water – 200 ml
Boiled potato – 100 g
Boiled black chana – 40 g
Red chilli powder – 1 g

2️⃣ Bhalla Papdi Chaat
Urad dal – 60 g
Ginger – 1 g
Green chilli – 1 g
Salt – 1 g
Oil – 300 ml
Papdi – 6 pcs
Thick curd – 150 g
Tamarind chutney – 30 g
Green chutney – 15 g
Roasted cumin powder – 1 g
Red chilli powder – 1 g
Chaat masala – 1 g
Sev – 20 g
Pomegranate – 30 g

3️⃣ Aloo Tikki (2 pcs)
Boiled potato – 200 g
Cornflour – 10 g
Ginger – 2 g
Green chilli – 2 g
Red chilli powder – 1 g
Garam masala – 1 g
Salt – 2 g
Oil – 45 ml

4️⃣ Pav Bhaji
Boiled potato – 200 g
Cauliflower – 80 g
Peas – 50 g
Capsicum – 50 g
Tomato – 150 g
Onion – 100 g
Ginger garlic paste – 5 g
Pav bhaji masala – 5 g
Red chilli powder – 2 g
Turmeric – 1 g
Butter – 30 g
Salt – 2 g
Lemon – 1 pc
Fresh coriander – 5 g
Pav – 2 pcs

5️⃣ Moong Dal Chilla (2 pcs)
Moong dal – 100 g
Ginger – 2 g
Green chilli – 2 g
Cumin seeds – 1 g
Hing – 1 g
Salt – 2 g
Oil – 30 ml

6️⃣ Mutter Pattice
Boiled potato – 150 g
Boiled peas – 100 g
Ginger – 2 g
Green chilli – 2 g
Red chilli powder – 1 g
Garam masala – 1 g
Salt – 2 g
Oil – 45 ml

7️⃣ Aloo on Tawa
Boiled potato cubes – 250 g
Oil – 30 ml
Cumin seeds – 1 g
Red chilli powder – 2 g
Coriander powder – 2 g
Turmeric – 1 g
Chaat masala – 1 g
Salt – 2 g
Lemon juice – 5 ml

8️⃣ Chole Kulche
Kabuli chana – 200 g
Onion – 80 g
Tomato – 120 g
Ginger garlic paste – 5 g
Chole masala – 5 g
Red chilli powder – 2 g
Turmeric – 1 g
Cumin seeds – 1 g
Oil – 30 ml
Salt – 2 g
Kulcha – 2 pcs

9️⃣ Aloo Mutter ki Chaat
Boiled potato – 150 g
Boiled peas – 100 g
Tamarind chutney – 15 g
Green chutney – 15 g
Onion – 30 g
Chaat masala – 2 g
Red chilli powder – 1 g
Salt – 1 g
Lemon juice – 5 ml

🔟 Dahi Gujiya
Maida – 60 g
Salt – 1 g
Oil – 300 ml
Thick curd – 150 g
Tamarind chutney – 15 g
Green chutney – 15 g
Roasted cumin – 1 g
Red chilli powder – 1 g
Sev – 15 g

1️⃣1️⃣ Fresh Fruit Chaat (Indian Style)
Apple – 80 g
Banana – 1 pc
Papaya – 100 g
Pomegranate – 30 g
Black salt – 1 g
Chaat masala – 2 g
Lemon juice – 5 ml
Mint – 5 g

1️⃣2️⃣ Bombay Bhel Puri
Puffed rice – 50 g
Onion – 45 g
Tomato – 45 g
Boiled potato – 80 g
Tamarind chutney – 30 g
Green chutney – 15 g
Sev – 25 g
Roasted peanuts – 15 g
Chaat masala – 2 g
Red chilli powder – 1 g
Lemon juice – 5 ml
Fresh coriander – 5 g
"""

def main():
    db = SessionLocal()
    
    current_category = "Starters"
    lines = RAW_TEXT.split("\n")
    
    current_item = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith("PART 3"):
            current_category = "Snacks"
            continue
        elif line.startswith("PART 4"):
            current_category = "Indian Chaat"
            continue
            
        # Match menu item header, e.g. "1️⃣ Achari Paneer Tikka (6–8 pieces)"
        # or "🔟 French Fries"
        if re.match(r"^\d*️⃣", line) or re.match(r"^\d+️⃣", line):
            # Extract item name
            parts = line.split(" ", 1)
            name = parts[1].split("(")[0].strip()
            
            # Create menu item
            current_item = MenuCatalogItem(
                id=str(uuid.uuid4()),
                name=name,
                category=current_category,
                cost_per_plate=150.0  # Default estimated cost
            )
            db.add(current_item)
            db.commit()
            db.refresh(current_item)
            print(f"Added Menu Item: {name}")
            continue
            
        if "–" in line or "-" in line:
            parts = re.split(r"[-–]", line)
            if len(parts) == 2 and current_item:
                ing_name = parts[0].strip()
                qty_str = parts[1].strip()
                
                # Parse qty and unit
                match = re.match(r"([\d\.]+)\s*(\w+)", qty_str)
                qty = 0.0
                unit = "units"
                if match:
                    qty = float(match.group(1))
                    unit = match.group(2)
                else:
                    if "pc" in qty_str.lower():
                        match = re.match(r"([\d\.]+)", qty_str)
                        if match:
                            qty = float(match.group(1))
                            unit = "pcs"
                            
                # Check if inventory item exists
                inv_item = db.query(InventoryItem).filter(InventoryItem.name == ing_name).first()
                if not inv_item:
                    inv_item = InventoryItem(
                        id=str(uuid.uuid4()),
                        name=ing_name,
                        unit=unit,
                        quantity=100.0,
                        low_stock_threshold=10.0
                    )
                    db.add(inv_item)
                    db.commit()
                    db.refresh(inv_item)
                    
                # Add to catalog ingredients
                cat_ing = CatalogIngredient(
                    id=str(uuid.uuid4()),
                    catalog_item_id=current_item.id,
                    inventory_item_id=inv_item.id,
                    quantity_per_plate=qty
                )
                db.add(cat_ing)
                db.commit()

if __name__ == "__main__":
    main()
