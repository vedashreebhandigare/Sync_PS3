from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Branch, Hall
from schemas import BranchOut, HallOut

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("", response_model=list[BranchOut])
def list_branches(db: Session = Depends(get_db)):
    return db.query(Branch).order_by(Branch.name).all()


@router.get("/{branch_id}/halls", response_model=list[HallOut])
def list_halls(branch_id: str, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(404, "Branch not found")
    return db.query(Hall).filter(Hall.branch_id == branch_id).order_by(Hall.name).all()
