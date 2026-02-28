import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import MenuCatalogItem, CatalogIngredient
from schemas import MenuCatalogItemOut, MenuCatalogItemIn

router = APIRouter(prefix="/api/menu-catalog", tags=["menu-catalog"])


@router.get("", response_model=list[MenuCatalogItemOut])
def list_menu_catalog(db: Session = Depends(get_db)):
    return db.query(MenuCatalogItem).order_by(MenuCatalogItem.category, MenuCatalogItem.name).all()


@router.post("", response_model=MenuCatalogItemOut)
def create_menu_catalog_item(data: MenuCatalogItemIn, db: Session = Depends(get_db)):
    item = MenuCatalogItem(
        id=str(uuid.uuid4()),
        name=data.name,
        category=data.category,
        cost_per_plate=data.cost_per_plate
    )
    db.add(item)
    for ing in data.catalog_ingredients:
        new_ing = CatalogIngredient(
            id=str(uuid.uuid4()),
            catalog_item_id=item.id,
            inventory_item_id=ing.inventory_item_id,
            quantity_per_plate=ing.quantity_per_plate
        )
        db.add(new_ing)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=MenuCatalogItemOut)
def update_menu_catalog_item(item_id: str, data: MenuCatalogItemIn, db: Session = Depends(get_db)):
    item = db.query(MenuCatalogItem).filter(MenuCatalogItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.name = data.name
    item.category = data.category
    item.cost_per_plate = data.cost_per_plate
    
    # Update ingredients: clear existing, add new
    db.query(CatalogIngredient).filter(CatalogIngredient.catalog_item_id == item_id).delete()
    for ing in data.catalog_ingredients:
        new_ing = CatalogIngredient(
            id=str(uuid.uuid4()),
            catalog_item_id=item.id,
            inventory_item_id=ing.inventory_item_id,
            quantity_per_plate=ing.quantity_per_plate
        )
        db.add(new_ing)
        
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_menu_catalog_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(MenuCatalogItem).filter(MenuCatalogItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
