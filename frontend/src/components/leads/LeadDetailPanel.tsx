import { useState, useEffect } from "react";
import type {
  LeadFull,
  LeadUpdateInput,
  StageId,
  DecorType,
  MenuItemInput,
  AddOnInput,
  Hall,
  Contractor,
  CatalogItem,
} from "../../types";
import { STAGES, TERMINAL_STAGES } from "../../constants";
import { formatDate, isUrgent } from "../../utils";
import { Button, Badge, XIcon, InfoRow } from "../ui";
import HallSelector from "./HallSelector";
import FoodPreferences from "./FoodPreferences";
import MenuBuilder from "./MenuBuilder";
import AdvancePayment from "./AdvancePayment";
import DecorSection from "./DecorSection";
import PostEventAddOns from "./PostEventAddOns";
import FeedbackSection from "./FeedbackSection";
import RemarksStack from "./RemarksStack";
import * as api from "../../api/client";

interface LeadDetailPanelProps {
  lead: LeadFull;
  onClose: () => void;
  onUpdateFields: (id: string, data: LeadUpdateInput) => Promise<void>;
  onMoveStage: (id: string, stage: StageId) => Promise<void>;
  onSetHall: (id: string, hallId: string) => Promise<void>;
  onUpdateMenu: (id: string, items: MenuItemInput[]) => Promise<void>;
  onAddRemark: (id: string, text: string, author: string) => Promise<void>;
  onUpdateAddOns: (id: string, addOns: AddOnInput[]) => Promise<void>;
  contractors: Contractor[];
  catalog: CatalogItem[];
}

function SectionBlock({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "var(--bg-section)", borderRadius: "var(--radius-lg)", padding: 14, border: "1px solid var(--border-default)" }}>{children}</div>;
}

