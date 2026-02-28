from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import get_branch_filter, get_current_user
from database import get_db
from models import Branch, Hall, User
from schemas import BranchOut, HallOut

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("", response_model=list[BranchOut])
def list_branches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    q = db.query(Branch)
    if branch_filter:
        q = q.filter(Branch.id == branch_filter)
    return q.order_by(Branch.name).all()


@router.get("/{branch_id}/halls", response_model=list[HallOut])
def list_halls(
    branch_id: str,
    db: Session = Depends(get_db),
    branch_filter: Optional[str] = Depends(get_branch_filter),
):
    # Branch manager can only see halls for their branch
    if branch_filter and branch_id != branch_filter:
        raise HTTPException(403, "Access denied to this branch")

    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(404, "Branch not found")
    return db.query(Hall).filter(Hall.branch_id == branch_id).order_by(Hall.name).all()
