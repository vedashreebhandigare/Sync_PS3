"""
Authentication module: JWT tokens, password hashing, and FastAPI dependencies.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session

from database import get_db

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "banquet-super-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12  # 12 hours

# ---------------------------------------------------------------------------
# Password hashing (using bcrypt directly)
# ---------------------------------------------------------------------------


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# FastAPI Dependencies
# ---------------------------------------------------------------------------
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    """
    Decode JWT → load User from DB → return User object.
    Attached to every protected route.
    """
    from models import User  # deferred to avoid circular import

    payload = decode_token(credentials.credentials)
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


def require_owner(current_user=Depends(get_current_user)):
    """Dependency that ensures the user is an owner."""
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Owner access required")
    return current_user


def get_branch_filter(current_user=Depends(get_current_user)) -> Optional[str]:
    """
    Returns the branch_id to filter by.
    - Owner → None (sees everything)
    - Branch Manager → their assigned branch_id
    """
    if current_user.role == "owner":
        return None
    return current_user.branch_id
