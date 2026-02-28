import type { LeadBrief } from "../../types";
import { Badge } from "../ui";
import { formatDate, daysUntil, isUrgent } from "../../utils";

/* ─── Event-type left-border + badge colors (dark mode) ─── */
const EVENT_STYLE: Record<string, { border: string; bg: string; color: string }> = {
  Wedding:            { border: "#fbbf24", bg: "rgba(251,191,36,0.15)",  color: "#fbbf24" },
  "Corporate Event":  { border: "#60a5fa", bg: "rgba(96,165,250,0.15)",  color: "#60a5fa" },
  Reception:          { border: "#f472b6", bg: "rgba(244,114,182,0.15)", color: "#f472b6" },
  "Birthday Party":   { border: "#a78bfa", bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  Conference:         { border: "#38bdf8", bg: "rgba(56,189,248,0.15)",  color: "#38bdf8" },
  Anniversary:        { border: "#fb923c", bg: "rgba(251,146,60,0.15)",  color: "#fb923c" },
  Engagement:         { border: "#e879f9", bg: "rgba(232,121,249,0.15)", color: "#e879f9" },
  "Social Gathering": { border: "#94a3b8", bg: "rgba(148,163,184,0.15)", color: "#94a3b8" },
};

const DEFAULT_STYLE = { border: "#94a3b8", bg: "rgba(148,163,184,0.12)", color: "#94a3b8" };

interface LeadCardProps {
  lead: LeadBrief;
  stageColor: string;
  onClick: (id: string) => void;
}

export default function LeadCard({
  lead,
  stageColor,
  onClick,
}: LeadCardProps): JSX.Element {
  const days = daysUntil(lead.event_date);
  const urgent = isUrgent(lead.event_date);
  const evStyle = EVENT_STYLE[lead.event_type] ?? DEFAULT_STYLE;

  return (
    <div
      onClick={() => onClick(lead.id)}
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px 14px 18px",
        cursor: "pointer",
        border: "1px solid var(--border-default)",
        /* ── Colored left accent border ── */
        borderLeft: `4px solid ${evStyle.border}`,
        transition: "all var(--transition-normal)",
        boxShadow: "var(--shadow-sm)",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-md)";
        el.style.transform = "translateY(-1px)";
        el.style.borderColor = "rgba(255,255,255,0.1)";
        el.style.borderLeftColor = evStyle.border;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-sm)";
        el.style.transform = "none";
        el.style.borderColor = "";
        el.style.borderLeftColor = evStyle.border;
      }}
    >
      {/* Name + Event badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>
          {lead.name}
        </div>
        <Badge color={evStyle.color} bg={evStyle.bg}>
          {lead.event_type}
        </Badge>
      </div>

      {/* Date + guests */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: urgent ? "var(--danger)" : "var(--text-secondary)", fontFamily: "var(--font-primary)", fontWeight: urgent ? 600 : 400, display: "flex", alignItems: "center", gap: 4 }}>
          📅 {formatDate(lead.event_date)}
          {urgent && days !== null && (
            <span style={{ background: "var(--danger-bg)", color: "var(--danger)", fontSize: 9.5, padding: "1px 6px", borderRadius: "var(--radius-lg)", fontWeight: 700 }}>
              In {days}d
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-primary)" }}>
          👥 {lead.guest_count} guests
        </div>
      </div>

      {/* Budget + branch */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>
          {lead.budget}
        </span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-primary)", background: "var(--bg-section)", padding: "2px 7px", borderRadius: 5, fontWeight: 500, border: "1px solid var(--border-default)" }}>
          {lead.branch}
        </span>
      </div>
    </div>
  );
}
