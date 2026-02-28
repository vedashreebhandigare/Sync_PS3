import os
from datetime import datetime, date
from fastapi import APIRouter, Depends, Query, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
import google.oauth2.credentials

from database import SessionLocal
from models import GoogleIntegration

router = APIRouter(prefix="/api/auth/google", tags=["auth"])

CLIENT_SECRETS_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "credentials.json")
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

def _get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def _get_flow(redirect_uri: str = "http://localhost:8000/api/auth/google/callback"):
    if not os.path.exists(CLIENT_SECRETS_FILE):
        raise HTTPException(
            status_code=500, 
            detail="credentials.json not found in backend directory. Please create a Google Cloud project and download OAuth credentials."
        )
    return Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=redirect_uri
    )

@router.get("/status")
def get_status(db: Session = Depends(_get_db)):
    integration = db.query(GoogleIntegration).first()
    has_creds_file = os.path.exists(CLIENT_SECRETS_FILE)
    return {
        "connected": integration is not None,
        "calendar_id": integration.calendar_id if integration else None,
        "has_credentials_json": has_creds_file,
    }

@router.get("/login")
def login(request: Request):
    flow = _get_flow(redirect_uri=str(request.url_for('callback_handler')))
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        prompt='consent',
        include_granted_scopes='true'
    )
    return RedirectResponse(authorization_url)

@router.get("/callback", name="callback_handler")
def callback(request: Request, state: str = None, code: str = None, db: Session = Depends(_get_db)):
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")
        
    flow = _get_flow(redirect_uri=str(request.url_for('callback_handler')))
    flow.fetch_token(authorization_response=str(request.url))
    
    credentials = flow.credentials
    creds_json = credentials.to_json()
    
    integration = db.query(GoogleIntegration).first()
    if integration:
        integration.credentials_json = creds_json
    else:
        integration = GoogleIntegration(credentials_json=creds_json, calendar_id="primary")
        db.add(integration)
        
    db.commit()
    
    # Redirect back to the frontend settings page
    return RedirectResponse(url="http://localhost:5173/?view=settings")
