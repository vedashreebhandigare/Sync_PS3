import { useState, useEffect } from "react";
import { fetchCalendarSummary } from "../../api/client";
import type { CalendarSummary } from "../../api/client";
import CalendarPage from "./CalendarPage";

/* ─── Types ─── */
type BookingsTab = "overview" | "calendar";

/* ─── Stat Pill ─── */
function StatPill({
    count,
    label,
    accent,
}: {
    count: number | null;
    label: string;
    accent: string;
}) {
    return (
        <div
            style={{
                background: "#ffffff",
                border: "1px solid #e8edf2",
                borderRadius: 12,
                padding: "18px 24px",
                flex: 1,
                minWidth: 140,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
        >
            <div style={{ fontSize: 26, fontWeight: 700, color: accent, lineHeight: 1 }}>
                {count === null ? "—" : `+${count}`}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, fontWeight: 500 }}>
                {label}
            </div>
        </div>
    );
}

/* ─── Action Card ─── */
function ActionCard({
    icon,
    title,
    description,
    badge,
    badgeColor,
    arrowColor,
    onClick,
}: {
    icon: string;
    title: string;
    description: string;
    badge?: string;
    badgeColor?: string;
    arrowColor?: string;
    onClick?: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: "#ffffff",
                border: "1px solid #e8edf2",
                borderRadius: 14,
                padding: "24px 28px",
                cursor: "pointer",
                transition: "box-shadow 150ms ease, transform 150ms ease",
                boxShadow: hovered
                    ? "0 6px 20px rgba(0,0,0,0.08)"
                    : "0 1px 3px rgba(0,0,0,0.04)",
                transform: hovered ? "translateY(-2px)" : "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 140,
            }}
        >
            <div>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                    {title}
                </div>
                <div style={{ fontSize: 12.5, color: "#94a3b8", lineHeight: 1.5 }}>{description}</div>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 16,
                }}
            >
                {badge ? (
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: badgeColor ?? "#475569",
                            background: `${badgeColor ?? "#475569"}18`,
                            borderRadius: 20,
                            padding: "3px 10px",
                        }}
                    >
                        {badge}
                    </span>
                ) : (
                    <span />
                )}
                <span style={{ fontSize: 18, color: arrowColor ?? "#94a3b8" }}>→</span>
            </div>
        </div>
    );
}

