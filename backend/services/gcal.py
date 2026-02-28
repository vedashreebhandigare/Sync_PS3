import os
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from models import GoogleIntegration

SCOPES = ['https://www.googleapis.com/auth/calendar.events']

def _get_service(db_session):
    """Returns an authenticated Google Calendar API service instance"""
    integration = db_session.query(GoogleIntegration).first()
    if not integration or not integration.credentials_json:
        return None, None
        
    try:
        creds = Credentials.from_authorized_user_info(eval(integration.credentials_json), SCOPES)
        service = build('calendar', 'v3', credentials=creds)
        return service, integration.calendar_id
    except Exception as e:
        print(f"Error loading Google Calendar credentials: {e}")
        return None, None

def _lead_to_event_body(lead, db_session):
    """Converts an Aurora Lead object to a Google Calendar Event dictionary"""
    # Try to find hall name
    from models import Hall
    hall = db_session.query(Hall).filter(Hall.id == lead.selected_hall_id).first()
    hall_name = hall.name if hall else ""
    
    # We create an all-day event for the booking date
    event_date_str = lead.event_date.isoformat()
    
    description = f"""<b>Aurora Confirmed Booking</b><br>
Phone: {lead.phone}<br>
Guests: {lead.guest_count}<br>
Payment: Rs. {lead.advance_paid} / {lead.total_cost}<br>
Stage: {lead.stage}"""

    location = hall_name if hall_name else ""
    
    event = {
        'summary': f"Booking: {lead.name} - {lead.event_type}",
        'location': location,
        'description': description,
        'start': {
            'date': event_date_str,
            'timeZone': 'Asia/Kolkata',
        },
        'end': {
            'date': event_date_str,
            'timeZone': 'Asia/Kolkata',
        },
    }
    return event

def create_event(lead, db_session):
    """Creates a Google Calendar event for a newly confirmed lead"""
    service, calendar_id = _get_service(db_session)
    if not service:
        return False
        
    try:
        event_body = _lead_to_event_body(lead, db_session)
        event = service.events().insert(calendarId=calendar_id, body=event_body).execute()
        lead.gcal_event_id = event.get('id')
        db_session.commit()
        return True
    except HttpError as error:
        print(f"An error occurred creating GCal event: {error}")
        return False

def update_event(lead, db_session):
    """Updates an existing Google Calendar event for a lead"""
    if not lead.gcal_event_id:
        # If it doesn't have an ID but it should be synced, create it instead
        return create_event(lead, db_session)
        
    service, calendar_id = _get_service(db_session)
    if not service:
        return False
        
    try:
        event_body = _lead_to_event_body(lead, db_session)
        service.events().update(
            calendarId=calendar_id, 
            eventId=lead.gcal_event_id, 
            body=event_body
        ).execute()
        return True
    except HttpError as error:
        if error.resp.status == 404:
            # Event was deleted manually in GCal? Recreate it.
            return create_event(lead, db_session)
        print(f"An error occurred updating GCal event: {error}")
        return False

def delete_event(lead, db_session):
    """Deletes a Google Calendar event for a lead (e.g. if cancelled/lost)"""
    if not lead.gcal_event_id:
        return False
        
    service, calendar_id = _get_service(db_session)
    if not service:
        return False
        
    try:
        service.events().delete(
            calendarId=calendar_id, 
            eventId=lead.gcal_event_id
        ).execute()
        
        # Clear the ID
        lead.gcal_event_id = None
        db_session.commit()
        return True
    except HttpError as error:
        if error.resp.status != 404:  # Ignore 404s (already deleted)
            print(f"An error occurred deleting GCal event: {error}")
        return False
