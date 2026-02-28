import type { StageId } from "../../types";
import { Button, PlusIcon, UploadIcon } from "../ui";
import { STAGES, TERMINAL_STAGES } from "../../constants";

interface HeaderProps {
  totalLeads: number;
  stageCounts: Record<StageId, number>;
  hasFilters: boolean;
  onAddLead: () => void;
  onImportCSV: () => void;
}

const SUMMARY_ITEMS = [
  {
    label: "New",
    getCount: (c: Record<StageId, number>) => c.new ?? 0,
    color: "#6366f1",
  },
  {
    label: "Active",
    getCount: (c: Record<StageId, number>) =>
      Object.entries(c)
        .filter(([k]) => !["new", ...TERMINAL_STAGES].includes(k as StageId))
        .reduce((a, [, v]) => a + v, 0),
    color: "#d97706",
  },
  {
    label: "Won",
    getCount: (c: Record<StageId, number>) => c.converted ?? 0,
    color: "#15803d",
  },
  {
    label: "Lost",
    getCount: (c: Record<StageId, number>) => c.lost ?? 0,
    color: "#dc2626",
  },
] as const;

export default function Header({
  totalLeads,
  stageCounts,
  hasFilters,
  onAddLead,
  onImportCSV,
}: HeaderProps): JSX.Element {
  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--border-default)",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      {/* Left: logo + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "linear-gradient(135deg, #6d5cff, #a78bfa)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 15,
            fontWeight: 800,
          }}
        >
          B
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: -0.3,
              fontFamily: "var(--font-primary)",
            }}
          >
            Lead Pipeline
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 11.5,
              color: "var(--text-muted)",
              fontFamily: "var(--font-primary)",
            }}
          >
            {totalLeads} leads{hasFilters ? " (filtered)" : ""}
          </p>
        </div>
      </div>

      {/* Right: summary badges + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5, marginRight: 8 }}>
          {SUMMARY_ITEMS.map((item) => (
            <div
              key={item.label}
              style={{
                padding: "4px 10px",
                borderRadius: 7,
                background: `${item.color}0d`,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: item.color,
                }}
              />
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: item.color,
                  fontFamily: "var(--font-primary)",
                }}
              >
                {item.getCount(stageCounts)}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-primary)",
                }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <Button
          variant="secondary"
          onClick={onImportCSV}
          style={{ fontSize: 12, padding: "6px 12px" }}
        >
          <UploadIcon /> Import CSV
        </Button>
        <Button
          variant="primary"
          onClick={onAddLead}
          style={{ fontSize: 12, padding: "6px 14px" }}
        >
          <PlusIcon size={14} /> Add Lead
        </Button>
      </div>
    </div>
  );
}
