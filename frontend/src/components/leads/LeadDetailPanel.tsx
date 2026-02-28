import type { Lead, Hall, MenuItem, StageId, DecorType, AddOn } from "../../types";
import { STAGES, TERMINAL_STAGES } from "../../constants";
import { formatDate, daysUntil, isUrgent } from "../../utils";
import { Button, Badge, XIcon, InfoRow } from "../ui";
import HallSelector from "./HallSelector";
import FoodPreferences from "./FoodPreferences";
import MenuBuilder from "./MenuBuilder";
import AdvancePayment from "./AdvancePayment";
import DecorSection from "./DecorSection";
import PostEventAddOns from "./PostEventAddOns";
import FeedbackSection from "./FeedbackSection";
import RemarksStack from "./RemarksStack";

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (id: string, updated: Lead) => void;
  onMoveStage: (id: string, stage: StageId) => void;
}

/* Reusable wrapper for each section block */
function SectionBlock({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div
      style={{
        background: "var(--bg-section)",
        borderRadius: "var(--radius-lg)",
        padding: 14,
      }}
    >
      {children}
    </div>
  );
}

export default function LeadDetailPanel({
  lead,
  onClose,
  onUpdate,
  onMoveStage,
}: LeadDetailPanelProps): JSX.Element {
  const stage = STAGES.find((s) => s.id === lead.stage);
  const stageIdx = STAGES.findIndex((s) => s.id === lead.stage);
  const isTerminal = TERMINAL_STAGES.includes(lead.stage);
  const canFwd = stageIdx < STAGES.length - 1 && !isTerminal;
  const canBack = stageIdx > 0 && !isTerminal;
  const days = daysUntil(lead.eventDate);

  /* shorthand updater */
  const patch = (partial: Partial<Lead>): void => {
    onUpdate(lead.id, { ...lead, ...partial });
  };

  /* ── Hall selection with auto-advance ── */
  const handleSelectHall = (hall: Hall): void => {
    const updates: Partial<Lead> = {
      selectedHall: { id: hall.id, name: hall.name },
    };
    if (lead.stage === "visit") {
      updates.stage = "tasting";
    }
    onUpdate(lead.id, { ...lead, ...updates });
    if (lead.stage === "visit") onMoveStage(lead.id, "tasting");
  };

  /* ── Menu update with auto-advance ── */
  const handleUpdateMenu = (newMenu: MenuItem[]): void => {
    const total = newMenu.reduce((s, m) => s + m.costPerPlate, 0);
    const updates: Partial<Lead> = {
      menu: newMenu,
      menuTotal: total,
      totalCost: total * lead.guestCount,
    };
    if (newMenu.length > 0 && lead.menu.length === 0 && lead.stage === "tasting") {
      updates.stage = "menu";
      onUpdate(lead.id, { ...lead, ...updates });
      onMoveStage(lead.id, "menu");
      return;
    }
    patch(updates);
  };

  /* ── Remark add ── */
  const handleAddRemark = (text: string): void => {
    patch({
      remarks: [
        ...lead.remarks,
        {
          text,
          author: lead.assignedTo || "System",
          date: "2026-02-28",
          stage: lead.stage,
        },
      ],
    });
  };

  /* ── Stage visibility helpers ── */
  const showHall = ["new", "call", "visit"].includes(lead.stage);
  const showFood = ["visit", "tasting"].includes(lead.stage);
  const showMenu = ["tasting", "menu", "advance"].includes(lead.stage);
  const showAdvance = ["menu", "advance"].includes(lead.stage);
  const showDecor = ["advance", "decor"].includes(lead.stage);
  const showPostEvent = lead.stage === "post";
  const showFeedback = lead.stage === "feedback";

  return (
    <div
      className="animate-slide-in"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 480,
        height: "100vh",
        background: "#fff",
        boxShadow: "var(--shadow-panel)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-primary)",
      }}
    >
      {/* ════════ HEADER ════════ */}
      <div
        style={{
          padding: "16px 22px",
          borderBottom: "1px solid var(--border-default)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 19,
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            {lead.name}
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 5,
            }}
          >
            <Badge color={stage?.color ?? "#666"} bg={stage?.bg ?? "#eee"}>
              {stage?.icon} {stage?.label}
            </Badge>
            {lead.selectedHall && (
              <Badge color="#7c3aed" bg="#f5f3ff">
                🏛 {lead.selectedHall.name}
              </Badge>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "var(--bg-app)",
            border: "none",
            borderRadius: "var(--radius-md)",
            width: 34,
            height: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <XIcon />
        </button>
      </div>

      {/* ════════ SCROLLABLE CONTENT ════════ */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* Stage navigation buttons */}
        {(canBack || canFwd) && (
          <div style={{ display: "flex", gap: 8 }}>
            {canBack && (
              <Button
                variant="secondary"
                onClick={() => onMoveStage(lead.id, STAGES[stageIdx - 1].id)}
                style={{ flex: 1, fontSize: 12 }}
              >
                ← {STAGES[stageIdx - 1].label}
              </Button>
            )}
            {canFwd && (
              <Button
                variant="primary"
                onClick={() => onMoveStage(lead.id, STAGES[stageIdx + 1].id)}
                style={{ flex: 1, fontSize: 12 }}
              >
                {STAGES[stageIdx + 1].label} →
              </Button>
            )}
          </div>
        )}

        {/* ── Contact & Event Details ── */}
        <SectionBlock>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: 1.2,
              marginBottom: 10,
            }}
          >
            Contact & Event Details
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <InfoRow label="Phone" value={lead.phone} />
            <InfoRow label="Email" value={lead.email} />
            <InfoRow label="Event Type" value={lead.eventType} />
            <InfoRow
              label="Event Date"
              value={formatDate(lead.eventDate)}
              highlight={isUrgent(lead.eventDate)}
            />
            <InfoRow label="Guest Count" value={`${lead.guestCount} guests`} />
            <InfoRow label="Budget" value={lead.budget} />
            <InfoRow label="Branch" value={lead.branch} />
            <InfoRow label="Source" value={lead.source} />
            <InfoRow label="Assigned To" value={lead.assignedTo} />
            <InfoRow
              label="Next Follow-up"
              value={formatDate(lead.nextFollowUp)}
            />
          </div>
        </SectionBlock>

        {/* ── Hall Selection ── */}
        {showHall && (
          <SectionBlock>
            <HallSelector
              branch={lead.branch}
              selectedHall={lead.selectedHall}
              onSelect={handleSelectHall}
            />
          </SectionBlock>
        )}

        {/* ── Food Preferences ── */}
        {showFood && (
          <SectionBlock>
            <FoodPreferences
              foodPreferences={lead.foodPreferences}
              allergies={lead.allergies}
              onChangePreferences={(v) => patch({ foodPreferences: v })}
              onChangeAllergies={(v) => patch({ allergies: v })}
            />
          </SectionBlock>
        )}

        {/* ── Menu Builder ── */}
        {showMenu && (
          <SectionBlock>
            <MenuBuilder
              menu={lead.menu}
              guestCount={lead.guestCount}
              onUpdateMenu={handleUpdateMenu}
            />
          </SectionBlock>
        )}

        {/* ── Advance Payment ── */}
        {showAdvance && (
          <SectionBlock>
            <AdvancePayment
              totalCost={lead.totalCost}
              menuTotal={lead.menuTotal}
              guestCount={lead.guestCount}
              advancePercent={lead.advancePercent}
              advancePaid={lead.advancePaid}
              onChangePercent={(v) => patch({ advancePercent: v })}
              onChangePaid={(v) => patch({ advancePaid: v })}
            />
          </SectionBlock>
        )}

        {/* ── Decor & Event ── */}
        {showDecor && (
          <SectionBlock>
            <DecorSection
              decorType={lead.decorType}
              decorContractors={lead.decorContractors}
              onChangeType={(v: DecorType) => patch({ decorType: v })}
              onChangeContractors={(v) => patch({ decorContractors: v })}
            />
          </SectionBlock>
        )}

        {/* ── Post-Event Add-ons ── */}
        {showPostEvent && (
          <SectionBlock>
            <PostEventAddOns
              addOns={lead.addOns}
              onUpdate={(v: AddOn[]) => patch({ addOns: v })}
            />
          </SectionBlock>
        )}

        {/* ── Feedback ── */}
        {showFeedback && (
          <SectionBlock>
            <FeedbackSection
              positives={lead.feedbackPositives}
              negatives={lead.feedbackNegatives}
              onChangePositives={(v) => patch({ feedbackPositives: v })}
              onChangeNegatives={(v) => patch({ feedbackNegatives: v })}
            />
          </SectionBlock>
        )}

        {/* ── Remarks (always visible) ── */}
        <SectionBlock>
          <RemarksStack
            remarks={lead.remarks}
            onAddRemark={handleAddRemark}
          />
        </SectionBlock>
      </div>

      {/* ════════ FOOTER ════════ */}
      {!isTerminal && (
        <div
          style={{
            padding: "12px 22px",
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <Button
            variant="success"
            onClick={() => onMoveStage(lead.id, "converted")}
            style={{ flex: 1 }}
          >
            ✓ Convert
          </Button>
          <Button
            variant="danger"
            onClick={() => onMoveStage(lead.id, "lost")}
            style={{ flex: 1 }}
          >
            ✗ Mark Lost
          </Button>
        </div>
      )}
    </div>
  );
}
