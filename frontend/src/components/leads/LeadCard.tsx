import type { Lead } from "../../types";
import { Badge } from "../ui";
import { formatDate, daysUntil, isUrgent } from "../../utils";
import { EVENT_TYPE_COLORS } from "../../constants";

interface LeadCardProps {
  lead: Lead;
  stageColor: string;
  onClick: (lead: Lead) => void;
}

export default function LeadCard({
  lead,
  stageColor,
  onClick,
}: LeadCardProps): JSX.Element {
  const days = daysUntil(lead.eventDate);
  const urgent = isUrgent(lead.eventDate);
  const typeStyle = EVENT_TYPE_COLORS[lead.eventType] ?? {
    bg: "#f3f4f6",
    color: "#374151",
  };

  return (
    <div
      onClick={() => onClick(lead)}
      style={{
        background: "#34294eff",
        borderRadius: "var(--radius-lg)",
        padding: "16px 18px",
        cursor: "pointer",
        border: "1.5px solid var(--border-light)",
        transition: "all var(--transition-normal)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-md)";
        el.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.boxShadow = "var(--shadow-sm)";
        el.style.transform = "none";
      }}
    >
      {/* Row 1: Name + Event Type */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            color: "var(--text-primary)",
            fontFamily: "var(--font-primary)",
          }}
        >
          {lead.name}
        </div>
        <Badge color={typeStyle.color} bg={typeStyle.bg}>
          {lead.eventType}
        </Badge>
      </div>

      {/* Row 2: Date + Guest Count */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: urgent ? "var(--danger)" : "var(--text-secondary)",
            fontFamily: "var(--font-primary)",
            fontWeight: urgent ? 600 : 400,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          📅 {formatDate(lead.eventDate)}
          {urgent && days !== null && (
            <span
              style={{
                background: "var(--danger-bg)",
                color: "var(--danger)",
                fontSize: 9.5,
                padding: "1px 6px",
                borderRadius: "var(--radius-lg)",
                fontWeight: 700,
              }}
            >
              In {days}d
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            fontFamily: "var(--font-primary)",
          }}
        >
          👥 {lead.guestCount} guests
        </div>
      </div>

      {/* Row 3: Budget + Branch */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "var(--text-primary)",
            fontFamily: "var(--font-primary)",
          }}
        >
          {lead.budget}
        </span>
        <span
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            fontFamily: "var(--font-primary)",
            background: "var(--bg-app)",
            padding: "2px 7px",
            borderRadius: 5,
            fontWeight: 500,
          }}
        >
          {lead.branch.replace(" Branch", "")}
        </span>
      </div>
    </div>
  );
}
