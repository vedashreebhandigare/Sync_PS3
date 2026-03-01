"""
Call coaching routes — REST endpoints + WebSocket for live updates.
"""

from __future__ import annotations

import json
import asyncio
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Form
from fastapi.responses import Response
from sqlalchemy.orm import Session

from database import get_db
from models import Lead, CallRecord
from schemas import CallInitiateRequest, CallRecordOut
from services.call_coaching import (
    is_twilio_configured,
    is_gemini_configured,
    create_session,
    get_session,
    remove_session,
    initiate_twilio_call,
    generate_coaching_suggestion,
    generate_call_analysis,
)

router = APIRouter(prefix="/calls", tags=["calls"])


# ---------------------------------------------------------------------------
# REST: Check config status  (must be before /{call_id} to avoid route clash)
# ---------------------------------------------------------------------------
@router.get("/config/status")
def config_status():
    return {
        "twilio_configured": is_twilio_configured(),
        "gemini_configured": is_gemini_configured(),
    }


# ---------------------------------------------------------------------------
# REST: Initiate a call
# ---------------------------------------------------------------------------
@router.post("/initiate/{lead_id}")
async def initiate_call(
    lead_id: str,
    body: CallInitiateRequest,
    db: Session = Depends(get_db),
):
    """Start a new outbound call to the given phone number for a lead."""
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead_context = (
        f"Name: {lead.name}, Event: {lead.event_type}, "
        f"Date: {lead.event_date}, Guests: {lead.guest_count}, "
        f"Budget: {lead.budget}, Stage: {lead.stage}, "
        f"Source: {lead.source}, Branch: {lead.branch}"
    )

    call_record = CallRecord(
        lead_id=lead_id,
        status="initiated",
    )
    db.add(call_record)
    db.commit()
    db.refresh(call_record)

    session = create_session(
        call_id=call_record.id,
        lead_id=lead_id,
        lead_name=lead.name,
        lead_context=lead_context,
        phone_number=body.phone_number,
    )

    if is_twilio_configured():
        try:
            sid = initiate_twilio_call(body.phone_number, call_record.id)
            session.twilio_call_sid = sid
            call_record.twilio_sid = sid
            call_record.status = "ringing"
            session.update_status("ringing")
            db.commit()
        except Exception as e:
            call_record.status = "failed"
            session.update_status("failed")
            db.commit()
            raise HTTPException(status_code=500, detail=f"Twilio error: {str(e)}")
    else:
        # Demo mode — simulate call without Twilio
        call_record.status = "in-progress"
        session.update_status("in-progress")
        db.commit()
        asyncio.create_task(_demo_call_simulation(session, lead_context))

    return {
        "call_id": call_record.id,
        "status": call_record.status,
        "twilio_configured": is_twilio_configured(),
        "gemini_configured": is_gemini_configured(),
    }


# ---------------------------------------------------------------------------
# REST: Hang up a call
# ---------------------------------------------------------------------------
@router.post("/hangup/{call_id}")
async def hangup_call(call_id: str, db: Session = Depends(get_db)):
    """End an active call and generate post-call analysis."""
    call_record = db.query(CallRecord).filter(CallRecord.id == call_id).first()
    if not call_record:
        raise HTTPException(status_code=404, detail="Call record not found")

    session = get_session(call_id)

    if is_twilio_configured() and call_record.twilio_sid:
        try:
            from services.call_coaching import get_twilio_client
            client = get_twilio_client()
            client.calls(call_record.twilio_sid).update(status="completed")
        except Exception:
            pass

    transcript = session.transcript if session else []
    lead = db.query(Lead).filter(Lead.id == call_record.lead_id).first()
    lead_context = ""
    if lead:
        lead_context = (
            f"Name: {lead.name}, Event: {lead.event_type}, "
            f"Date: {lead.event_date}, Guests: {lead.guest_count}, "
            f"Budget: {lead.budget}, Stage: {lead.stage}"
        )

    analysis = await generate_call_analysis(transcript, lead_context)

    call_record.status = "completed"
    call_record.end_time = datetime.utcnow()
    if call_record.start_time:
        call_record.duration_seconds = int(
            (call_record.end_time - call_record.start_time).total_seconds()
        )
    call_record.transcript = json.dumps(transcript)
    call_record.analysis = json.dumps(analysis)

    if analysis.get("suggested_stage") and lead:
        lead.stage = analysis["suggested_stage"]

    db.commit()

    if session:
        session.update_status("completed")
        remove_session(call_id)

    return {
        "call_id": call_id,
        "status": "completed",
        "duration_seconds": call_record.duration_seconds,
        "analysis": analysis,
    }


# ---------------------------------------------------------------------------
# REST: Get calls for a lead
# ---------------------------------------------------------------------------
@router.get("/lead/{lead_id}", response_model=list[CallRecordOut])
def get_lead_calls(lead_id: str, db: Session = Depends(get_db)):
    return (
        db.query(CallRecord)
        .filter(CallRecord.lead_id == lead_id)
        .order_by(CallRecord.start_time.desc())
        .all()
    )


