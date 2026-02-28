import { useState } from "react";
import type {
  LeadBrief,
  LeadFull,
  LeadUpdateInput,
  StageId,
  MenuItemInput,
  AddOnInput,
  Contractor,
  CatalogItem,
} from "../../types";
import { STAGES } from "../../constants";
import KanbanColumn from "./KanbanColumn";
import LeadDetailPanel from "./LeadDetailPanel";

interface KanbanBoardProps {
  leads: LeadBrief[];
  selectedLead: LeadFull | null;
  detailLoading: boolean;
  onSelectLead: (id: string) => Promise<void>;
  onCloseDetail: () => void;
  onUpdateFields: (id: string, data: LeadUpdateInput) => Promise<void>;
  onMoveStage: (id: string, stage: StageId) => Promise<void>;
  onSetHall: (id: string, hallId: string) => Promise<void>;
  onUpdateMenu: (id: string, items: MenuItemInput[]) => Promise<void>;
  onAddRemark: (id: string, text: string, author: string) => Promise<void>;
  onUpdateAddOns: (id: string, addOns: AddOnInput[]) => Promise<void>;
  contractors: Contractor[];
  catalog: CatalogItem[];
}

export default function KanbanBoard({
  leads,
  selectedLead,
  detailLoading,
  onSelectLead,
  onCloseDetail,
  onUpdateFields,
  onMoveStage,
  onSetHall,
  onUpdateMenu,
  onAddRemark,
  onUpdateAddOns,
  contractors,
  catalog,
}: KanbanBoardProps): JSX.Element {
  const [collapsed, setCollapsed] = useState<Set<StageId>>(new Set());

  const toggle = (id: StageId): void => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      {/* Board */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignContent: "flex-start" }}>
          {STAGES.map((stage, idx) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leads.filter((l) => l.stage === stage.id)}
              collapsed={collapsed.has(stage.id)}
              onToggleCollapse={() => toggle(stage.id)}
              onSelectLead={onSelectLead}
              stepNumber={idx + 1}
            />
          ))}
        </div>
      </div>

      {/* Overlay */}
      {selectedLead && (
        <div
          className="animate-fade-in"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 150 }}
          onClick={onCloseDetail}
        />
      )}

      {/* Loading indicator */}
      {detailLoading && !selectedLead && (
        <div style={{ position: "fixed", top: 0, right: 0, width: 480, height: "100vh", background: "var(--bg-section)", boxShadow: "var(--shadow-panel)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--font-primary)" }}>Loading…</div>
        </div>
      )}

      {/* Detail panel */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={onCloseDetail}
          onUpdateFields={onUpdateFields}
          onMoveStage={onMoveStage}
          onSetHall={onSetHall}
          onUpdateMenu={onUpdateMenu}
          onAddRemark={onAddRemark}
          onUpdateAddOns={onUpdateAddOns}
          contractors={contractors}
          catalog={catalog}
        />
      )}
    </>
  );
}
