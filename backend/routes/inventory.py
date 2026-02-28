import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import InventoryItem
from schemas import InventoryItemIn, InventoryItemOut

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("", response_model=List[InventoryItemOut])
def list_inventory(db: Session = Depends(get_db)):
    return db.query(InventoryItem).order_by(InventoryItem.name).all()


@router.get("/to-buy", response_model=List[InventoryItemOut])
def list_to_buy(db: Session = Depends(get_db)):
    return db.query(InventoryItem).filter(InventoryItem.quantity <= InventoryItem.low_stock_threshold).order_by(InventoryItem.name).all()


@router.post("", response_model=InventoryItemOut, status_code=201)
def create_inventory_item(payload: InventoryItemIn, db: Session = Depends(get_db)):
    # Check if item with name already exists
    existing = db.query(InventoryItem).filter(InventoryItem.name.ilike(payload.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Inventory item with this name already exists")
        
    item = InventoryItem(
        id=str(uuid.uuid4()),
        name=payload.name,
        unit=payload.unit,
        quantity=payload.quantity,
        low_stock_threshold=payload.low_stock_threshold,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=InventoryItemOut)
def update_inventory_item(item_id: str, payload: InventoryItemIn, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
        
    # Check if another item with name already exists
    existing = db.query(InventoryItem).filter(InventoryItem.name.ilike(payload.name), InventoryItem.id != item_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Inventory item with this name already exists")

    item.name = payload.name
    item.unit = payload.unit
    item.quantity = payload.quantity
    item.low_stock_threshold = payload.low_stock_threshold
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_inventory_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(InventoryItem).filter(InventoryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Optional: check if anything depends on it before deleting? 
    # Let cascade handle or backend return 500 if constrained.
    
    db.delete(item)
    db.commit()
    return None
