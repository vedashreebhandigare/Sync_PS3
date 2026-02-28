from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import MenuCatalogItem, User
from schemas import MenuCatalogItemOut

router = APIRouter(prefix="/api/menu-catalog", tags=["menu-catalog"])


@router.get("", response_model=list[MenuCatalogItemOut])
def list_menu_catalog(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(MenuCatalogItem).order_by(MenuCatalogItem.category, MenuCatalogItem.name).all()
