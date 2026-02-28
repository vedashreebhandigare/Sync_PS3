from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Contractor, User
from schemas import ContractorOut

router = APIRouter(prefix="/api/contractors", tags=["contractors"])


@router.get("", response_model=list[ContractorOut])
def list_contractors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Contractor).order_by(Contractor.name).all()
