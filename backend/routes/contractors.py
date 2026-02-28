from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Contractor
from schemas import ContractorOut

router = APIRouter(prefix="/api/contractors", tags=["contractors"])


@router.get("", response_model=list[ContractorOut])
def list_contractors(db: Session = Depends(get_db)):
    return db.query(Contractor).order_by(Contractor.name).all()