export default function LeadDetailPanel({
  lead,
  onClose,
  onUpdateFields,
  onMoveStage,
  onSetHall,
  onUpdateMenu,
  onAddRemark,
  onUpdateAddOns,
  contractors,
  catalog,
}: LeadDetailPanelProps) {
  const stage = STAGES.find((s) => s.id === lead.stage);
  const stageIdx = STAGES.findIndex((s) => s.id === lead.stage);
  const isTerminal = TERMINAL_STAGES.includes(lead.stage);
  const canFwd = stageIdx < STAGES.length - 1 && !isTerminal;
  const canBack = stageIdx > 0 && !isTerminal;

  const [halls, setHalls] = useState<Hall[]>([]);
  useEffect(() => {
    if (lead.branch) {
      api.fetchHalls(lead.branch).then(setHalls).catch(() => setHalls([]));
    }
  }, [lead.branch]);

  const hallName = lead.selected_hall_id
    ? halls.find((h) => h.id === lead.selected_hall_id)?.name ?? lead.selected_hall_id
    : null;

  const patch = (data: LeadUpdateInput): void => {
    onUpdateFields(lead.id, data);
  };

  const showHall = ["new", "call", "visit"].includes(lead.stage);
  const showFood = ["visit", "tasting"].includes(lead.stage);
  const showMenu = true; // Always show menu builder for easier access in Logistics
  const showAdvance = ["menu", "advance", "decor", "fullpay", "post"].includes(lead.stage);
  const showDecor = ["advance", "decor", "fullpay", "post"].includes(lead.stage);
  const showPostEvent = lead.stage === "post";
  const showFeedback = lead.stage === "feedback";

  return (
    <div className="animate-slide-in aurora-opaque-box"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 980,
        height: "100vh",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-primary)",
        borderRadius: 0,
        border: "none",
      }}>

      {/* ════════ HEADER ════════ */}
      <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "var(--text-primary)" }}>{lead.name}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <Badge color={stage?.color ?? "#666"} bg={`${stage?.color ?? "#666"}20`}>{stage?.icon} {stage?.label}</Badge>
            {hallName && <Badge color="#a78bfa" bg="rgba(167,139,250,0.15)">🏛 {hallName}</Badge>}
          </div>
        </div>
        <button onClick={onClose} style={{ background: "var(--bg-hover)", border: "none", borderRadius: "var(--radius-md)", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
          <XIcon />
        </button>
      </div>

      {/* ════════ SCROLLABLE CONTENT ════════ */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px", display: "flex", flexDirection: "column", gap: 18 }}>

        {(canBack || canFwd) && (
          <div style={{ display: "flex", gap: 8 }}>
            {canBack && <Button variant="secondary" onClick={() => onMoveStage(lead.id, STAGES[stageIdx - 1].id)} style={{ flex: 1, fontSize: 12 }}>← {STAGES[stageIdx - 1].label}</Button>}
            {canFwd && <Button variant="primary" onClick={() => onMoveStage(lead.id, STAGES[stageIdx + 1].id)} style={{ flex: 1, fontSize: 12 }}>{STAGES[stageIdx + 1].label} →</Button>}
          </div>
        )}

        <SectionBlock>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>Contact & Event Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow label="Event Type" value={lead.event_type} />
            <InfoRow label="Event Date" value={formatDate(lead.event_date)} highlight={isUrgent(lead.event_date)} />
            <InfoRow label="Guest Count" value={`${lead.guest_count} guests`} />
            <InfoRow label="Budget" value={lead.budget} />
            <InfoRow label="Branch" value={lead.branch} />
            <InfoRow label="Source" value={lead.source} />
            <InfoRow label="Assigned To" value={lead.assigned_to} />
            <InfoRow label="Next Follow-up" value={formatDate(lead.next_follow_up)} />
          </div>
        </SectionBlock>

        {showHall && (<SectionBlock><HallSelector halls={halls} selectedHallId={lead.selected_hall_id} onSelect={(hallId) => onSetHall(lead.id, hallId)} /></SectionBlock>)}
        {showFood && (<SectionBlock><FoodPreferences foodPreferences={lead.food_preferences} allergies={lead.allergies} onChangePreferences={(v) => patch({ food_preferences: v })} onChangeAllergies={(v) => patch({ allergies: v })} /></SectionBlock>)}
        {showMenu && (<SectionBlock><MenuBuilder menu={lead.menu_items} guestCount={lead.guest_count} catalog={catalog} onSave={(items) => onUpdateMenu(lead.id, items)} /></SectionBlock>)}
        {showAdvance && (<SectionBlock><AdvancePayment total_cost={lead.total_cost} menu_total={lead.menu_total} guest_count={lead.guest_count} advance_percent={lead.advance_percent} advance_paid={lead.advance_paid} onChangePercent={(v) => patch({ advance_percent: v })} onChangePaid={(v) => patch({ advance_paid: v })} /></SectionBlock>)}
        {showDecor && (<SectionBlock><DecorSection decorType={lead.decor_type} decorContractors={lead.decor_contractors} contractors={contractors} onChangeType={(v: DecorType) => patch({ decor_type: v })} onChangeContractors={(v) => patch({ decor_contractors: v })} /></SectionBlock>)}
        {showPostEvent && (<SectionBlock><PostEventAddOns addOns={lead.add_ons} onSave={(items) => onUpdateAddOns(lead.id, items)} /></SectionBlock>)}
        {showFeedback && (<SectionBlock><FeedbackSection positives={lead.feedback_positives} negatives={lead.feedback_negatives} onChangePositives={(v) => patch({ feedback_positives: v })} onChangeNegatives={(v) => patch({ feedback_negatives: v })} /></SectionBlock>)}

        <SectionBlock>
          <RemarksStack remarks={lead.remarks} assignedTo={lead.assigned_to} onAddRemark={(text, author) => onAddRemark(lead.id, text, author)} />
        </SectionBlock>
      </div>

      {!isTerminal && (
        <div style={{ padding: "12px 22px", borderTop: "1px solid var(--border-default)", display: "flex", gap: 8, flexShrink: 0 }}>
          <Button variant="success" onClick={() => onMoveStage(lead.id, "converted")} style={{ flex: 1 }}>✓ Convert</Button>
          <Button variant="danger" onClick={() => onMoveStage(lead.id, "lost")} style={{ flex: 1 }}>✗ Mark Lost</Button>
        </div>
      )}
    </div>
  );
}
