import type { SummaryStats } from "../../types";
import { Button, PlusIcon, UploadIcon } from "../ui";

interface HeaderProps {
  totalLeads: number;
  summary: SummaryStats;
  hasFilters: boolean;
  onAddLead: () => void;
  onImportCSV: () => void;
}

const SUMMARY_ITEMS = [
  { label: "New", key: "new" as const, color: "#6366f1" },
  { label: "Active", key: "active" as const, color: "#d97706" },
  { label: "Won", key: "converted" as const, color: "#15803d" },
  { label: "Lost", key: "lost" as const, color: "#dc2626" },
];

export default function Header({
  totalLeads,
  summary,
  hasFilters,
  onAddLead,
  onImportCSV,
}: HeaderProps): JSX.Element {
  return (
    <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-default)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #6d5cff, #a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800 }}>B</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "var(--text-primary)", letterSpacing: -0.3, fontFamily: "var(--font-primary)" }}>Lead Pipeline</h1>
          <p style={{ margin: 0, fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-primary)" }}>{totalLeads} leads{hasFilters ? " (filtered)" : ""}</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5, marginRight: 8 }}>
          {SUMMARY_ITEMS.map((item) => (
            <div key={item.label} style={{ padding: "4px 10px", borderRadius: 7, background: `${item.color}0d`, display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: item.color, fontFamily: "var(--font-primary)" }}>{summary[item.key]}</span>
              <span style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-primary)" }}>{item.label}</span>
            </div>
          ))}
        </div>

        <Button variant="secondary" onClick={onImportCSV} style={{ fontSize: 12, padding: "6px 12px" }}>
          <UploadIcon /> Import CSV
        </Button>
        <Button variant="primary" onClick={onAddLead} style={{ fontSize: 12, padding: "6px 14px" }}>
          <PlusIcon size={14} /> Add Lead
        </Button>
      </div>
    </div>
  );
}
