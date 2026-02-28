import { useState, useEffect } from "react";
import * as api from "../../api/client";
import type { GoogleAuthStatus } from "../../api/client";

export default function SettingsPage() {
    const [status, setStatus] = useState<GoogleAuthStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.fetchGoogleAuthStatus()
            .then((data) => {
                setStatus(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch Google Auth Status", err);
                setLoading(false);
            });
    }, []);

    const handleConnect = () => {
        // Redirect to the backend OAuth login route
        window.location.href = "http://localhost:8000/api/auth/google/login";
    };

    if (loading) {
        return (
            <div style={{ padding: 40, color: "#94a3b8", fontFamily: "var(--aurora-font, 'Outfit', system-ui)" }}>
                Loading settings...
            </div>
        );
    }

    return (
        <div
            style={{
                flex: 1,
                padding: "40px",
                overflow: "auto",
                background: "#0f172a",
                fontFamily: "var(--aurora-font, 'Outfit', system-ui)",
                color: "#e2e8f0",
            }}
        >
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: -0.5 }}>Settings</h1>
            <p style={{ color: "#94a3b8", marginBottom: 32 }}>Manage your Aurora dashboard integrations and preferences.</p>

            <div
                style={{
                    background: "#1e293b",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 12,
                    padding: 24,
                    maxWidth: 500,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: "rgba(255,255,255,0.05)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 20,
                        }}
                    >
                        📅
                    </div>
                    <div>
                        <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Google Calendar Sync</h2>
                        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>
                            Automatically sync confirmed bookings to your Google Calendar.
                        </div>
                    </div>
                </div>

                {!status?.has_credentials_json && (
                    <div
                        style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#fca5a5",
                            padding: "12px 16px",
                            borderRadius: 8,
                            fontSize: 13,
                            marginBottom: 20,
                            lineHeight: 1.5,
                        }}
                    >
                        <strong>Action Required:</strong> The backend is missing <code>credentials.json</code>. You must create a Google Cloud Project, enable the Calendar API, and save your OAuth Client ID credentials to the backend folder before connecting.
                    </div>
                )}

                <div
                    style={{
                        padding: 16,
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                background: status?.connected ? "#22c55e" : "#64748b",
                                boxShadow: status?.connected ? "0 0 10px rgba(34, 197, 94, 0.4)" : "none",
                            }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 500, color: status?.connected ? "#e2e8f0" : "#94a3b8" }}>
                            {status?.connected ? "Connected to Google" : "Not Connected"}
                        </span>
                    </div>

                    <button
                        onClick={handleConnect}
                        disabled={!status?.has_credentials_json && !status?.connected}
                        style={{
                            padding: "8px 16px",
                            background: status?.connected ? "rgba(255,255,255,0.05)" : "#3b82f6",
                            color: status?.connected ? "#e2e8f0" : "#white",
                            border: status?.connected ? "1px solid rgba(255,255,255,0.1)" : "none",
                            borderRadius: 6,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: (!status?.has_credentials_json && !status?.connected) ? "not-allowed" : "pointer",
                            opacity: (!status?.has_credentials_json && !status?.connected) ? 0.5 : 1,
                            transition: "all 0.2s",
                        }}
                    >
                        {status?.connected ? "Reconnect" : "Connect Account"}
                    </button>
                </div>

                {status?.connected && status.calendar_id && (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>
                        Syncing to calendar ID: <code>{status.calendar_id}</code>
                    </div>
                )}
            </div>
        </div>
    );
}
