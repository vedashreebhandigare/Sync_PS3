import { useState, useEffect, useRef, useCallback } from "react";
import { initiateCall, hangupCall, fetchLeadCalls, fetchCallConfigStatus } from "../../api/client";
import { fetchLeads } from "../../api/client";
import type { LeadBrief, LeadFilters, CallRecord, TranscriptEntry, AISuggestion, CallStatus } from "../../types";

/* ─── Styles ─── */
const FONT = "var(--aurora-font, 'Outfit', system-ui)";

/* ─── Main Page ─── */
export default function CallCoachingPage() {
    const [view, setView] = useState<"new-call" | "active" | "history">("new-call");
    const [leads, setLeads] = useState<LeadBrief[]>([]);
    const [selectedLead, setSelectedLead] = useState<LeadBrief | null>(null);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [callId, setCallId] = useState<string | null>(null);
    const [callStatus, setCallStatus] = useState<CallStatus>("initiated");
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
    const [callTimer, setCallTimer] = useState(0);
    const [error, setError] = useState("");
    const [config, setConfig] = useState({ twilio_configured: false, gemini_configured: false });
    const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
    const [search, setSearch] = useState("");
    const wsRef = useRef<WebSocket | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Load leads and config
    useEffect(() => {
        fetchLeads({ search: "", branch: "", event_type: "", source: "" } as LeadFilters).then(setLeads).catch(() => { });
        fetchCallConfigStatus().then(setConfig).catch(() => { });
    }, []);

    // Auto-scroll transcript
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcript]);

    // Timer
    useEffect(() => {
        if (callStatus === "in-progress") {
            timerRef.current = setInterval(() => setCallTimer((t) => t + 1), 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [callStatus]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    // Connect WebSocket for live updates
    const connectWS = useCallback((cId: string) => {
        const ws = new WebSocket(`ws://localhost:8000/calls/live/${cId}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            if (msg.type === "transcript") {
                setTranscript((prev) => [...prev, msg.data]);
            } else if (msg.type === "suggestion") {
                setSuggestions((prev) => [...prev, msg.data]);
            } else if (msg.type === "status") {
                setCallStatus(msg.data.status);
            }
        };

        ws.onclose = () => { wsRef.current = null; };
        ws.onerror = () => { ws.close(); };
    }, []);

    // Start call
    const handleStartCall = async () => {
        if (!selectedLead || !phoneNumber.trim()) {
            setError("Select a lead and enter a phone number");
            return;
        }
        setError("");
        setTranscript([]);
        setSuggestions([]);
        setCallTimer(0);
        setAnalysis(null);

        try {
            const result = await initiateCall(selectedLead.id, phoneNumber);
            setCallId(result.call_id);
            setCallStatus(result.status as CallStatus);
            setView("active");
            connectWS(result.call_id);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to initiate call");
        }
    };

    // End call
    const handleEndCall = async () => {
        if (!callId) return;
        try {
            const result = await hangupCall(callId);
            setCallStatus("completed");
            setAnalysis(result.analysis);
            if (wsRef.current) wsRef.current.close();
            if (timerRef.current) clearInterval(timerRef.current);
        } catch {
            setError("Failed to end call");
        }
    };

    // Load call history
    const loadHistory = async () => {
        setView("history");
        try {
            const allCalls: CallRecord[] = [];
            for (const lead of leads.slice(0, 20)) {
                const calls = await fetchLeadCalls(lead.id);
                allCalls.push(...calls);
            }
            allCalls.sort((a, b) => new Date(b.start_time ?? b.started_at ?? "").getTime() - new Date(a.start_time ?? a.started_at ?? "").getTime());
            setCallHistory(allCalls);
        } catch {
            setCallHistory([]);
        }
    };

    // Back to new call
    const handleNewCall = () => {
        setView("new-call");
        setCallId(null);
        setCallStatus("initiated");
        setTranscript([]);
        setSuggestions([]);
        setCallTimer(0);
        setAnalysis(null);
        setError("");
        if (wsRef.current) wsRef.current.close();
    };

    const filteredLeads = leads.filter(
        (l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search)
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#f8fafc", fontFamily: FONT }}>
            {/* Tab Bar */}
            <div style={{
                padding: "12px 28px 0",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
            }}>
                <div style={{ marginRight: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>📞 Call Coach</div>
                    <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                        {config.twilio_configured ? "Twilio ✓" : "Demo Mode"} · {config.gemini_configured ? "Gemini AI ✓" : "Gemini ✗"}
                    </div>
                </div>
                <TabBtn label="New Call" active={view === "new-call"} onClick={handleNewCall} />
                <TabBtn label="Active Call" active={view === "active"} onClick={() => callId && setView("active")} disabled={!callId} />
                <TabBtn label="Call History" active={view === "history"} onClick={loadHistory} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
                {view === "new-call" && (
                    <NewCallView
                        leads={filteredLeads}
                        selectedLead={selectedLead}
                        onSelectLead={(l) => { setSelectedLead(l); setPhoneNumber(l.phone); }}
                        phoneNumber={phoneNumber}
                        onPhoneChange={setPhoneNumber}
                        search={search}
                        onSearchChange={setSearch}
                        onStartCall={handleStartCall}
                        error={error}
                        config={config}
                    />
                )}
                {view === "active" && (
                    <ActiveCallView
                        leadName={selectedLead?.name ?? "Unknown"}
                        leadContext={selectedLead ? `${selectedLead.event_type} · ${selectedLead.guest_count} guests · ₹${selectedLead.budget}` : ""}
                        phoneNumber={phoneNumber}
                        callStatus={callStatus}
                        timer={formatTime(callTimer)}
                        transcript={transcript}
                        suggestions={suggestions}
                        analysis={analysis}
                        transcriptEndRef={transcriptEndRef}
                        onEndCall={handleEndCall}
                        onNewCall={handleNewCall}
                    />
                )}
                {view === "history" && (
                    <CallHistoryView calls={callHistory} leads={leads} />
                )}
            </div>
        </div>
    );
}

/* ─── Tab Button ─── */
function TabBtn({ label, active, onClick, disabled }: { label: string; active: boolean; onClick: () => void; disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#0f172a" : disabled ? "#cbd5e1" : "#64748b",
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
                cursor: disabled ? "default" : "pointer",
                fontFamily: "inherit",
                marginBottom: -1,
            }}
        >{label}</button>
    );
}

/* ─── New Call View ─── */
function NewCallView({
    leads, selectedLead, onSelectLead, phoneNumber, onPhoneChange,
    search, onSearchChange, onStartCall, error, config,
}: {
    leads: LeadBrief[];
    selectedLead: LeadBrief | null;
    onSelectLead: (l: LeadBrief) => void;
    phoneNumber: string;
    onPhoneChange: (v: string) => void;
    search: string;
    onSearchChange: (v: string) => void;
    onStartCall: () => void;
    error: string;
    config: { twilio_configured: boolean; gemini_configured: boolean };
}) {
    return (
        <div style={{ maxWidth: 720 }}>
            {!config.twilio_configured && (
                <div style={{
                    background: "rgba(251, 191, 36, 0.1)",
                    border: "1px solid rgba(251, 191, 36, 0.3)",
                    borderRadius: 10,
                    padding: "14px 18px",
                    marginBottom: 20,
                    fontSize: 13,
                    color: "#92400e",
                    lineHeight: 1.5,
                }}>
                    <strong>Demo Mode:</strong> Twilio is not configured. Calls will be simulated with a demo script. Add your Twilio credentials to <code>.env</code> for real calls.
                </div>
            )}

            {/* Lead Selector */}
            <div style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 14, padding: "20px 24px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>1. Select a Lead</div>
                <input
                    type="text"
                    placeholder="Search leads by name or phone..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "inherit", background: "#f8fafc", boxSizing: "border-box", marginBottom: 10 }}
                />
                <div style={{ maxHeight: 200, overflow: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                    {leads.slice(0, 15).map((lead) => (
                        <div
                            key={lead.id}
                            onClick={() => onSelectLead(lead)}
                            style={{
                                padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                                background: selectedLead?.id === lead.id ? "rgba(99, 102, 241, 0.08)" : "transparent",
                                border: selectedLead?.id === lead.id ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                                display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 120ms ease",
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{lead.name}</div>
                                <div style={{ fontSize: 11, color: "#64748b" }}>{lead.event_type} · {lead.stage}</div>
                            </div>
                            <div style={{ fontSize: 12, color: "#64748b" }}>{lead.phone || "No phone"}</div>
                        </div>
                    ))}
                    {leads.length === 0 && <div style={{ fontSize: 13, color: "#94a3b8", padding: 12, textAlign: "center" }}>No leads found</div>}
                </div>
            </div>

            {/* Phone Input */}
            <div style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 14, padding: "20px 24px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>2. Confirm Phone Number</div>
                <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 16, fontWeight: 600, outline: "none", fontFamily: "inherit", background: "#f8fafc", boxSizing: "border-box", letterSpacing: 1 }}
                />
            </div>

            {error && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>⚠️ {error}</div>}

            <button
                onClick={onStartCall}
                disabled={!selectedLead || !phoneNumber.trim()}
                style={{
                    width: "100%", padding: "16px 0",
                    background: selectedLead && phoneNumber.trim() ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "#cbd5e1",
                    color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700,
                    cursor: selectedLead && phoneNumber.trim() ? "pointer" : "not-allowed",
                    fontFamily: "inherit", transition: "all 200ms ease",
                    boxShadow: selectedLead && phoneNumber.trim() ? "0 4px 20px rgba(99, 102, 241, 0.4)" : "none",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
            >
                📞 Start Call {!config.twilio_configured && "(Demo)"}
            </button>
        </div>
    );
}

/* ─── Active Call View ─── */
function ActiveCallView({
    leadName, leadContext, phoneNumber, callStatus, timer,
    transcript, suggestions, analysis, transcriptEndRef,
    onEndCall, onNewCall,
}: {
    leadName: string;
    leadContext: string;
    phoneNumber: string;
    callStatus: CallStatus;
    timer: string;
    transcript: TranscriptEntry[];
    suggestions: AISuggestion[];
    analysis: Record<string, unknown> | null;
    transcriptEndRef: React.RefObject<HTMLDivElement | null>;
    onEndCall: () => void;
    onNewCall: () => void;
}) {
    const isActive = callStatus === "in-progress" || callStatus === "ringing" || callStatus === "initiated";

    return (
        <div style={{ display: "flex", gap: 20, height: "100%", minHeight: 400 }}>
            {/* Left: Transcript */}
            <div style={{ flex: 2, display: "flex", flexDirection: "column" }}>
                <div style={{
                    background: isActive ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "#059669",
                    borderRadius: 14, padding: "16px 24px", color: "#fff", marginBottom: 12,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{leadName}</div>
                        <div style={{ fontSize: 12, opacity: 0.8 }}>{phoneNumber} · {leadContext}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{timer}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, background: "rgba(255,255,255,0.2)", padding: "2px 10px", borderRadius: 20, display: "inline-block" }}>
                            {callStatus === "in-progress" ? "🔴 LIVE" : callStatus.toUpperCase()}
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, background: "#fff", border: "1px solid #e8edf2", borderRadius: 14, padding: "16px 20px", overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Live Transcript</div>
                    {transcript.length === 0 && (
                        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 32 }}>
                            {isActive ? "Waiting for conversation to begin..." : "No transcript available"}
                        </div>
                    )}
                    {transcript.map((entry, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, flexDirection: entry.speaker === "client" ? "row-reverse" : "row" }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: entry.speaker === "staff" ? "#6366f1" : entry.speaker === "client" ? "#f59e0b" : "#64748b",
                                color: "#fff", fontSize: 12, fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            }}>
                                {entry.speaker === "staff" ? "S" : entry.speaker === "client" ? "C" : "✦"}
                            </div>
                            <div style={{
                                maxWidth: "70%",
                                background: entry.speaker === "staff" ? "rgba(99, 102, 241, 0.08)" : entry.speaker === "client" ? "rgba(245, 158, 11, 0.08)" : "rgba(100,116,139,0.08)",
                                borderRadius: 10, padding: "8px 14px", fontSize: 13, color: "#0f172a", lineHeight: 1.5,
                            }}>{entry.text}</div>
                        </div>
                    ))}
                    <div ref={transcriptEndRef} />
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    {isActive ? (
                        <button onClick={onEndCall} style={{ flex: 1, padding: "14px 0", background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            🔴 End Call & Analyze
                        </button>
                    ) : (
                        <button onClick={onNewCall} style={{ flex: 1, padding: "14px 0", background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                            📞 Start New Call
                        </button>
                    )}
                </div>
            </div>

            {/* Right: AI Suggestions + Analysis */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 14, padding: "16px 20px", flex: 1, overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>🤖 AI Coach Suggestions</div>
                    {suggestions.length === 0 && (
                        <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: 20 }}>AI suggestions will appear as the conversation progresses...</div>
                    )}
                    {suggestions.map((s, i) => (
                        <div key={i} style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(79,70,229,0.04))", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#4f46e5", lineHeight: 1.5 }}>💡 {s.suggestion}</div>
                            {s.reason && <div style={{ fontSize: 11, color: "#6366f1", marginTop: 4, opacity: 0.7 }}>{s.reason}</div>}
                        </div>
                    ))}
                </div>

                {analysis && (
                    <div style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>📊 Post-Call Analysis</div>
                        <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.6 }}>
                            <div style={{ marginBottom: 6 }}>
                                <strong>Sentiment:</strong>{" "}
                                <span style={{ color: (analysis as Record<string, string>).sentiment === "positive" ? "#059669" : (analysis as Record<string, string>).sentiment === "negative" ? "#dc2626" : "#f59e0b", fontWeight: 600 }}>
                                    {((analysis as Record<string, string>).sentiment ?? "neutral").toUpperCase()}
                                </span>
                            </div>
                            {(analysis as Record<string, string>).summary && <div style={{ marginBottom: 6 }}><strong>Summary:</strong> {(analysis as Record<string, string>).summary}</div>}
                            {(analysis as Record<string, string>).suggested_stage && (
                                <div style={{ marginBottom: 6 }}>
                                    <strong>Suggested Stage:</strong>{" "}
                                    <span style={{ background: "rgba(99,102,241,0.1)", color: "#4f46e5", padding: "2px 8px", borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                                        {(analysis as Record<string, string>).suggested_stage}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Call History View ─── */
function CallHistoryView({ calls, leads }: { calls: CallRecord[]; leads: LeadBrief[] }) {
    const leadMap = Object.fromEntries(leads.map((l) => [l.id, l]));

    return (
        <div style={{ maxWidth: 900 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 16 }}>Call History</div>
            {calls.length === 0 && (
                <div style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 14, padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
                    No calls recorded yet. Start your first call from the "New Call" tab!
                </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {calls.map((call) => {
                    const lead = leadMap[call.lead_id];
                    let analysisData: Record<string, string> | null = null;
                    try { analysisData = (call.analysis || call.ai_analysis) ? JSON.parse(call.analysis ?? call.ai_analysis ?? "{}") : null; } catch { /* ignore */ }
                    const startedAt = call.start_time ?? call.started_at ?? "";

                    return (
                        <div key={call.id} style={{ background: "#fff", border: "1px solid #e8edf2", borderRadius: 12, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{lead?.name ?? "Unknown Lead"}</div>
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                    {call.phone_number && `${call.phone_number} · `}{startedAt && new Date(startedAt).toLocaleString()} · {Math.floor(call.duration_seconds / 60)}m {call.duration_seconds % 60}s
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {analysisData?.sentiment && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 600,
                                        color: analysisData.sentiment === "positive" ? "#059669" : analysisData.sentiment === "negative" ? "#dc2626" : "#f59e0b",
                                        background: analysisData.sentiment === "positive" ? "rgba(5,150,105,0.1)" : analysisData.sentiment === "negative" ? "rgba(220,38,38,0.1)" : "rgba(245,158,11,0.1)",
                                        padding: "3px 10px", borderRadius: 20,
                                    }}>
                                        {analysisData.sentiment.toUpperCase()}
                                    </span>
                                )}
                                <span style={{
                                    fontSize: 11, fontWeight: 600,
                                    color: call.status === "completed" ? "#059669" : "#dc2626",
                                    background: call.status === "completed" ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)",
                                    padding: "3px 10px", borderRadius: 20,
                                }}>
                                    {call.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
