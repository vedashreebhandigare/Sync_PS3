import { useState } from "react";
import type { Lead, StageId } from "../../types";
import { STAGES } from "../../constants";
import KanbanColumn from "./KanbanColumn";
import LeadDetailPanel from "./LeadDetailPanel";

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateLead: (id: string, updated: Lead) => void;
  onMoveStage: (id: string, stage: StageId) => void;
}

export default function KanbanBoard({
  leads,
  onUpdateLead,
  onMoveStage,
}: KanbanBoardProps): JSX.Element {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [collapsed, setCollapsed] = useState<Set<StageId>>(new Set());

  const toggle = (id: StageId): void => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* keep detail panel in sync when leads change */
  const activeLead = selectedLead
    ? leads.find((l) => l.id === selectedLead.id) ?? null
    : null;

  return (
    <>
      {/* Board */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden", padding: 14 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            height: "100%",
            minWidth: "fit-content",
          }}
        >
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leads.filter((l) => l.stage === stage.id)}
              collapsed={collapsed.has(stage.id)}
              onToggleCollapse={() => toggle(stage.id)}
              onSelectLead={setSelectedLead}
            />
          ))}
        </div>
      </div>

      {/* Detail panel overlay */}
      {activeLead && (
        <div
          className="animate-fade-in"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 150,
          }}
          onClick={() => setSelectedLead(null)}
        />
      )}

      {/* Detail panel */}
      {activeLead && (
        <LeadDetailPanel
          lead={activeLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={(id, updated) => {
            onUpdateLead(id, updated);
            setSelectedLead(updated);
          }}
          onMoveStage={(id, stage) => {
            onMoveStage(id, stage);
            /* update local selection */
            const updated = leads.find((l) => l.id === id);
            if (updated) setSelectedLead({ ...updated, stage });
          }}
        />
      )}
    </>
  );
}