/* ─── Quick Availability Modal ─── */
function AvailabilityModal({ onClose }: { onClose: () => void }) {
    const [date, setDate] = useState("");
    const [result, setResult] = useState<null | string>(null);
    const [loading, setLoading] = useState(false);

    const checkAvailability = async () => {
        if (!date) return;
        setLoading(true);
        setResult(null);
        try {
            const { fetchCalendarEvents } = await import("../../api/client");
            const events = await fetchCalendarEvents(date, date);
            const bookings = events.filter((e) => e.type === "booking");
            if (bookings.length === 0) {
                setResult("✅ This date is fully available — no bookings found.");
            } else {
                const names = bookings.map((b) => `${b.customer_name} (${b.hall_name ?? "No Hall"})`).join(", ");
                setResult(`⚠️ ${bookings.length} booking(s) on this date: ${names}`);
            }
        } catch {
            setResult("Unable to check — please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.3)",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    padding: 32,
                    width: 420,
                    boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
                    fontFamily: "var(--aurora-font, 'Outfit', system-ui)",
                }}
            >
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>
                    🔍 Check Hall Availability
                </div>
                <label style={{ fontSize: 12.5, color: "#64748b", fontWeight: 500 }}>Date to Check</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setResult(null); }}
                    style={{
                        width: "100%",
                        marginTop: 6,
                        marginBottom: 16,
                        padding: "10px 14px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 14,
                        color: "#0f172a",
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                        background: "#f8fafc",
                    }}
                />
                {result && (
                    <div
                        style={{
                            fontSize: 13,
                            color: "#334155",
                            background: "#f1f5f9",
                            borderRadius: 8,
                            padding: "10px 14px",
                            marginBottom: 16,
                            lineHeight: 1.6,
                        }}
                    >
                        {result}
                    </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                    <button
                        onClick={checkAvailability}
                        disabled={!date || loading}
                        style={{
                            flex: 1,
                            padding: "10px 0",
                            background: "#059669",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: date && !loading ? "pointer" : "not-allowed",
                            opacity: date && !loading ? 1 : 0.6,
                            fontFamily: "inherit",
                        }}
                    >
                        {loading ? "Checking…" : "Check"}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "10px 20px",
                            background: "#f1f5f9",
                            color: "#64748b",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "inherit",
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Bookings Overview Page ─── */
export default function BookingsOverviewPage() {
    const [activeTab, setActiveTab] = useState<BookingsTab>("overview");
    const [summary, setSummary] = useState<CalendarSummary | null>(null);
    const [showAvailability, setShowAvailability] = useState(false);

    useEffect(() => {
        fetchCalendarSummary()
            .then(setSummary)
            .catch(() => setSummary(null));
    }, []);

    // If on Calendar tab, just render the calendar
    if (activeTab === "calendar") {
        return (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#f8fafc" }}>
                {/* Tab Header */}
                <div
                    style={{
                        padding: "12px 28px 0",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        background: "#ffffff",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <Tab label="Overview" active={false} onClick={() => setActiveTab("overview")} />
                    <Tab label="Calendar View" active={true} onClick={() => setActiveTab("calendar")} icon="📅" />
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <CalendarPage />
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "auto",
                background: "#f8fafc",
                fontFamily: "var(--aurora-font, 'Outfit', system-ui)",
            }}
        >
            {/* ─── Tab Header ─── */}
            <div
                style={{
                    padding: "12px 28px 0",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    background: "#ffffff",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <div style={{ marginRight: 16 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Bookings</div>
                    <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                        {summary !== null
                            ? `${summary.today_events + summary.upcoming_7_days} upcoming`
                            : "Loading…"}
                    </div>
                </div>
                <Tab label="Overview" active={true} onClick={() => setActiveTab("overview")} />
                <Tab label="Calendar View" active={false} onClick={() => setActiveTab("calendar")} icon="📅" />
            </div>

            {/* ─── Content ─── */}
            <div style={{ padding: "28px 32px", maxWidth: 860, width: "100%" }}>
                {/* ─── Stat Pills ─── */}
                <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
                    <StatPill
                        count={summary?.today_events ?? null}
                        label="Today's Events"
                        accent="#6366f1"
                    />
                    <StatPill
                        count={summary?.upcoming_7_days ?? null}
                        label="Confirmed This Week"
                        accent="#f59e0b"
                    />
                    <StatPill
                        count={summary?.tentative_holds ?? null}
                        label="Tentative Holds"
                        accent="#22c55e"
                    />
                    <StatPill
                        count={summary?.pending_followups ?? null}
                        label="Follow-ups Today"
                        accent="#f87171"
                    />
                </div>

                {/* ─── Action Cards 2×2 ─── */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 16,
                    }}
                >
                    <ActionCard
                        icon="📅"
                        title="View Interactive Calendar"
                        description="Browse all bookings, availability, and follow-ups in month, week, or day view."
                        arrowColor="#6366f1"
                        onClick={() => setActiveTab("calendar")}
                    />
                    <ActionCard
                        icon="🔍"
                        title="Check Hall Availability"
                        description="Pick a date and instantly see if any hall or venue is free."
                        arrowColor="#f59e0b"
                        onClick={() => setShowAvailability(true)}
                    />
                    <ActionCard
                        icon="📋"
                        title="View All Bookings"
                        description="See a complete list of confirmed, tentative, and past events."
                        badge={summary ? `${summary.tentative_holds} tentative` : undefined}
                        badgeColor="#f59e0b"
                        arrowColor="#22c55e"
                        onClick={() => setActiveTab("calendar")}
                    />
                    <ActionCard
                        icon="📞"
                        title="Pending Follow-ups"
                        description="Clients who are waiting on a call from you today."
                        badge={summary?.pending_followups ? `${summary.pending_followups} today` : "None today"}
                        badgeColor="#f87171"
                        arrowColor="#f87171"
                        onClick={() => setActiveTab("calendar")}
                    />
                </div>
            </div>

            {/* ─── Availability Modal ─── */}
            {showAvailability && (
                <AvailabilityModal onClose={() => setShowAvailability(false)} />
            )}
        </div>
    );
}

/* ─── Shared Tab component ─── */
function Tab({
    label,
    active,
    onClick,
    icon,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    icon?: string;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#0f172a" : "#64748b",
                background: "transparent",
                border: "none",
                borderBottom: active ? "2px solid #059669" : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "color 150ms ease",
                marginBottom: -1,
            }}
        >
            {icon && <span>{icon}</span>}
            {label}
        </button>
    );
}
