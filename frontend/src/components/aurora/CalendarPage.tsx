import { useState, useRef } from "react";
import useCalendar from "../../hooks/useCalendar";
import type { CalendarView } from "../../hooks/useCalendar";
import type { CalendarEvent } from "../../api/client";

/* ─── Status → Color mapping ─── */
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    tentative: { bg: "rgba(251, 191, 36, 0.15)", border: "rgba(251, 191, 36, 0.4)", text: "#d97706" },
    confirmed: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.4)", text: "#16a34a" },
    done: { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.35)", text: "#dc2626" },
};

const FOLLOW_UP_STYLE = {
    bg: "rgba(99, 102, 241, 0.12)",
    border: "rgba(99, 102, 241, 0.35)",
    text: "#4f46e5",
};

/* ─── Month names ─── */
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ─── Format currency ─── */
function formatCurrency(n: number): string {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
    return `₹${n.toFixed(0)}`;
}

/* ─── Tooltip Component ─── */
function EventTooltip({ event, position }: { event: CalendarEvent; position: { x: number; y: number } }) {
    return (
        <div
            style={{
                position: "fixed",
                left: position.x + 8,
                top: position.y - 10,
                zIndex: 1000,
                background: "#ffffff",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 10,
                padding: "12px 16px",
                minWidth: 220,
                maxWidth: 300,
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                fontFamily: "var(--aurora-font, 'Outfit', system-ui)",
                pointerEvents: "none",
            }}
        >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>
                {event.customer_name}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Row label="Event" value={event.event_type} />
                <Row label="Guests" value={String(event.guest_count)} />
                {event.hall_name && <Row label="Hall" value={event.hall_name} />}
                <Row
                    label="Payment"
                    value={`${formatCurrency(event.advance_paid)} / ${formatCurrency(event.total_cost)}`}
                />
                <Row label="Status" value={event.status.charAt(0).toUpperCase() + event.status.slice(1)} />
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>{label}</span>
            <span style={{ fontSize: 11.5, color: "#334155", fontWeight: 500 }}>{value}</span>
        </div>
    );
}

/* ─── Event Block Component ─── */
function EventBlock({
    event,
    onHover,
    onLeave,
}: {
    event: CalendarEvent;
    onHover: (e: React.MouseEvent, ev: CalendarEvent) => void;
    onLeave: () => void;
}) {
    const isFollowUp = event.type === "follow_up";
    const colors = isFollowUp ? FOLLOW_UP_STYLE : (STATUS_COLORS[event.status] ?? STATUS_COLORS.tentative);

    return (
        <div
            onMouseEnter={(e) => onHover(e, event)}
            onMouseLeave={onLeave}
            style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                borderRadius: 5,
                padding: "3px 6px",
                fontSize: 10.5,
                fontWeight: 500,
                color: colors.text,
                cursor: "default",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.3,
                marginBottom: 2,
            }}
        >
            {isFollowUp ? "📞 " : ""}{event.customer_name}
            {event.hall_name ? ` · ${event.hall_name}` : ""}
        </div>
    );
}

/* ─── Generate month calendar grid ─── */
function getMonthGrid(year: number, month: number): (Date | null)[][] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const weeks: (Date | null)[][] = [];
    let week: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) week.push(null);
    for (let d = 1; d <= totalDays; d++) {
        week.push(new Date(year, month, d));
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }
    if (week.length > 0) {
        while (week.length < 7) week.push(null);
        weeks.push(week);
    }
    return weeks;
}

function getWeekDates(d: Date): Date[] {
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const dd = new Date(start);
        dd.setDate(start.getDate() + i);
        dates.push(dd);
    }
    return dates;
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(d: Date): boolean {
    return isSameDay(d, new Date());
}

function dateKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ─── Main Calendar Page ─── */
export default function CalendarPage() {
    const {
        events,
        loading,
        currentDate,
        view,
        setView,
        goNext,
        goPrev,
        goToday,
        branchFilter,
        setBranchFilter,
        hallFilter,
        setHallFilter,
        branches,
        halls,
    } = useCalendar();

    const [tooltip, setTooltip] = useState<{ event: CalendarEvent; pos: { x: number; y: number } } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleHover = (e: React.MouseEvent, event: CalendarEvent) => {
        setTooltip({ event, pos: { x: e.clientX, y: e.clientY } });
    };
    const handleLeave = () => setTooltip(null);

    // Group events by date string
    const eventsByDate: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
        const key = ev.date;
        if (!eventsByDate[key]) eventsByDate[key] = [];
        eventsByDate[key].push(ev);
    });

    /* ─── View title ─── */
    const title = (() => {
        if (view === "month") return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        if (view === "week") {
            const dates = getWeekDates(currentDate);
            const s = dates[0];
            const e = dates[6];
            if (s.getMonth() === e.getMonth()) {
                return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${e.getDate()}, ${s.getFullYear()}`;
            }
            return `${MONTHS[s.getMonth()].slice(0, 3)} ${s.getDate()} – ${MONTHS[e.getMonth()].slice(0, 3)} ${e.getDate()}, ${s.getFullYear()}`;
        }
        return `${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    })();

    /* ─── Render grid based on view ─── */
    const renderMonthGrid = () => {
        const grid = getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());

        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Day headers */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    {DAYS.map((d) => (
                        <div
                            key={d}
                            style={{
                                padding: "8px 0",
                                textAlign: "center",
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#64748b",
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}
                        >
                            {d}
                        </div>
                    ))}
                </div>

                {/* Weeks */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
                    {grid.map((week, wi) => (
                        <div
                            key={wi}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, 1fr)",
                                flex: 1,
                                minHeight: 90,
                            }}
                        >
                            {week.map((day, di) => {
                                if (!day) {
                                    return (
                                        <div
                                            key={`empty-${di}`}
                                            style={{
                                                borderRight: di < 6 ? "1px solid rgba(0,0,0,0.04)" : "none",
                                                borderBottom: "1px solid rgba(0,0,0,0.04)",
                                                background: "rgba(0,0,0,0.02)",
                                            }}
                                        />
                                    );
                                }

                                const key = dateKey(day);
                                const dayEvents = eventsByDate[key] || [];
                                const today = isToday(day);

                                return (
                                    <div
                                        key={key}
                                        style={{
                                            borderRight: di < 6 ? "1px solid rgba(0,0,0,0.04)" : "none",
                                            borderBottom: "1px solid rgba(0,0,0,0.04)",
                                            padding: 4,
                                            display: "flex",
                                            flexDirection: "column",
                                            overflow: "hidden",
                                            background: today ? "rgba(5,150,105,0.04)" : "transparent",
                                        }}
                                    >
                                        {/* Day number */}
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: today ? 700 : 400,
                                                color: today ? "#059669" : "#64748b",
                                                marginBottom: 2,
                                                padding: "0 2px",
                                                ...(today ? {
                                                    background: "rgba(5,150,105,0.15)",
                                                    borderRadius: "50%",
                                                    width: 24,
                                                    height: 24,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                } : {}),
                                            }}
                                        >
                                            {day.getDate()}
                                        </div>

                                        {/* Events */}
                                        <div style={{ flex: 1, overflow: "hidden" }}>
                                            {dayEvents.slice(0, 3).map((ev) => (
                                                <EventBlock key={ev.id} event={ev} onHover={handleHover} onLeave={handleLeave} />
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <div style={{ fontSize: 10, color: "#64748b", paddingLeft: 4 }}>
                                                    +{dayEvents.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderWeekGrid = () => {
        const dates = getWeekDates(currentDate);
        return (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", flex: 1, overflow: "auto" }}>
                    {dates.map((day) => {
                        const key = dateKey(day);
                        const dayEvents = eventsByDate[key] || [];
                        const today = isToday(day);

                        return (
                            <div
                                key={key}
                                style={{
                                    borderRight: "1px solid rgba(0,0,0,0.04)",
                                    padding: 8,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    background: today ? "rgba(5,150,105,0.04)" : "transparent",
                                }}
                            >
                                <div style={{ textAlign: "center", marginBottom: 6 }}>
                                    <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                        {DAYS[day.getDay()]}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 20,
                                            fontWeight: today ? 700 : 400,
                                            color: today ? "#059669" : "#0f172a",
                                            marginTop: 2,
                                        }}
                                    >
                                        {day.getDate()}
                                    </div>
                                </div>
                                <div style={{ flex: 1, overflow: "auto" }}>
                                    {dayEvents.map((ev) => (
                                        <EventBlock key={ev.id} event={ev} onHover={handleHover} onLeave={handleLeave} />
                                    ))}
                                    {dayEvents.length === 0 && (
                                        <div style={{ fontSize: 10.5, color: "#475569", textAlign: "center", paddingTop: 12 }}>
                                            No events
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const key = dateKey(currentDate);
        const dayEvents = eventsByDate[key] || [];
        const bookings = dayEvents.filter((e) => e.type === "booking");
        const followUps = dayEvents.filter((e) => e.type === "follow_up");

        return (
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
                <div style={{ maxWidth: 600 }}>
                    {/* Bookings */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Bookings ({bookings.length})
                        </div>
                        {bookings.length === 0 && (
                            <div style={{ fontSize: 13, color: "#475569", padding: "12px 0" }}>No bookings for this day</div>
                        )}
                        {bookings.map((ev) => {
                            const colors = STATUS_COLORS[ev.status] ?? STATUS_COLORS.tentative;
                            return (
                                <div
                                    key={ev.id}
                                    onMouseEnter={(e) => handleHover(e, ev)}
                                    onMouseLeave={handleLeave}
                                    style={{
                                        background: "#ffffff",
                                        border: `1px solid ${colors.border}`,
                                        borderLeft: `4px solid ${colors.text}`,
                                        borderRadius: 8,
                                        padding: "12px 16px",
                                        marginBottom: 8,
                                        cursor: "default",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                                                {ev.customer_name}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                                {ev.event_type} · {ev.guest_count} guests
                                                {ev.hall_name ? ` · ${ev.hall_name}` : ""}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, color: colors.text }}>
                                                {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                                                {formatCurrency(ev.advance_paid)} / {formatCurrency(ev.total_cost)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Follow-ups */}
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Follow-ups ({followUps.length})
                        </div>
                        {followUps.length === 0 && (
                            <div style={{ fontSize: 13, color: "#475569", padding: "12px 0" }}>No follow-ups for this day</div>
                        )}
                        {followUps.map((ev) => (
                            <div
                                key={ev.id}
                                onMouseEnter={(e) => handleHover(e, ev)}
                                onMouseLeave={handleLeave}
                                style={{
                                    background: "#ffffff",
                                    border: `1px solid ${FOLLOW_UP_STYLE.border}`,
                                    borderLeft: `4px solid ${FOLLOW_UP_STYLE.text}`,
                                    borderRadius: 8,
                                    padding: "12px 16px",
                                    marginBottom: 8,
                                    cursor: "default",
                                }}
                            >
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
                                    📞 {ev.customer_name}
                                </div>
                                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                                    {ev.event_type} · Follow-up scheduled
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    /* ─── View toggle buttons ─── */
    const VIEW_OPTIONS: { key: CalendarView; label: string }[] = [
        { key: "month", label: "Month" },
        { key: "week", label: "Week" },
        { key: "day", label: "Day" },
    ];

    /* ─── Status legend ─── */
    const LEGEND = [
        { label: "Tentative", color: "#fbbf24" },
        { label: "Confirmed", color: "#22c55e" },
        { label: "Done", color: "#ef4444" },
        { label: "Follow-up", color: "#818cf8" },
    ];

    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                background: "#f8fafc",
                fontFamily: "var(--aurora-font, 'Outfit', system-ui)",
            }}
        >
            {/* ── Top Bar ── */}
            <div
                style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                {/* Left: nav + title */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button onClick={goPrev} style={navBtnStyle}>
                        ‹
                    </button>
                    <button
                        onClick={goToday}
                        style={{
                            ...navBtnStyle,
                            fontSize: 11.5,
                            fontWeight: 600,
                            padding: "5px 12px",
                        }}
                    >
                        Today
                    </button>
                    <button onClick={goNext} style={navBtnStyle}>
                        ›
                    </button>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 17,
                            fontWeight: 700,
                            color: "#0f172a",
                            letterSpacing: -0.3,
                            marginLeft: 4,
                        }}
                    >
                        {title}
                    </h1>
                    {loading && (
                        <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>Loading…</span>
                    )}
                </div>

                {/* Right: filters + view toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Branch filter */}
                    <select
                        value={branchFilter}
                        onChange={(e) => setBranchFilter(e.target.value)}
                        style={selectStyle}
                    >
                        <option value="">All Branches</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>

                    {/* Hall filter */}
                    {halls.length > 0 && (
                        <select
                            value={hallFilter}
                            onChange={(e) => setHallFilter(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">All Halls</option>
                            {halls.map((h) => (
                                <option key={h.id} value={h.id}>
                                    {h.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* View toggle */}
                    <div
                        style={{
                            display: "flex",
                            background: "#ffffff",
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            overflow: "hidden",
                        }}
                    >
                        {VIEW_OPTIONS.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setView(opt.key)}
                                style={{
                                    padding: "5px 14px",
                                    fontSize: 12,
                                    fontWeight: view === opt.key ? 600 : 400,
                                    color: view === opt.key ? "#059669" : "#64748b",
                                    background: view === opt.key ? "rgba(5,150,105,0.1)" : "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    transition: "all 150ms ease",
                                }}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Legend ── */}
            <div
                style={{
                    padding: "6px 20px",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    flexShrink: 0,
                }}
            >
                {LEGEND.map((item) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: item.color,
                                display: "inline-block",
                                flexShrink: 0,
                            }}
                        />
                        <span style={{ fontSize: 11, color: "#64748b" }}>{item.label}</span>
                    </div>
                ))}
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: "#475569" }}>
                    {events.length} event{events.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Calendar Grid ── */}
            {view === "month" && renderMonthGrid()}
            {view === "week" && renderWeekGrid()}
            {view === "day" && renderDayView()}

            {/* ── Tooltip ── */}
            {tooltip && <EventTooltip event={tooltip.event} position={tooltip.pos} />}
        </div>
    );
}

/* ─── Shared styles ─── */
const navBtnStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    color: "#475569",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 400,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
    transition: "all 150ms ease",
};

const selectStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    color: "#475569",
    fontSize: 12.5,
    padding: "6px 10px",
    outline: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    minWidth: 120,
};
