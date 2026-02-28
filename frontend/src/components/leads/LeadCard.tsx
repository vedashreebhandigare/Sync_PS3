import type { LeadBrief } from "../../types";
import { Badge } from "../ui";
import { formatDate, daysUntil, isUrgent } from "../../utils";
import { EVENT_TYPE_COLORS } from "../../constants";

/* ─── Dark-mode event type badge colors ─── */
const DARK_EVENT_COLORS: Record<string, { bg: string; color: string }> = {
  Wedding: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  "Corporate Event": { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
  Reception: { bg: "rgba(244,114,182,0.15)", color: "#f472b6" },
  "Birthday Party": { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  Conference: { bg: "rgba(56,189,248,0.15)", color: "#38bdf8" },
  Anniversary: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  Engagement: { bg: "rgba(244,114,182,0.15)", color: "#f472b6" },
  "Social Gathering": { bg: "rgba(148,163,184,0.15)", color: "#94a3b8" },
};

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
  const typeStyle = DARK_EVENT_COLORS[lead.event_type] ?? { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" };

  return (
    <div
      onClick={() => onClick(lead.id)}
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 18px",
        cursor: "pointer",
        border: "1px solid var(--border-default)",
        transition: "all var(--transition-normal)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-md)";
        el.style.transform = "translateY(-1px)";
        el.style.borderColor = "rgba(255,255,255,0.1)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-sm)";
        el.style.transform = "none";
        el.style.borderColor = "";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>
          {lead.name}
        </div>
        <Badge color={typeStyle.color} bg={typeStyle.bg}>
          {lead.event_type}
        </Badge>
      </div>

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
