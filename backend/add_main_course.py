import os
import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import MenuCatalogItem, InventoryItem, CatalogIngredient, MenuCategoryEnum

# List of Salads, Raita, Dal, Paneer, and Veg Dishes
MENU_DATA = {
    "Salads": [
        {
            "name": "Green Salad",
            "cost": 100,
            "ingredients": [
                {"name": "Cucumber", "qty": 0.1, "unit": "kg"},
                {"name": "Tomato", "qty": 0.1, "unit": "kg"},
                {"name": "Onion", "qty": 0.06, "unit": "kg"},
                {"name": "Carrot", "qty": 0.06, "unit": "kg"},
                {"name": "Lemon juice", "qty": 0.015, "unit": "L"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Black pepper", "qty": 0.001, "unit": "kg"},
                {"name": "Chaat masala", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Russian Salad",
            "cost": 150,
            "ingredients": [
                {"name": "Potato", "qty": 0.12, "unit": "kg"},
                {"name": "Carrot", "qty": 0.06, "unit": "kg"},
                {"name": "Beans", "qty": 0.05, "unit": "kg"},
                {"name": "Green peas", "qty": 0.05, "unit": "kg"},
                {"name": "Apple", "qty": 0.06, "unit": "kg"},
                {"name": "Pineapple", "qty": 0.05, "unit": "kg"},
                {"name": "Mayonnaise", "qty": 0.12, "unit": "kg"},
                {"name": "Fresh cream", "qty": 0.015, "unit": "L"},
                {"name": "Sugar", "qty": 0.002, "unit": "kg"},
                {"name": "White pepper", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Sprout Salad",
            "cost": 120,
            "ingredients": [
                {"name": "Mixed sprouts", "qty": 0.15, "unit": "kg"},
                {"name": "Onion", "qty": 0.04, "unit": "kg"},
                {"name": "Tomato", "qty": 0.06, "unit": "kg"},
                {"name": "Cucumber", "qty": 0.06, "unit": "kg"},
                {"name": "Lemon juice", "qty": 0.015, "unit": "L"},
                {"name": "Black salt", "qty": 0.001, "unit": "kg"},
                {"name": "Chaat masala", "qty": 0.002, "unit": "kg"},
                {"name": "Roasted cumin powder", "qty": 0.001, "unit": "kg"},
                {"name": "Coriander leaves", "qty": 0.015, "unit": "kg"},
            ]
        },
        {
            "name": "Corn Chaat Salad",
            "cost": 140,
            "ingredients": [
                {"name": "Sweet corn", "qty": 0.15, "unit": "kg"},
                {"name": "Onion", "qty": 0.04, "unit": "kg"},
                {"name": "Tomato", "qty": 0.06, "unit": "kg"},
                {"name": "Capsicum", "qty": 0.04, "unit": "kg"},
                {"name": "Lemon juice", "qty": 0.015, "unit": "L"},
                {"name": "Butter", "qty": 0.005, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Black pepper", "qty": 0.001, "unit": "kg"},
                {"name": "Chaat masala", "qty": 0.002, "unit": "kg"},
            ]
        },
        {
            "name": "Kachumber Salad",
            "cost": 90,
            "ingredients": [
                {"name": "Cucumber", "qty": 0.1, "unit": "kg"},
                {"name": "Onion", "qty": 0.06, "unit": "kg"},
                {"name": "Tomato", "qty": 0.1, "unit": "kg"},
                {"name": "Green chilli", "qty": 0.005, "unit": "kg"},
                {"name": "Lemon juice", "qty": 0.015, "unit": "L"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Roasted cumin powder", "qty": 0.001, "unit": "kg"},
                {"name": "Fresh coriander", "qty": 0.015, "unit": "kg"},
            ]
        },
        {
            "name": "Coleslaw",
            "cost": 110,
            "ingredients": [
                {"name": "Cabbage", "qty": 0.2, "unit": "kg"},
                {"name": "Carrot", "qty": 0.06, "unit": "kg"},
                {"name": "Mayonnaise", "qty": 0.1, "unit": "kg"},
                {"name": "Milk", "qty": 0.015, "unit": "L"},
                {"name": "Sugar", "qty": 0.002, "unit": "kg"},
                {"name": "Vinegar", "qty": 0.005, "unit": "L"},
                {"name": "White pepper", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
            ]
        },
    ],
    "Raita": [
        {
            "name": "Boondi Raita",
            "cost": 80,
            "ingredients": [
                {"name": "Thick curd", "qty": 0.2, "unit": "L"},
                {"name": "Boondi", "qty": 0.04, "unit": "kg"},
                {"name": "Roasted cumin powder", "qty": 0.001, "unit": "kg"},
                {"name": "Black salt", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.001, "unit": "kg"},
                {"name": "Coriander", "qty": 0.005, "unit": "kg"},
            ]
        },
        {
            "name": "Mix Veg Raita",
            "cost": 90,
            "ingredients": [
                {"name": "Thick curd", "qty": 0.2, "unit": "L"},
                {"name": "Carrot", "qty": 0.04, "unit": "kg"},
                {"name": "Cucumber", "qty": 0.06, "unit": "kg"},
                {"name": "Onion", "qty": 0.03, "unit": "kg"},
                {"name": "Roasted cumin", "qty": 0.001, "unit": "kg"},
                {"name": "Black salt", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Mint powder", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Pineapple Raita",
            "cost": 110,
            "ingredients": [
                {"name": "Thick curd", "qty": 0.2, "unit": "L"},
                {"name": "Pineapple", "qty": 0.08, "unit": "kg"},
                {"name": "Sugar", "qty": 0.002, "unit": "kg"},
                {"name": "Roasted cumin", "qty": 0.001, "unit": "kg"},
                {"name": "Black pepper", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Pudina Raita",
            "cost": 85,
            "ingredients": [
                {"name": "Thick curd", "qty": 0.2, "unit": "L"},
                {"name": "Mint leaves paste", "qty": 0.015, "unit": "kg"},
                {"name": "Roasted cumin", "qty": 0.001, "unit": "kg"},
                {"name": "Black salt", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.001, "unit": "kg"},
                {"name": "Green chilli paste", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Plain Curd",
            "cost": 60,
            "ingredients": [
                {"name": "Fresh curd", "qty": 0.2, "unit": "L"},
            ]
        },
    ],
    "Dal": [
        {
            "name": "Dal Makhani",
            "cost": 180,
            "ingredients": [
                {"name": "Whole urad dal", "qty": 0.05, "unit": "kg"},
                {"name": "Rajma", "qty": 0.02, "unit": "kg"},
                {"name": "Water", "qty": 0.4, "unit": "L"},
                {"name": "Butter", "qty": 0.02, "unit": "kg"},
                {"name": "Oil", "qty": 0.005, "unit": "L"},
                {"name": "Onion", "qty": 0.08, "unit": "kg"},
                {"name": "Tomato puree", "qty": 0.15, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Green chilli", "qty": 0.002, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Fresh cream", "qty": 0.03, "unit": "L"},
            ]
        },
        {
            "name": "Dal Tadka",
            "cost": 150,
            "ingredients": [
                {"name": "Arhar/Toor dal", "qty": 0.07, "unit": "kg"},
                {"name": "Water", "qty": 0.35, "unit": "L"},
                {"name": "Ghee", "qty": 0.015, "unit": "kg"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Mustard seeds", "qty": 0.001, "unit": "kg"},
                {"name": "Hing", "qty": 0.001, "unit": "kg"},
                {"name": "Garlic", "qty": 0.01, "unit": "kg"},
                {"name": "Dry red chilli", "qty": 0.002, "unit": "kg"},
                {"name": "Onion", "qty": 0.06, "unit": "kg"},
                {"name": "Tomato", "qty": 0.08, "unit": "kg"},
                {"name": "Ginger", "qty": 0.002, "unit": "kg"},
                {"name": "Green chilli", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Fresh coriander", "qty": 0.015, "unit": "kg"},
                {"name": "Lemon juice", "qty": 0.005, "unit": "L"},
            ]
        },
        {
            "name": "Chana Dal",
            "cost": 160,
            "ingredients": [
                {"name": "Chana dal", "qty": 0.07, "unit": "kg"},
                {"name": "Water", "qty": 0.35, "unit": "L"},
                {"name": "Oil", "qty": 0.015, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Bay leaf", "qty": 0.002, "unit": "kg"},
                {"name": "Hing", "qty": 0.001, "unit": "kg"},
                {"name": "Onion", "qty": 0.08, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Tomato", "qty": 0.1, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Cumin powder", "qty": 0.001, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
                {"name": "Fresh coriander", "qty": 0.015, "unit": "kg"},
            ]
        },
    ],
    "Paneer": [
        {
            "name": "Shahi Paneer",
            "cost": 220,
            "ingredients": [
                {"name": "Paneer", "qty": 0.15, "unit": "kg"},
                {"name": "Onion", "qty": 0.1, "unit": "kg"},
                {"name": "Tomato", "qty": 0.15, "unit": "kg"},
                {"name": "Cashews", "qty": 0.015, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Butter", "qty": 0.02, "unit": "kg"},
                {"name": "Oil", "qty": 0.005, "unit": "L"},
                {"name": "Fresh cream", "qty": 0.04, "unit": "L"},
                {"name": "Bay leaf", "qty": 0.002, "unit": "kg"},
                {"name": "Green cardamom", "qty": 0.002, "unit": "kg"},
                {"name": "Clove", "qty": 0.001, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Sugar", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Kadai Paneer",
            "cost": 210,
            "ingredients": [
                {"name": "Paneer", "qty": 0.15, "unit": "kg"},
                {"name": "Onion", "qty": 0.1, "unit": "kg"},
                {"name": "Capsicum", "qty": 0.1, "unit": "kg"},
                {"name": "Tomato", "qty": 0.15, "unit": "kg"},
                {"name": "Ginger", "qty": 0.005, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Crushed coriander seeds", "qty": 0.005, "unit": "kg"},
                {"name": "Crushed black pepper", "qty": 0.002, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Matar Paneer",
            "cost": 190,
            "ingredients": [
                {"name": "Paneer", "qty": 0.15, "unit": "kg"},
                {"name": "Green peas", "qty": 0.1, "unit": "kg"},
                {"name": "Onion", "qty": 0.1, "unit": "kg"},
                {"name": "Tomato", "qty": 0.15, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Oil", "qty": 0.02, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Bay leaf", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Fresh coriander", "qty": 0.015, "unit": "kg"},
            ]
        },
        {
            "name": "Palak Paneer",
            "cost": 180,
            "ingredients": [
                {"name": "Paneer", "qty": 0.15, "unit": "kg"},
                {"name": "Spinach", "qty": 0.25, "unit": "kg"},
                {"name": "Onion", "qty": 0.08, "unit": "kg"},
                {"name": "Tomato", "qty": 0.1, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Green chilli", "qty": 0.005, "unit": "kg"},
                {"name": "Oil", "qty": 0.015, "unit": "L"},
                {"name": "Butter", "qty": 0.005, "unit": "kg"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.001, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Fresh cream", "qty": 0.015, "unit": "L"},
            ]
        },
        {
            "name": "Paneer Butter Masala",
            "cost": 230,
            "ingredients": [
                {"name": "Paneer", "qty": 0.15, "unit": "kg"},
                {"name": "Tomato puree", "qty": 0.2, "unit": "kg"},
                {"name": "Onion", "qty": 0.08, "unit": "kg"},
                {"name": "Cashews", "qty": 0.015, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Butter", "qty": 0.03, "unit": "kg"},
                {"name": "Oil", "qty": 0.005, "unit": "L"},
                {"name": "Fresh cream", "qty": 0.045, "unit": "L"},
                {"name": "Bay leaf", "qty": 0.002, "unit": "kg"},
                {"name": "Clove", "qty": 0.001, "unit": "kg"},
                {"name": "Cardamom", "qty": 0.001, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Kashmiri red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Sugar", "qty": 0.002, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Malai Kofta",
            "cost": 220,
            "ingredients": [
                {"name": "Paneer", "qty": 0.1, "unit": "kg"},
                {"name": "Potato", "qty": 0.1, "unit": "kg"},
                {"name": "Cornflour", "qty": 0.015, "unit": "kg"},
                {"name": "Cashews", "qty": 0.015, "unit": "kg"},
                {"name": "Raisins", "qty": 0.015, "unit": "kg"},
                {"name": "Green chilli", "qty": 0.002, "unit": "kg"},
                {"name": "Salt", "qty": 0.003, "unit": "kg"},
                {"name": "Oil", "qty": 0.3, "unit": "L"},
                {"name": "Onion", "qty": 0.1, "unit": "kg"},
                {"name": "Tomato", "qty": 0.15, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Butter", "qty": 0.015, "unit": "kg"},
                {"name": "Fresh cream", "qty": 0.03, "unit": "L"},
                {"name": "Bay leaf", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Sugar", "qty": 0.001, "unit": "kg"},
            ]
        },
    ],
    "Main Course": [
        {
            "name": "Aloo Gobi",
            "cost": 120,
            "ingredients": [
                {"name": "Potato", "qty": 0.2, "unit": "kg"},
                {"name": "Cauliflower", "qty": 0.25, "unit": "kg"},
                {"name": "Onion", "qty": 0.1, "unit": "kg"},
                {"name": "Tomato", "qty": 0.12, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
                {"name": "Fresh coriander", "qty": 0.015, "unit": "kg"},
            ]
        },
        {
            "name": "Jeera Aloo",
            "cost": 110,
            "ingredients": [
                {"name": "Potato", "qty": 0.3, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.005, "unit": "kg"},
                {"name": "Green chilli", "qty": 0.005, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.002, "unit": "kg"},
                {"name": "Chaat masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Lemon juice", "qty": 0.005, "unit": "L"},
            ]
        },
        {
            "name": "Dum Aloo",
            "cost": 140,
            "ingredients": [
                {"name": "Baby potato", "qty": 0.3, "unit": "kg"},
                {"name": "Curd", "qty": 0.08, "unit": "kg"},
                {"name": "Onion", "qty": 0.1, "unit": "kg"},
                {"name": "Tomato", "qty": 0.12, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Bay leaf", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Fennel powder", "qty": 0.002, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Bhindi Masala",
            "cost": 130,
            "ingredients": [
                {"name": "Bhindi", "qty": 0.3, "unit": "kg"},
                {"name": "Onion", "qty": 0.12, "unit": "kg"},
                {"name": "Tomato", "qty": 0.1, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Amchur", "qty": 0.001, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
            ]
        },
        {
            "name": "Baingan Bharta",
            "cost": 140,
            "ingredients": [
                {"name": "Brinjal", "qty": 0.4, "unit": "kg"},
                {"name": "Onion", "qty": 0.12, "unit": "kg"},
                {"name": "Tomato", "qty": 0.15, "unit": "kg"},
                {"name": "Garlic", "qty": 0.02, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Fresh coriander", "qty": 0.015, "unit": "kg"},
            ]
        },
        {
            "name": "Mix Veg",
            "cost": 160,
            "ingredients": [
                {"name": "Carrot", "qty": 0.08, "unit": "kg"},
                {"name": "Beans", "qty": 0.08, "unit": "kg"},
                {"name": "Green peas", "qty": 0.08, "unit": "kg"},
                {"name": "Cauliflower", "qty": 0.1, "unit": "kg"},
                {"name": "Potato", "qty": 0.15, "unit": "kg"},
                {"name": "Onion", "qty": 0.12, "unit": "kg"},
                {"name": "Tomato", "qty": 0.15, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Kasuri methi", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Gobi Manchurian",
            "cost": 150,
            "ingredients": [
                {"name": "Cauliflower", "qty": 0.3, "unit": "kg"},
                {"name": "Cornflour", "qty": 0.045, "unit": "kg"},
                {"name": "Maida", "qty": 0.015, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Capsicum", "qty": 0.08, "unit": "kg"},
                {"name": "Spring onion", "qty": 0.04, "unit": "kg"},
                {"name": "Soya sauce", "qty": 0.005, "unit": "L"},
                {"name": "Vinegar", "qty": 0.005, "unit": "L"},
                {"name": "Red chilli sauce", "qty": 0.015, "unit": "L"},
                {"name": "Black pepper", "qty": 0.002, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Oil", "qty": 0.4, "unit": "L"},
            ]
        },
        {
            "name": "Mushroom Masala",
            "cost": 170,
            "ingredients": [
                {"name": "Mushroom", "qty": 0.3, "unit": "kg"},
                {"name": "Onion", "qty": 0.12, "unit": "kg"},
                {"name": "Tomato", "qty": 0.15, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Fresh coriander", "qty": 0.015, "unit": "kg"},
            ]
        },
        {
            "name": "Aloo Palak",
            "cost": 140,
            "ingredients": [
                {"name": "Spinach", "qty": 0.3, "unit": "kg"},
                {"name": "Potato", "qty": 0.2, "unit": "kg"},
                {"name": "Onion", "qty": 0.08, "unit": "kg"},
                {"name": "Garlic", "qty": 0.015, "unit": "kg"},
                {"name": "Oil", "qty": 0.02, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Chole Masala",
            "cost": 150,
            "ingredients": [
                {"name": "Kabuli chana", "qty": 0.25, "unit": "kg"},
                {"name": "Onion", "qty": 0.12, "unit": "kg"},
                {"name": "Tomato", "qty": 0.15, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Bay leaf", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Chole masala", "qty": 0.005, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
            ]
        },
        {
            "name": "Rajma Masala",
            "cost": 150,
            "ingredients": [
                {"name": "Rajma", "qty": 0.25, "unit": "kg"},
                {"name": "Onion", "qty": 0.12, "unit": "kg"},
                {"name": "Tomato", "qty": 0.15, "unit": "kg"},
                {"name": "Ginger garlic paste", "qty": 0.005, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Bay leaf", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
            ]
        },
        {
            "name": "Kadhi Pakora",
            "cost": 140,
            "ingredients": [
                {"name": "Besan", "qty": 0.11, "unit": "kg"}, # 80g + 2tbspan (~30g)
                {"name": "Onion", "qty": 0.06, "unit": "kg"},
                {"name": "Carom seeds", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.003, "unit": "kg"},
                {"name": "Oil", "qty": 0.3, "unit": "L"},
                {"name": "Curd", "qty": 0.25, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Water", "qty": 0.4, "unit": "L"},
                {"name": "Ghee", "qty": 0.015, "unit": "kg"},
                {"name": "Mustard seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Cumin", "qty": 0.002, "unit": "kg"},
                {"name": "Dry red chilli", "qty": 0.002, "unit": "kg"},
                {"name": "Hing", "qty": 0.001, "unit": "kg"},
            ]
        },
        {
            "name": "Tinda Masala",
            "cost": 130,
            "ingredients": [
                {"name": "Tinda", "qty": 0.35, "unit": "kg"},
                {"name": "Onion", "qty": 0.1, "unit": "kg"},
                {"name": "Tomato", "qty": 0.12, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
            ]
        },
        {
            "name": "Karela Masala",
            "cost": 140,
            "ingredients": [
                {"name": "Karela", "qty": 0.3, "unit": "kg"},
                {"name": "Onion", "qty": 0.12, "unit": "kg"},
                {"name": "Oil", "qty": 0.03, "unit": "L"},
                {"name": "Fennel powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Amchur", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
            ]
        },
        {
            "name": "Cabbage Peas Sabzi",
            "cost": 120,
            "ingredients": [
                {"name": "Cabbage", "qty": 0.35, "unit": "kg"},
                {"name": "Green peas", "qty": 0.1, "unit": "kg"},
                {"name": "Onion", "qty": 0.08, "unit": "kg"},
                {"name": "Oil", "qty": 0.02, "unit": "L"},
                {"name": "Cumin seeds", "qty": 0.002, "unit": "kg"},
                {"name": "Turmeric", "qty": 0.001, "unit": "kg"},
                {"name": "Red chilli powder", "qty": 0.002, "unit": "kg"},
                {"name": "Coriander powder", "qty": 0.005, "unit": "kg"},
                {"name": "Garam masala", "qty": 0.001, "unit": "kg"},
                {"name": "Salt", "qty": 0.002, "unit": "kg"},
            ]
        }
    ]
}

def main():
    db: Session = SessionLocal()
    
    # 1. Fetch existing inventory items
    inventory_items = db.query(InventoryItem).all()
    inv_map = {item.name.lower(): item for item in inventory_items}
    
    for category_name, items in MENU_DATA.items():
        # Match python dict category to DB Enum via fallback if direct match isn't there
        # but in this case Dal, Paneer, Main Course -> Main Course is likely best?
        # The user provided Salads and Raita, but let's map them to Starters or Snacks?
        # Let's map Salads / Raita to Starters for now since they are cold apps, 
        # Dal / Paneer / Main Course -> Main Course
        db_category = MenuCategoryEnum.MAIN_COURSE
        if category_name in ["Salads", "Raita"]:
            db_category = MenuCategoryEnum.STARTERS

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
    print("Database seeding from add_main_course.py completed.")

if __name__ == "__main__":
    main()
