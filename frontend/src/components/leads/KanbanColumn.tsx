import type { LeadBrief, Stage } from "../../types";
import LeadCard from "./LeadCard";

interface KanbanColumnProps {
  stage: Stage;
  leads: LeadBrief[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectLead: (id: string) => void;
}

export default function KanbanColumn({
  stage,
  leads,
  collapsed,
  onToggleCollapse,
  onSelectLead,
}: KanbanColumnProps): JSX.Element {
  if (collapsed) {
    return (
      <div onClick={onToggleCollapse}
        style={{ width: 38, minHeight: 400, background: stage.bg, borderRadius: "var(--radius-lg)", border: `1.5px solid ${stage.color}15`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 12, gap: 6, transition: "all var(--transition-normal)" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = `${stage.color}18`; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = stage.bg; }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: stage.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{leads.length}</div>
        <div style={{ writingMode: "vertical-lr", transform: "rotate(180deg)", fontSize: 11, fontWeight: 700, color: stage.color, letterSpacing: 0.4, fontFamily: "var(--font-primary)" }}>{stage.label}</div>
      </div>
    );
  }

  return (
    <div style={{ width: 248, minWidth: 248, display: "flex", flexDirection: "column", background: "var(--bg-section)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", maxHeight: "calc(100vh - 170px)" }}>
      <div onClick={onToggleCollapse}
        style={{ padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-default)", cursor: "pointer", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13 }}>{stage.icon}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>{stage.label}</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, background: leads.length > 0 ? stage.color : "#d4d0de", color: "#fff", padding: "1px 7px", borderRadius: "var(--radius-lg)", minWidth: 18, textAlign: "center" }}>{leads.length}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 6, display: "flex", flexDirection: "column", gap: 6 }}>
        {leads.length === 0 ? (
          <div style={{ padding: 18, textAlign: "center", color: "var(--text-muted)", fontSize: 12, fontStyle: "italic", fontFamily: "var(--font-primary)" }}>No leads</div>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} stageColor={stage.color} onClick={onSelectLead} />
          ))
        )}
      </div>
    </div>
  );
}
