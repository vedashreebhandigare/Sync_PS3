import os
import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import MenuCatalogItem, InventoryItem, CatalogIngredient, MenuCategoryEnum

MENU_DATA = {
    "Starters": [
        {
            "name": "Chicken Seekh Kabab",
            "cost": 250,
            "ingredients": [
                {"name": "Chicken mince", "qty": 0.25, "unit": "kg"},
                {"name": "Onion", "qty": 0.06, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Green chilli", "qty": 0.005, "unit": "kg"},
                {"name": "Fresh coriander", "qty": 0.015, "unit": "kg"},
                {"name": "Mint leaves", "qty": 0.015, "unit": "kg"},
                {"name": "Lemon juice", "qty": 0.005, "unit": "L"},
                {"name": "Oil/Butter", "qty": 0.015, "unit": "L"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Cumin powder", "qty": 0.001, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Chaat masala", "qty": 0.001, "unit": "kg"},
                {"name": "Black pepper", "qty": 0.001, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.004, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Paneer Tikka",
            "cost": 220,
            "ingredients": [
                {"name": "Paneer", "qty": 0.15, "unit": "kg"},
                {"name": "Thick curd", "qty": 0.06, "unit": "kg"},
                {"name": "Capsicum", "qty": 0.06, "unit": "kg"},
                {"name": "Onion", "qty": 0.06, "unit": "kg"},
                {"name": "Mustard oil", "qty": 0.015, "unit": "L"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Lemon juice", "qty": 0.005, "unit": "L"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Cumin powder", "qty": 0.001, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Chaat masala", "qty": 0.001, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
                {"name": "Ajwain", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
            ]
        },
        {
            "name": "Veg Manchurian",
            "cost": 180,
            "ingredients": [
                {"name": "Cabbage", "qty": 0.1, "unit": "kg"},
                {"name": "Carrot", "qty": 0.08, "unit": "kg"},
                {"name": "Capsicum", "qty": 0.11, "unit": "kg"}, # 50g + 60g
                {"name": "Cornflour", "qty": 0.06, "unit": "kg"}, # 3tbsp + 1tbsp
                {"name": "Maida", "qty": 0.015, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.01, "unit": "kg"}, # 1tsp + chopped
                {"name": "Black pepper", "qty": 0.002, "unit": "kg"},
                {"name": "Salt", "qty": 0.003, "unit": "kg"},
                {"name": "Oil", "qty": 0.415, "unit": "L"}, # 400ml + 1tbsp
                {"name": "Onion", "qty": 0.08, "unit": "kg"},
                {"name": "Soya sauce", "qty": 0.007, "unit": "L"},
                {"name": "Vinegar", "qty": 0.005, "unit": "L"},
                {"name": "Red chilli sauce", "qty": 0.015, "unit": "L"},
                {"name": "Tomato ketchup", "qty": 0.015, "unit": "L"},
                {"name": "Sugar", "qty": 0.001, "unit": "kg"},
                {"name": "Spring onion", "qty": 0.015, "unit": "kg"},
            ]
        }
    ],
    "Main Course": [
        {
            "name": "Veg Biryani",
            "cost": 220,
            "ingredients": [
                {"name": "Basmati rice", "qty": 0.12, "unit": "kg"},
                {"name": "Carrot", "qty": 0.06, "unit": "kg"},
                {"name": "Beans", "qty": 0.05, "unit": "kg"},
                {"name": "Peas", "qty": 0.06, "unit": "kg"},
                {"name": "Potato", "qty": 0.1, "unit": "kg"},
                {"name": "Onion", "qty": 0.15, "unit": "kg"},
                {"name": "Tomato", "qty": 0.08, "unit": "kg"},
                {"name": "Curd", "qty": 0.08, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Green chilli", "qty": 0.005, "unit": "kg"},
                {"name": "Mint", "qty": 0.015, "unit": "kg"},
                {"name": "Coriander", "qty": 0.015, "unit": "kg"},
                {"name": "Ghee", "qty": 0.02, "unit": "kg"},
                {"name": "Oil", "qty": 0.015, "unit": "L"},
                {"name": "Bay leaf", "qty": 0.002, "unit": "kg"},
                {"name": "Cloves", "qty": 0.001, "unit": "kg"},
                {"name": "Cardamom", "qty": 0.001, "unit": "kg"},
                {"name": "Cinnamon", "qty": 0.001, "unit": "kg"},
                {"name": "Star anise", "qty": 0.001, "unit": "kg"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.002, "unit": "kg"},
                {"name": "Biryani masala", "qty": 0.005, "unit": "kg"},
                {"name": "Salt", "qty": 0.004, "unit": "kg"},
                {"name": "Saffron", "qty": 0.001, "unit": "kg"},
            ]
        }
    ],
    "Breads": [
        {
            "name": "Garlic Roti",
            "cost": 40,
            "ingredients": [
                {"name": "Wheat flour", "qty": 0.15, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Water", "qty": 0.08, "unit": "L"},
                {"name": "Garlic", "qty": 0.015, "unit": "kg"},
                {"name": "Fresh coriander", "qty": 0.015, "unit": "kg"},
                {"name": "Butter", "qty": 0.005, "unit": "kg"},
            ]
        },
        {
            "name": "Naan",
            "cost": 50,
            "ingredients": [
                {"name": "Maida", "qty": 0.18, "unit": "kg"},
                {"name": "Curd", "qty": 0.03, "unit": "kg"},
                {"name": "Baking soda", "qty": 0.001, "unit": "kg"},
                {"name": "Sugar", "qty": 0.002, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Oil", "qty": 0.015, "unit": "L"},
                {"name": "Water", "qty": 0.1, "unit": "L"},
                {"name": "Butter", "qty": 0.005, "unit": "kg"},
            ]
        }
    ],
    "Desserts": [
        {
            "name": "Gulab Jamun",
            "cost": 90,
            "ingredients": [
                {"name": "Khoya", "qty": 0.15, "unit": "kg"},
                {"name": "Maida", "qty": 0.03, "unit": "kg"},
                {"name": "Baking soda", "qty": 0.001, "unit": "kg"},
                {"name": "Milk", "qty": 0.03, "unit": "L"},
                {"name": "Oil", "qty": 0.4, "unit": "L"},
                {"name": "Sugar", "qty": 0.2, "unit": "kg"},
                {"name": "Water", "qty": 0.2, "unit": "L"},
                {"name": "Cardamom", "qty": 0.001, "unit": "kg"},
                {"name": "Rose water", "qty": 0.002, "unit": "L"},
                {"name": "Saffron", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Ice Cream Vanilla",
            "cost": 70,
            "ingredients": [
                {"name": "Milk", "qty": 0.2, "unit": "L"},
                {"name": "Fresh cream", "qty": 0.08, "unit": "L"},
                {"name": "Sugar", "qty": 0.04, "unit": "kg"},
                {"name": "Cornflour", "qty": 0.005, "unit": "kg"},
                {"name": "Vanilla essence", "qty": 0.001, "unit": "L"},
            ]
        },
        {
            "name": "Jalebi",
            "cost": 100,
            "ingredients": [
                {"name": "Maida", "qty": 0.12, "unit": "kg"},
                {"name": "Cornflour", "qty": 0.015, "unit": "kg"},
                {"name": "Baking soda", "qty": 0.001, "unit": "kg"},
                {"name": "Curd", "qty": 0.03, "unit": "kg"},
                {"name": "Water", "qty": 0.2, "unit": "L"},
                {"name": "Oil", "qty": 0.4, "unit": "L"},
                {"name": "Sugar", "qty": 0.2, "unit": "kg"},
                {"name": "Cardamom", "qty": 0.001, "unit": "kg"},
                {"name": "Saffron", "qty": 0.001, "unit": "kg"},
                {"name": "Lemon juice", "qty": 0.001, "unit": "L"},
            ]
        }
    ],
    "Beverages": [
        {
            "name": "Fresh Lime Soda",
            "cost": 60,
            "ingredients": [
                {"name": "Lemon juice", "qty": 0.02, "unit": "L"},
                {"name": "Sugar", "qty": 0.01, "unit": "kg"},
                {"name": "Black salt", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Soda water", "qty": 0.2, "unit": "L"},
                {"name": "Ice cubes", "qty": 0.05, "unit": "kg"},
            ]
        },
        {
            "name": "Masala Chaas",
            "cost": 50,
            "ingredients": [
                {"name": "Curd", "qty": 0.2, "unit": "kg"},
                {"name": "Water", "qty": 0.1, "unit": "L"},
                {"name": "Roasted cumin powder", "qty": 0.002, "unit": "kg"},
                {"name": "Black salt", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Mint", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander", "qty": 0.005, "unit": "kg"},
                {"name": "Hing", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Tea",
            "cost": 30,
            "ingredients": [
                {"name": "Water", "qty": 0.12, "unit": "L"},
                {"name": "Milk", "qty": 0.08, "unit": "L"},
                {"name": "Tea leaves", "qty": 0.005, "unit": "kg"},
                {"name": "Sugar", "qty": 0.01, "unit": "kg"},
                {"name": "Cardamom", "qty": 0.001, "unit": "kg"},
                {"name": "Ginger", "qty": 0.002, "unit": "kg"},
            ]
        },
        {
            "name": "Coffee",
            "cost": 40,
            "ingredients": [
                {"name": "Milk", "qty": 0.15, "unit": "L"},
                {"name": "Water", "qty": 0.05, "unit": "L"},
                {"name": "Coffee powder", "qty": 0.005, "unit": "kg"},
                {"name": "Sugar", "qty": 0.01, "unit": "kg"},
            ]
        }
    ]
}

def map_category(category_name):
    cat_map = {
        "Starters": MenuCategoryEnum.STARTERS,
        "Main Course": MenuCategoryEnum.MAIN_COURSE,
        "Breads": MenuCategoryEnum.BREADS,
        "Desserts": MenuCategoryEnum.DESSERTS,
        "Beverages": MenuCategoryEnum.BEVERAGES,
    }
    return cat_map.get(category_name, MenuCategoryEnum.MAIN_COURSE)

def main():
    db: Session = SessionLocal()
    
    # 1. Fetch existing inventory items
    inventory_items = db.query(InventoryItem).all()
    inv_map = {item.name.lower(): item for item in inventory_items}
    
    for category_name, items in MENU_DATA.items():
        db_category = map_category(category_name)

        for item_data in items:
            name = item_data["name"]
            cost = item_data["cost"]
            
            # Check if Menu Item already exists
            existing_menu = db.query(MenuCatalogItem).filter(MenuCatalogItem.name == name).first()
            if not existing_menu:
                new_menu = MenuCatalogItem(
                    name=name,
                    category=db_category,
                    cost_per_plate=cost
                )
                db.add(new_menu)
                db.flush()
                menu_id = new_menu.id
                print(f"Added Menu Item: {name}")
            else:
                menu_id = existing_menu.id
            
            # Add Ingredients
            for ing in item_data["ingredients"]:
                ing_name = ing["name"]
                ing_qty = ing["qty"]
                ing_unit = ing["unit"]
                
                # Check/Create Inventory Item
                lower_name = ing_name.lower()
                inv_item = inv_map.get(lower_name)
                
                if not inv_item:
                    inv_item = InventoryItem(
                        name=ing_name,
                        unit=ing_unit,
                        quantity=0.0,
                        low_stock_threshold=5.0
                    )
                    db.add(inv_item)
                    db.flush()
                    inv_map[lower_name] = inv_item
                
                # Link Ingredient
                existing_link = db.query(CatalogIngredient).filter(
                    CatalogIngredient.catalog_item_id == menu_id,
                    CatalogIngredient.inventory_item_id == inv_item.id
                ).first()
                
                if not existing_link:
                    link = CatalogIngredient(
                        catalog_item_id=menu_id,
                        inventory_item_id=inv_item.id,
                        quantity_per_plate=ing_qty
                    )
                    db.add(link)

    db.commit()
    db.close()
    print("Database seeding from add_extras.py completed.")

if __name__ == "__main__":
    main()
