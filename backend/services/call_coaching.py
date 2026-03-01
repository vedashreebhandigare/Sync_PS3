"""
Call coaching service — Twilio + Gemini integration.
"""
from __future__ import annotations

import os
import asyncio
import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Config helpers
# ---------------------------------------------------------------------------

def is_twilio_configured() -> bool:
    return bool(
        os.getenv("TWILIO_ACCOUNT_SID") and
        os.getenv("TWILIO_AUTH_TOKEN") and
        os.getenv("TWILIO_PHONE_NUMBER")
    )


def is_gemini_configured() -> bool:
    return bool(os.getenv("GOOGLE_GEMINI_API_KEY"))


# ---------------------------------------------------------------------------
# Lazy Twilio client
# ---------------------------------------------------------------------------

_twilio_client = None


def get_twilio_client():
    global _twilio_client
    if _twilio_client is None:
        from twilio.rest import Client
        _twilio_client = Client(
            os.getenv("TWILIO_ACCOUNT_SID"),
            os.getenv("TWILIO_AUTH_TOKEN"),
        )
    return _twilio_client


# ---------------------------------------------------------------------------
# Lazy Gemini client
# ---------------------------------------------------------------------------

_gemini_model = None


def get_gemini_model():
    global _gemini_model
    if _gemini_model is None:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_GEMINI_API_KEY", ""))
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    return _gemini_model


# ---------------------------------------------------------------------------
# In-memory call session
# ---------------------------------------------------------------------------

@dataclass
class CallSession:
    call_id: str
    lead_id: str
    lead_name: str
    lead_context: str
    phone_number: str
    status: str = "initiated"
    twilio_call_sid: Optional[str] = None
    transcript: list = field(default_factory=list)
    ai_suggestions: list = field(default_factory=list)
    listeners: list = field(default_factory=list)  # asyncio.Queue per WS connection
    started_at: datetime = field(default_factory=datetime.utcnow)

    def add_transcript(self, speaker: str, text: str):
        entry = {
            "speaker": speaker,
            "text": text,
            "timestamp": datetime.utcnow().isoformat(),
        }
        self.transcript.append(entry)
        self._broadcast({"type": "transcript", "data": entry})

    def add_suggestion(self, suggestion: str, reason: str):
        entry = {
            "suggestion": suggestion,
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat(),
        }
        self.ai_suggestions.append(entry)
        self._broadcast({"type": "suggestion", "data": entry})

    def update_status(self, status: str):
        self.status = status
        self._broadcast({"type": "status", "data": {"status": status}})

    def _broadcast(self, msg: dict):
        dead = []
        for q in self.listeners:
            try:
                q.put_nowait(msg)
            except asyncio.QueueFull:
                dead.append(q)
        for q in dead:
            self.listeners.remove(q)


# ---------------------------------------------------------------------------
# Active sessions registry
# ---------------------------------------------------------------------------

_sessions: dict[str, CallSession] = {}


def create_session(call_id: str, lead_id: str, lead_name: str, lead_context: str, phone_number: str) -> CallSession:
    session = CallSession(
        call_id=call_id,
        lead_id=lead_id,
        lead_name=lead_name,
        lead_context=lead_context,
        phone_number=phone_number,
    )
    _sessions[call_id] = session
    return session


def get_session(call_id: str) -> Optional[CallSession]:
    return _sessions.get(call_id)


def remove_session(call_id: str):
    _sessions.pop(call_id, None)


def get_active_sessions() -> dict[str, CallSession]:
    return dict(_sessions)


# ---------------------------------------------------------------------------
# Twilio: initiate outbound call
# ---------------------------------------------------------------------------

PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "")


def initiate_twilio_call(phone_number: str, call_id: str) -> str:
    client = get_twilio_client()
    from_number = os.getenv("TWILIO_PHONE_NUMBER", "")
    status_callback = f"{PUBLIC_BASE_URL}/calls/status-callback/{call_id}" if PUBLIC_BASE_URL else None

    call = client.calls.create(
        to=phone_number,
        from_=from_number,
        twiml="<Response><Say>Hello! You have a call from Aurora Banquets. Please hold.</Say><Pause length='3600'/></Response>",
        **({"status_callback": status_callback, "status_callback_event": ["initiated", "ringing", "answered", "completed"]} if status_callback else {}),
    )
    return call.sid


# ---------------------------------------------------------------------------
# Gemini: real-time coaching suggestion
# ---------------------------------------------------------------------------

async def generate_coaching_suggestion(transcript: list, lead_context: str) -> dict:
    if not is_gemini_configured():
        return {"suggestion": "", "reason": ""}

    try:
        model = get_gemini_model()
        transcript_text = "\n".join(
            f"{e['speaker'].upper()}: {e['text']}" for e in transcript[-8:]  # last 8 messages
        )
        prompt = f"""You are an expert sales coach for a banquet hall business.

Lead context: {lead_context}

Recent conversation:
{transcript_text}

Give ONE short, actionable coaching tip for the sales staff RIGHT NOW.
Respond ONLY in JSON: {{"suggestion": "...", "reason": "..."}}
Keep suggestion under 100 characters. Be specific and direct."""

        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception:
        return {"suggestion": "Ask about their preferred event date and guest count", "reason": "Keep conversation moving"}


# ---------------------------------------------------------------------------
# Gemini: post-call analysis
# ---------------------------------------------------------------------------

async def generate_call_analysis(transcript: list, lead_context: str) -> dict:
    if not is_gemini_configured() or not transcript:
        return {
            "sentiment": "neutral",
            "summary": "Call completed.",
            "key_points": [],
            "suggested_stage": None,
            "action_items": [],
        }

    try:
        model = get_gemini_model()
        transcript_text = "\n".join(
            f"{e['speaker'].upper()}: {e['text']}" for e in transcript
        )
        prompt = f"""You are an expert sales analyst for a banquet hall CRM.

Lead context: {lead_context}

Full call transcript:
{transcript_text}

Analyze this call and respond ONLY in JSON:
{{
  "sentiment": "positive" | "neutral" | "negative",
  "summary": "2-3 sentence summary",
  "key_points": ["point1", "point2"],
  "suggested_stage": "new" | "call" | "visit" | "tasting" | "menu" | "advance" | "converted" | "lost" | null,
  "action_items": ["action1", "action2"]
}}"""

        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception:
        return {
            "sentiment": "neutral",
            "summary": "Call completed. Review transcript for details.",
            "key_points": ["Call conducted successfully"],
            "suggested_stage": "visit",
            "action_items": ["Schedule follow-up visit", "Send venue details via WhatsApp"],
        }