# ---------------------------------------------------------------------------
# REST: Get a single call record
# ---------------------------------------------------------------------------
@router.get("/{call_id}", response_model=CallRecordOut)
def get_call(call_id: str, db: Session = Depends(get_db)):
    call_record = db.query(CallRecord).filter(CallRecord.id == call_id).first()
    if not call_record:
        raise HTTPException(status_code=404, detail="Call not found")
    return call_record


# ---------------------------------------------------------------------------
# WebSocket: Live call updates → Frontend
# ---------------------------------------------------------------------------
@router.websocket("/live/{call_id}")
async def live_call_ws(websocket: WebSocket, call_id: str):
    """Frontend connects here to receive live transcript + AI suggestions."""
    await websocket.accept()

    session = get_session(call_id)
    if not session:
        await websocket.send_json({"type": "error", "data": {"message": "No active call session"}})
        await websocket.close()
        return

    queue: asyncio.Queue = asyncio.Queue(maxsize=100)
    session.listeners.append(queue)

    for entry in session.transcript:
        await websocket.send_json({"type": "transcript", "data": entry})
    for entry in session.ai_suggestions:
        await websocket.send_json({"type": "suggestion", "data": entry})
    await websocket.send_json({"type": "status", "data": {"status": session.status}})

    try:
        async def send_updates():
            while True:
                msg = await queue.get()
                await websocket.send_json(msg)
                if msg.get("type") == "status" and msg["data"]["status"] in ("completed", "failed"):
                    break

        async def receive_commands():
            while True:
                data = await websocket.receive_json()
                if data.get("type") == "transcript":
                    session.add_transcript(
                        speaker=data.get("speaker", "staff"),
                        text=data.get("text", ""),
                    )
                    if len(session.transcript) % 2 == 0:
                        suggestion = await generate_coaching_suggestion(
                            session.transcript, session.lead_context
                        )
                        session.add_suggestion(
                            suggestion.get("suggestion", ""),
                            suggestion.get("reason", ""),
                        )

        await asyncio.gather(
            send_updates(),
            receive_commands(),
            return_exceptions=True,
        )
    except WebSocketDisconnect:
        pass
    finally:
        if queue in session.listeners:
            session.listeners.remove(queue)


# ---------------------------------------------------------------------------
# Twilio Status Callback
# ---------------------------------------------------------------------------
@router.post("/status-callback/{call_id}")
async def twilio_status_callback(
    call_id: str,
    CallSid: str = Form(""),
    CallStatus: str = Form(""),
    db: Session = Depends(get_db),
):
    call_record = db.query(CallRecord).filter(CallRecord.id == call_id).first()
    if call_record:
        status_map = {
            "initiated": "initiated",
            "ringing": "ringing",
            "in-progress": "in-progress",
            "completed": "completed",
            "failed": "failed",
            "busy": "failed",
            "no-answer": "failed",
            "canceled": "failed",
        }
        new_status = status_map.get(CallStatus, CallStatus)
        call_record.status = new_status
        db.commit()

        session = get_session(call_id)
        if session:
            session.update_status(new_status)

    return Response(content="<Response/>", media_type="application/xml")


# ---------------------------------------------------------------------------
# Demo: Simulated call for testing without Twilio
# ---------------------------------------------------------------------------
async def _demo_call_simulation(session, lead_context: str):
    """Simulates a realistic call transcript for demo/hackathon use."""
    await asyncio.sleep(1)

    demo_script = [
        ("system", "📞 Call connected (Demo Mode)"),
        ("staff", f"Hello, am I speaking with {session.lead_name}?"),
        ("client", "Yes, this is them. Who's calling?"),
        ("staff", "Hi! I'm calling from Aurora Banquets regarding your event inquiry."),
        ("client", "Oh yes, I had submitted an inquiry. Tell me more about your venue."),
        ("staff", "We have beautiful halls available. Would you like to schedule a visit?"),
        ("client", "Sure, what dates do you have available?"),
        ("staff", "We have slots this Saturday and next Wednesday. Which works better?"),
        ("client", "Saturday sounds good. What's the capacity of your main hall?"),
        ("staff", "Our main hall accommodates up to 500 guests with premium décor options."),
    ]

    tips = [
        ("Mention current promotion or discount to create urgency", "Client is engaged"),
        ("Ask about their specific requirements to personalize the pitch", "Client is asking questions"),
        ("Suggest a visit this Saturday — they seem interested", "Client mentioned availability"),
        ("Highlight your USPs: AC halls, ample parking, in-house catering", "Client comparing venues"),
        ("Try to confirm the visit booking before ending the call", "Closing opportunity"),
    ]

    for speaker, text in demo_script:
        if not get_session(session.call_id):
            break
        session.add_transcript(speaker, text)
        await asyncio.sleep(2)

        if speaker == "client" and is_gemini_configured():
            try:
                suggestion = await generate_coaching_suggestion(session.transcript, lead_context)
                session.add_suggestion(
                    suggestion.get("suggestion", ""),
                    suggestion.get("reason", ""),
                )
            except Exception:
                pass
        elif speaker == "client":
            idx = min(len(session.ai_suggestions), len(tips) - 1)
            session.add_suggestion(tips[idx][0], tips[idx][1])
