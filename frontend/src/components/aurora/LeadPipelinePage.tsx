import { useState, useMemo, useEffect, useCallback } from "react";
import useLeads from "../../hooks/useLeads";
import useReferenceData from "../../hooks/useReferenceData";
import { AddLeadModal, CSVImportModal, LeadDetailPanel } from "../leads";
import { Button, Badge, SectionLabel, XIcon, InfoRow } from "../ui";
import { STAGES, EVENT_TYPES, LEAD_SOURCES, TERMINAL_STAGES } from "../../constants";
import { formatDate, daysUntil, isUrgent, currency } from "../../utils";
import type {
  SummaryStats,
  LeadBrief,
  LeadFull,
  LeadUpdateInput,
  StageId,
  MenuItemInput,
  AddOnInput,
  Partner,
  PartnerCreateInput,
  PartnerUpdateInput,
  PartnerSummary,
  Branch,
  Contractor,
  CatalogItem,
  Hall,
} from "../../types";
import * as partnerApi from "../../api/client";

/* ─── Tabs & Views ─── */
type ActiveTab = "pipeline" | "generation";
type PipelineView = "landing" | "viewLeads" | "viewClient";

/* ─── Stage summary items shown in page header ─── */
const SUMMARY_ITEMS = [
  { label: "New", getCount: (s: SummaryStats) => s.new, color: "#6366f1" },
  { label: "Active", getCount: (s: SummaryStats) => s.active, color: "#f59e0b" },
  { label: "Won", getCount: (s: SummaryStats) => s.converted, color: "#22d3a7" },
  { label: "Lost", getCount: (s: SummaryStats) => s.lost, color: "#f87171" },
] as const;

/* ─── Event-type color map (reused from LeadCard) ─── */
const EVENT_STYLE: Record<string, { border: string; bg: string; color: string }> = {
  Wedding: { border: "#fbbf24", bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  "Corporate Event": { border: "#60a5fa", bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
  Reception: { border: "#f472b6", bg: "rgba(244,114,182,0.15)", color: "#f472b6" },
  "Birthday Party": { border: "#a78bfa", bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  Conference: { border: "#38bdf8", bg: "rgba(56,189,248,0.15)", color: "#38bdf8" },
  Anniversary: { border: "#fb923c", bg: "rgba(251,146,60,0.15)", color: "#fb923c" },
  Engagement: { border: "#e879f9", bg: "rgba(232,121,249,0.15)", color: "#e879f9" },
  "Social Gathering": { border: "#94a3b8", bg: "rgba(148,163,184,0.15)", color: "#94a3b8" },
};
const DEFAULT_EVENT_STYLE = { border: "#94a3b8", bg: "rgba(148,163,184,0.12)", color: "#94a3b8" };


/* ═══════════════════════════════════════════════════════════
   LANDING CARDS CONFIG
   ═══════════════════════════════════════════════════════════ */
const LANDING_CARDS: {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
}[] = [
  {
    id: "add",
    title: "Add New Lead",
    subtitle: "Create a fresh enquiry manually",
    icon: "➕",
    accentColor: "#6366f1",
  },
  {
    id: "import",
    title: "Import CSV",
    subtitle: "Bulk import leads from a file",
    icon: "📄",
    accentColor: "#a78bfa",
  },
  {
    id: "view",
    title: "View Leads",
    subtitle: "Browse all leads grouped by stage",
    icon: "📋",
    accentColor: "#22d3a7",
  },
  {
    id: "client",
    title: "View Specific Client",
    subtitle: "Search and view a client's journey",
    icon: "🔍",
    accentColor: "#f59e0b",
  },
];


/* ═══════════════════════════════════════════════════════════
   BackButton — consistent navigation
   ═══════════════════════════════════════════════════════════ */
function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }): JSX.Element {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        color: "var(--text-secondary)",
        fontFamily: "var(--font-primary)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 0",
        marginBottom: 14,
        transition: "color var(--transition-fast)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}


/* ═══════════════════════════════════════════════════════════
   VIEW: Landing — 4 Card Grid
   ═══════════════════════════════════════════════════════════ */
interface LandingViewProps {
  summary: SummaryStats;
  leadCount: number;
  onNavigate: (id: string) => void;
}

function LandingView({ summary, leadCount, onNavigate }: LandingViewProps): JSX.Element {
  const urgentCount = summary.active; // approximate; real count can come from leads array

  return (
    <div style={{ padding: "24px 24px", maxWidth: 820, margin: "0 auto" }}>
      {/* Quick Stats Row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        {SUMMARY_ITEMS.map((item) => (
          <div
            key={item.label}
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: "var(--radius-lg)",
              background: `${item.color}10`,
              border: `1px solid ${item.color}25`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 20, fontWeight: 800, color: item.color, fontFamily: "var(--font-primary)" }}>
                {item.getCount(summary)}
              </span>
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-primary)", marginTop: 2 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* 4 Card Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {LANDING_CARDS.map((card) => (
          <div
            key={card.id}
            onClick={() => onNavigate(card.id)}
            style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-xl)",
              padding: "24px 22px",
              cursor: "pointer",
              border: "1.5px solid var(--border-default)",
              transition: "all var(--transition-normal)",
              position: "relative",
              overflow: "hidden",
              minHeight: 130,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "var(--shadow-sm)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = `${card.accentColor}50`;
              el.style.transform = "translateY(-2px)";
              el.style.boxShadow = `0 6px 20px ${card.accentColor}12`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.borderColor = "";
              el.style.transform = "none";
              el.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            <div>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-primary)", marginBottom: 3 }}>
                {card.title}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", fontFamily: "var(--font-primary)", lineHeight: 1.5 }}>
                {card.subtitle}
              </div>
            </div>

            {/* Dynamic count badge for "View Leads" card */}
            {card.id === "view" && (
              <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: "var(--radius-full)", background: "rgba(34,211,167,0.1)", color: "#22d3a7", fontFamily: "var(--font-primary)" }}>
                  {summary.active} active
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: "var(--radius-full)", background: "rgba(99,102,241,0.1)", color: "#6366f1", fontFamily: "var(--font-primary)" }}>
                  {summary.new} new
                </span>
              </div>
            )}

            {/* Arrow */}
            <div style={{ position: "absolute", bottom: 18, right: 18, color: card.accentColor, opacity: 0.35 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   VIEW: View Leads — Grouped by Stage (Accordion)
   ═══════════════════════════════════════════════════════════ */

/* ── Single lead row inside an accordion ── */
function LeadRow({ lead, onClick }: { lead: LeadBrief; onClick: (id: string) => void }): JSX.Element {
  const evStyle = EVENT_STYLE[lead.event_type] ?? DEFAULT_EVENT_STYLE;
  const days = daysUntil(lead.event_date);
  const urgent = isUrgent(lead.event_date);

  return (
    <div
      onClick={() => onClick(lead.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        cursor: "pointer",
        borderBottom: "1px solid var(--border-light)",
        borderLeft: `3px solid ${evStyle.border}`,
        transition: "background var(--transition-fast)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>
          {lead.name}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--text-secondary)", fontFamily: "var(--font-primary)", marginTop: 1 }}>
          {lead.branch}
        </div>
      </div>

      <Badge color={evStyle.color} bg={evStyle.bg}>{lead.event_type}</Badge>

      <div style={{ textAlign: "right", minWidth: 90 }}>
        <div style={{ fontSize: 12, color: urgent ? "var(--danger)" : "var(--text-secondary)", fontWeight: urgent ? 700 : 400, fontFamily: "var(--font-primary)" }}>
          {formatDate(lead.event_date)}
        </div>
        {urgent && days !== null && (
          <span style={{ fontSize: 9.5, background: "var(--danger-bg)", color: "var(--danger)", padding: "1px 6px", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
            In {days}d
          </span>
        )}
      </div>

      <div style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-primary)", minWidth: 50, textAlign: "center" }}>
        👥 {lead.guest_count}
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-primary)", minWidth: 80, textAlign: "right" }}>
        {lead.budget}
      </div>

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
}

/* ── Single stage accordion ── */
interface StageAccordionProps {
  stage: (typeof STAGES)[number];
  leads: LeadBrief[];
  expanded: boolean;
  onToggle: () => void;
  onSelectLead: (id: string) => void;
  stepNumber: number;
}

function StageAccordion({ stage, leads, expanded, onToggle, onSelectLead, stepNumber }: StageAccordionProps): JSX.Element {
  const count = leads.length;

  return (
    <div style={{
      borderRadius: "var(--radius-lg)",
      border: "1.5px solid var(--border-default)",
      overflow: "hidden",
      background: "var(--bg-card)",
      marginBottom: 8,
    }}>
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          cursor: "pointer",
          background: expanded ? `${stage.color}08` : "var(--bg-card)",
          borderBottom: expanded && count > 0 ? "1px solid var(--border-default)" : "none",
          transition: "background var(--transition-fast)",
        }}
        onMouseEnter={(e) => { if (!expanded) e.currentTarget.style.background = "var(--bg-hover)"; }}
        onMouseLeave={(e) => { if (!expanded) e.currentTarget.style.background = "var(--bg-card)"; }}
      >
        <span style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: stage.color,
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          fontFamily: "var(--font-primary)",
          flexShrink: 0,
        }}>
          {stepNumber}
        </span>
        <span style={{ fontSize: 15, flexShrink: 0 }}>{stage.icon}</span>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-primary)", flex: 1 }}>
          {stage.label}
        </span>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          background: count > 0 ? stage.color : "var(--text-muted)",
          color: "#fff",
          padding: "2px 9px",
          borderRadius: "var(--radius-full)",
          minWidth: 22,
          textAlign: "center",
          fontFamily: "var(--font-primary)",
        }}>
          {count}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform var(--transition-fast)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* Content */}
      {expanded && count > 0 && (
        <div>{leads.map((lead) => <LeadRow key={lead.id} lead={lead} onClick={onSelectLead} />)}</div>
      )}
      {expanded && count === 0 && (
        <div style={{ padding: "18px 14px", textAlign: "center", color: "var(--text-muted)", fontSize: 12.5, fontFamily: "var(--font-primary)", fontStyle: "italic" }}>
          No leads in this stage
        </div>
      )}
    </div>
  );
}

/* ── Full "View Leads" section ── */
interface ViewLeadsProps {
  leads: LeadBrief[];
  filters: { search: string; branch: string; event_type: string; source: string };
  branches: Branch[];
  onSetFilter: (key: string, val: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  onSelectLead: (id: string) => Promise<void>;
  onBack: () => void;
}

function ViewLeadsSection({
  leads,
  filters,
  branches,
  onSetFilter,
  onClearFilters,
  hasActiveFilters,
  onSelectLead,
  onBack,
}: ViewLeadsProps): JSX.Element {
  // Default: first 3 non-terminal stages expanded
  const [expandedStages, setExpandedStages] = useState<Set<StageId>>(
    () => new Set(STAGES.filter((s) => !TERMINAL_STAGES.includes(s.id)).slice(0, 3).map((s) => s.id))
  );

  const toggleStage = (id: StageId): void => {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpandedStages(new Set(STAGES.map((s) => s.id)));
  const collapseAll = () => setExpandedStages(new Set());

  const selectStyle: React.CSSProperties = {
    background: "var(--bg-input)",
    border: "1px solid var(--border-default)",
    borderRadius: 8,
    color: "var(--text-secondary)",
    fontSize: 12.5,
    fontWeight: 400,
    padding: "6px 10px",
    outline: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    minWidth: 110,
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
      <BackButton onClick={onBack} label="Back to Leads" />

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>
            All Leads
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-primary)", marginTop: 2 }}>
            {leads.length} leads{hasActiveFilters ? " (filtered)" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={expandAll}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "4px 8px" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 11.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "4px 8px" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          background: "var(--bg-input)", border: "1px solid var(--border-default)",
          borderRadius: 8, padding: "6px 12px", flex: "0 1 240px", minWidth: 160,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search name, phone..."
            value={filters.search}
            onChange={(e) => onSetFilter("search", e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: "var(--text-primary)", width: "100%", fontFamily: "inherit" }}
          />
          {filters.search && (
            <button
              onClick={() => onSetFilter("search", "")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {([
          { key: "branch", placeholder: "All Branches", options: branches.map((b) => b.name) },
          { key: "event_type", placeholder: "All Events", options: EVENT_TYPES as string[] },
          { key: "source", placeholder: "All Sources", options: LEAD_SOURCES as string[] },
        ] as const).map(({ key, placeholder, options }) => (
          <select
            key={key}
            value={filters[key as keyof typeof filters]}
            onChange={(e) => onSetFilter(key, e.target.value)}
            style={{
              ...selectStyle,
              borderColor: filters[key as keyof typeof filters] ? "var(--accent)" : undefined,
              color: filters[key as keyof typeof filters] ? "var(--accent)" : "var(--text-secondary)",
              fontWeight: filters[key as keyof typeof filters] ? 600 : 400,
            }}
          >
            <option value="">{placeholder}</option>
            {options.map((o) => (
              <option key={o} value={o} style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>{o}</option>
            ))}
          </select>
        ))}

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "4px 2px" }}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Stage Accordions */}
      {STAGES.map((stage, idx) => {
        const stageLeads = leads.filter((l) => l.stage === stage.id);
        return (
          <StageAccordion
            key={stage.id}
            stage={stage}
            leads={stageLeads}
            expanded={expandedStages.has(stage.id)}
            onToggle={() => toggleStage(stage.id)}
            onSelectLead={onSelectLead}
            stepNumber={idx + 1}
          />
        );
      })}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   VIEW: View Specific Client — Search + Full Page Journey
   ═══════════════════════════════════════════════════════════ */
interface ClientSearchProps {
  leads: LeadBrief[];
  onSelectLead: (id: string) => Promise<void>;
  selectedLead: LeadFull | null;
  detailLoading: boolean;
  onCloseDetail: () => void;
  onUpdateFields: (id: string, data: LeadUpdateInput) => Promise<void>;
  onMoveStage: (id: string, stage: StageId) => Promise<void>;
  onSetHall: (id: string, hallId: string) => Promise<void>;
  onUpdateMenu: (id: string, items: MenuItemInput[]) => Promise<void>;
  onAddRemark: (id: string, text: string, author: string) => Promise<void>;
  onUpdateAddOns: (id: string, addOns: AddOnInput[]) => Promise<void>;
  contractors: Contractor[];
  catalog: CatalogItem[];
  onBack: () => void;
}

function ClientSearchView({
  leads,
  onSelectLead,
  selectedLead,
  detailLoading,
  onCloseDetail,
  onUpdateFields,
  onMoveStage,
  onSetHall,
  onUpdateMenu,
  onAddRemark,
  onUpdateAddOns,
  contractors,
  catalog,
  onBack,
}: ClientSearchProps): JSX.Element {
  const [search, setSearch] = useState("");

  const results = search.length >= 2
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          (l.phone && l.phone.includes(search))
      )
    : [];

  /* ── If a lead is selected, show full-page detail ── */
  if (selectedLead) {
    return (
      <ClientFullPage
        lead={selectedLead}
        onBack={onCloseDetail}
        onUpdateFields={onUpdateFields}
        onMoveStage={onMoveStage}
        onSetHall={onSetHall}
        onUpdateMenu={onUpdateMenu}
        onAddRemark={onAddRemark}
        onUpdateAddOns={onUpdateAddOns}
        contractors={contractors}
        catalog={catalog}
      />
    );
  }

  if (detailLoading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-primary)" }}>
        Loading client details…
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
      <BackButton onClick={onBack} label="Back to Leads" />

      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>
        Find a Client
      </h2>
      <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-primary)", marginTop: 2, marginBottom: 16 }}>
        Search by name or phone number to view their complete journey.
      </p>

      {/* Search */}
      <div style={{
        display: "flex", alignItems: "center", gap: 7,
        background: "var(--bg-input)", border: "1.5px solid var(--border-default)",
        borderRadius: "var(--radius-md)", padding: "8px 14px", maxWidth: 420,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Type client name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "var(--text-primary)", width: "100%", fontFamily: "inherit" }}
        />
      </div>

      {/* Results */}
      {search.length >= 2 && (
        <div style={{ marginTop: 14 }}>
          {results.length === 0 ? (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-primary)", border: "2px dashed var(--border-default)", borderRadius: "var(--radius-lg)" }}>
              No clients found for "{search}"
            </div>
          ) : (
            <div style={{ borderRadius: "var(--radius-lg)", border: "1.5px solid var(--border-default)", overflow: "hidden" }}>
              {results.map((lead, i) => {
                const stage = STAGES.find((s) => s.id === lead.stage);
                const evStyle = EVENT_STYLE[lead.event_type] ?? DEFAULT_EVENT_STYLE;
                return (
                  <div
                    key={lead.id}
                    onClick={() => onSelectLead(lead.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      cursor: "pointer",
                      background: "var(--bg-card)",
                      borderTop: i > 0 ? "1px solid var(--border-light)" : "none",
                      transition: "background var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: `${stage?.color ?? "#94a3b8"}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {stage?.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>{lead.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-secondary)", fontFamily: "var(--font-primary)" }}>{lead.branch}</div>
                    </div>
                    <Badge color={evStyle.color} bg={evStyle.bg}>{lead.event_type}</Badge>
                    <Badge color={stage?.color ?? "#94a3b8"} bg={`${stage?.color ?? "#94a3b8"}20`}>{stage?.label}</Badge>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   CLIENT FULL PAGE — Dedicated screen with timeline journey
   ═══════════════════════════════════════════════════════════ */
interface ClientFullPageProps {
  lead: LeadFull;
  onBack: () => void;
  onUpdateFields: (id: string, data: LeadUpdateInput) => Promise<void>;
  onMoveStage: (id: string, stage: StageId) => Promise<void>;
  onSetHall: (id: string, hallId: string) => Promise<void>;
  onUpdateMenu: (id: string, items: MenuItemInput[]) => Promise<void>;
  onAddRemark: (id: string, text: string, author: string) => Promise<void>;
  onUpdateAddOns: (id: string, addOns: AddOnInput[]) => Promise<void>;
  contractors: Contractor[];
  catalog: CatalogItem[];
}

function ClientFullPage({
  lead,
  onBack,
  onUpdateFields,
  onMoveStage,
  onSetHall,
  onUpdateMenu,
  onAddRemark,
  onUpdateAddOns,
  contractors,
  catalog,
}: ClientFullPageProps): JSX.Element {
  const currentStage = STAGES.find((s) => s.id === lead.stage);
  const stageIdx = STAGES.findIndex((s) => s.id === lead.stage);
  const evStyle = EVENT_STYLE[lead.event_type] ?? DEFAULT_EVENT_STYLE;
  const isTerminal = TERMINAL_STAGES.includes(lead.stage);
  const canFwd = stageIdx < STAGES.length - 1 && !isTerminal;
  const canBack = stageIdx > 0 && !isTerminal;

  const timelineStages = STAGES.filter((s) => !TERMINAL_STAGES.includes(s.id));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", fontFamily: "var(--font-primary)" }}>
      <BackButton onClick={onBack} label="Back to Search" />

      {/* Client Header Card */}
      <div style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 22px",
        border: "1.5px solid var(--border-default)",
        marginBottom: 18,
        position: "relative",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}>
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${evStyle.border}, ${currentStage?.color ?? "var(--accent)"})` }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>{lead.name}</h1>
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 3 }}>
              {lead.phone} · {lead.email}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <Badge color={currentStage?.color ?? "#666"} bg={`${currentStage?.color ?? "#666"}20`}>
                {currentStage?.icon} {currentStage?.label}
              </Badge>
              <Badge color={evStyle.color} bg={evStyle.bg}>{lead.event_type}</Badge>
              {isUrgent(lead.event_date) && (
                <Badge color="var(--danger)" bg="var(--danger-bg)">
                  {daysUntil(lead.event_date) === 0 ? "Today!" : `${daysUntil(lead.event_date)}d away`}
                </Badge>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10.5, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>Event Date</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)" }}>{formatDate(lead.event_date)}</div>
          </div>
        </div>

        {/* Stage actions */}
        {(canBack || canFwd) && (
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {canBack && (
              <Button variant="secondary" onClick={() => onMoveStage(lead.id, STAGES[stageIdx - 1].id)} style={{ fontSize: 12 }}>
                ← {STAGES[stageIdx - 1].label}
              </Button>
            )}
            {canFwd && (
              <Button variant="primary" onClick={() => onMoveStage(lead.id, STAGES[stageIdx + 1].id)} style={{ fontSize: 12 }}>
                {STAGES[stageIdx + 1].label} →
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Two Column: Details + Booking Info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", padding: "16px 18px", border: "1px solid var(--border-default)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Event Details
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <InfoRow label="Event Type" value={lead.event_type} />
            <InfoRow label="Guest Count" value={`${lead.guest_count} guests`} />
            <InfoRow label="Budget" value={lead.budget} />
            <InfoRow label="Event Date" value={formatDate(lead.event_date)} highlight={isUrgent(lead.event_date)} />
          </div>
        </div>
        <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", padding: "16px 18px", border: "1px solid var(--border-default)" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Booking Info
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <InfoRow label="Branch" value={lead.branch} />
            <InfoRow label="Source" value={lead.source} />
            <InfoRow label="Assigned To" value={lead.assigned_to} />
            <InfoRow label="Next Follow-up" value={formatDate(lead.next_follow_up)} />
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-xl)",
        padding: "20px 22px",
        border: "1px solid var(--border-default)",
        marginBottom: 18,
      }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
          Client Journey
        </div>

        <div style={{ position: "relative", paddingLeft: 36 }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 13, top: 4, bottom: 4, width: 2, background: "var(--border-default)" }} />

          {timelineStages.map((stage, i) => {
            const isCompleted = i < stageIdx;
            const isCurrent = stage.id === lead.stage;
            const isTerminalLead = TERMINAL_STAGES.includes(lead.stage);

            let dotBg = "var(--bg-card)";
            let dotBorder = "var(--border-default)";
            let textColor = "var(--text-muted)";

            if (isCompleted || (isTerminalLead && i <= stageIdx)) {
              dotBg = stage.color;
              dotBorder = stage.color;
              textColor = "var(--text-primary)";
            } else if (isCurrent) {
              dotBg = stage.color;
              dotBorder = stage.color;
              textColor = "var(--text-primary)";
            }

            return (
              <div
                key={stage.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  marginBottom: i < timelineStages.length - 1 ? 4 : 0,
                  padding: isCurrent ? "10px 14px" : "6px 0",
                  background: isCurrent ? `${stage.color}08` : "transparent",
                  borderRadius: isCurrent ? "var(--radius-md)" : 0,
                  border: isCurrent ? `1px solid ${stage.color}25` : "none",
                  position: "relative",
                }}
              >
                {/* Dot */}
                <div style={{
                  position: "absolute",
                  left: -23,
                  top: isCurrent ? 14 : 8,
                  width: isCurrent ? 12 : 10,
                  height: isCurrent ? 12 : 10,
                  borderRadius: "50%",
                  background: (isCompleted || isCurrent) ? dotBg : "var(--bg-card)",
                  border: `2.5px solid ${dotBorder}`,
                  zIndex: 1,
                  marginLeft: isCurrent ? -1 : 0,
                  boxShadow: isCurrent ? `0 0 0 4px ${stage.color}20` : "none",
                }} />

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>{stage.icon}</span>
                    <span style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 800 : isCompleted ? 600 : 400,
                      color: textColor,
                      fontFamily: "var(--font-primary)",
                    }}>
                      {stage.label}
                    </span>
                    {isCompleted && (
                      <span style={{ fontSize: 10, color: stage.color, fontWeight: 700, fontFamily: "var(--font-primary)" }}>✓ Done</span>
                    )}
                    {isCurrent && (
                      <Badge color={stage.color} bg={`${stage.color}20`}>Current</Badge>
                    )}
                  </div>
                  {isCurrent && (
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                      This lead is currently at this stage. Use the buttons above to advance.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Terminal status */}
          {TERMINAL_STAGES.includes(lead.stage) && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12, marginTop: 6,
              padding: "10px 14px",
              background: lead.stage === "converted" ? "var(--success-bg)" : "var(--danger-bg)",
              borderRadius: "var(--radius-md)",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", left: -23, top: 12,
                width: 12, height: 12, borderRadius: "50%",
                background: lead.stage === "converted" ? "var(--success)" : "var(--danger)",
                border: "2.5px solid transparent", zIndex: 1, marginLeft: -1,
              }} />
              <span style={{ fontSize: 16 }}>{lead.stage === "converted" ? "🎉" : "❌"}</span>
              <span style={{
                fontSize: 13, fontWeight: 800,
                color: lead.stage === "converted" ? "var(--success)" : "var(--danger)",
                fontFamily: "var(--font-primary)",
              }}>
                {lead.stage === "converted" ? "Converted — Booking Confirmed!" : "Lost — Lead did not convert"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Convert / Lost footer actions */}
      {!isTerminal && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", paddingBottom: 20 }}>
          <Button variant="success" onClick={() => onMoveStage(lead.id, "converted")} style={{ padding: "10px 24px" }}>
            ✓ Convert
          </Button>
          <Button variant="danger" onClick={() => onMoveStage(lead.id, "lost")} style={{ padding: "10px 24px" }}>
            ✗ Mark Lost
          </Button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Lead Generation Tab Content
   ═══════════════════════════════════════════════════════════ */
interface LeadGenerationSectionProps {
    branches: Branch[];
}

function LeadGenerationSection({ branches }: LeadGenerationSectionProps): JSX.Element {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [summary, setSummary] = useState<PartnerSummary>({ active_partners: 0, total_referred: 0, total_converted: 0, conversion_rate: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showPartnerModal, setShowPartnerModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

    /* ─── Fetch data ─── */
    const loadData = useCallback(async () => {
        try {
            const [partnerList, summaryData] = await Promise.all([
                partnerApi.fetchPartners({
                    search: searchQuery || undefined,
                    status: statusFilter || undefined,
                }),
                partnerApi.fetchPartnerSummary(),
            ]);
            setPartners(partnerList);
            setSummary(summaryData);
        } catch (err) {
            console.error("Failed to load partners:", err);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter]);

    useEffect(() => { loadData(); }, [loadData]);

    /* ─── CRUD handlers ─── */
    const handleSave = async (data: PartnerCreateInput | PartnerUpdateInput, id?: string) => {
        if (id) {
            await partnerApi.updatePartner(id, data as PartnerUpdateInput);
        } else {
            await partnerApi.createPartner(data as PartnerCreateInput);
        }
        await loadData();
    };

    const handleDelete = async (partner: Partner) => {
        if (!confirm(`Delete "${partner.name}"? Leads referred by this partner won't be deleted, but the link will be removed.`)) return;
        try {
            await partnerApi.deletePartner(partner.id);
            await loadData();
        } catch (err) {
            alert(`Delete failed: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
    };

    const handleToggleStatus = async (partner: Partner) => {
        const newStatus = partner.status === "active" ? "inactive" : "active";
        try {
            await partnerApi.updatePartner(partner.id, { status: newStatus });
            await loadData();
        } catch (err) {
            alert(`Status update failed: ${err instanceof Error ? err.message : "Unknown error"}`);
        }
    };

    const openEdit = (partner: Partner) => {
        setEditingPartner(partner);
        setShowPartnerModal(true);
    };

    const openCreate = () => {
        setEditingPartner(null);
        setShowPartnerModal(true);
    };

    /* ─── Summary cards config ─── */
    const summaryCards = [
        { label: "Partner Sources", value: summary.active_partners, icon: "🤝", color: "#6366f1" },
        { label: "Total Referrals", value: summary.total_referred, icon: "📥", color: "#f59e0b" },
        { label: "Converted", value: summary.total_converted, icon: "✅", color: "#22d3a7" },
        { label: "Conversion Rate", value: `${summary.conversion_rate}%`, icon: "📊", color: "#38bdf8" },
    ];

    /* ─── Branch name resolver ─── */
    const branchName = (id: string | null) => {
        if (!id) return "All Branches";
        return branches.find((b) => b.id === id)?.name ?? id;
    };

    if (loading) {
        return (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14, fontFamily: "var(--font-primary)" }}>
                Loading partners…
            </div>
        );
    }

    return (
        <div style={{ flex: 1, overflowY: "auto", padding: 20, fontFamily: "var(--font-primary)" }}>
            {/* ── Summary cards ── */}
            <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
                {summaryCards.map((card) => (
                    <div key={card.label} style={{ flex: "1 1 180px", padding: "16px 18px", borderRadius: 12, background: `${card.color}10`, border: `1.5px solid ${card.color}25`, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ fontSize: 26 }}>{card.icon}</div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: card.color }}>{card.value}</div>
                            <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 500 }}>{card.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Section header + actions ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Partner & Tie-up Sources</h2>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {partners.length} partner{partners.length !== 1 ? "s" : ""} · Manage shops, vendors, and partners that refer potential leads
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10,
                        fontSize: 13, fontWeight: 700, background: "var(--accent)", color: "#0f1623", border: "none",
                        cursor: "pointer", transition: "all 150ms ease", boxShadow: "0 2px 10px rgba(34,211,167,0.25)", fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Partner Source
                </button>
            </div>

            {/* ── Filter bar ── */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: 8, padding: "6px 12px", flex: "0 1 260px", minWidth: 160 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        type="text" placeholder="Search partners…" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: "var(--text-primary)", width: "100%", fontFamily: "inherit" }}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
                <select
                    value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ background: "var(--bg-input)", border: `1px solid ${statusFilter ? "var(--accent)" : "var(--border-default)"}`, borderRadius: 8, color: statusFilter ? "var(--accent)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: statusFilter ? 600 : 400, padding: "6px 10px", outline: "none", cursor: "pointer", fontFamily: "inherit", minWidth: 120 }}
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* ── Partners table ── */}
            {partners.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, border: "2px dashed var(--border-default)", borderRadius: 12 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
                    <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>No partners found</div>
                    <div>Add your first partner source to start tracking referrals</div>
                </div>
            ) : (
                <div style={{ borderRadius: 12, border: "1.5px solid var(--border-default)", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                        <thead>
                            <tr style={{ background: "var(--bg-section)" }}>
                                {["Partner Name", "Type", "Contact", "Phone", "Branch", "Referred", "Converted", "Conv. %", "Status", ""].map((h) => (
                                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "var(--font-primary)" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {partners.map((p) => (
                                <tr key={p.id}
                                    style={{ borderTop: "1px solid var(--border-light)", cursor: "pointer", transition: "background 120ms ease" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                                    onClick={() => openEdit(p)}
                                >
                                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>
                                        {p.name}
                                        {p.notes && (
                                            <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontWeight: 400, marginTop: 1, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {p.notes}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>
                                        <span style={{ padding: "2px 8px", borderRadius: 6, background: "var(--bg-section)", border: "1px solid var(--border-default)", fontSize: 11, fontWeight: 500 }}>{p.type}</span>
                                    </td>
                                    <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>{p.contact_person || "—"}</td>
                                    <td style={{ padding: "10px 14px", color: "var(--text-secondary)" }}>{p.phone || "—"}</td>
                                    <td style={{ padding: "10px 14px", color: "var(--text-secondary)", fontSize: 11.5 }}>{branchName(p.branch_id)}</td>
                                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--text-primary)" }}>{p.leads_referred}</td>
                                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--success)" }}>{p.leads_converted}</td>
                                    <td style={{ padding: "10px 14px" }}>
                                        <span style={{
                                            fontWeight: 700,
                                            color: p.conversion_rate >= 40 ? "var(--success)" : p.conversion_rate >= 20 ? "#f59e0b" : "var(--danger)",
                                        }}>
                                            {p.conversion_rate}%
                                        </span>
                                    </td>
                                    <td style={{ padding: "10px 14px" }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleToggleStatus(p)}
                                            style={{
                                                padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "none",
                                                background: p.status === "active" ? "rgba(34,211,167,0.12)" : "rgba(248,113,113,0.12)",
                                                color: p.status === "active" ? "#22d3a7" : "#f87171",
                                                transition: "all 150ms ease",
                                            }}
                                        >
                                            {p.status === "active" ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td style={{ padding: "10px 14px" }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleDelete(p)}
                                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", padding: 4, borderRadius: 4, transition: "color 120ms ease" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--danger)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                                            title="Delete partner"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Info callout ── */}
            <div style={{ marginTop: 18, padding: "14px 18px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 3 }}>How Partner Referrals Work</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                        Leads referred by partners appear as <strong style={{ color: "var(--text-primary)" }}>Potential Leads</strong> — the first stage in your pipeline.
                        Once your team contacts them and qualifies interest, they move to <strong style={{ color: "var(--text-primary)" }}>New Lead</strong> and continue through the regular pipeline.
                        Track which partners bring the most conversions to focus your tie-up efforts.
                    </div>
                </div>
            </div>

            {/* ── Partner modal ── */}
            {showPartnerModal && (
                <PartnerModal
                    branches={branches}
                    partner={editingPartner}
                    onClose={() => { setShowPartnerModal(false); setEditingPartner(null); }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function LeadPipelinePage(): JSX.Element {
  const {
    leads,
    filters,
    setFilters,
    summary,
    hasActiveFilters,
    listLoading,
    selectedLead,
    detailLoading,
    selectLead,
    closeDetail,
    createLead,
    updateFields,
    moveStage,
    setHall,
    updateMenu,
    addRemark,
    updateAddOns,
    importCSV,
  } = useLeads();

  const { branches, contractors, catalog, loading: refLoading } = useReferenceData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("pipeline");
  const [pipelineView, setPipelineView] = useState<PipelineView>("landing");

  /* ─── Filter helpers ─── */
  const setFilter = (key: string, val: string) =>
    setFilters({ ...filters, [key]: val });

  const clearFilters = () =>
    setFilters({ search: "", branch: "", event_type: "", source: "" });

  /* ─── Landing card navigation ─── */
  const handleLandingNavigate = (id: string): void => {
    if (id === "add") setShowAddModal(true);
    else if (id === "import") setShowCSVModal(true);
    else if (id === "view") setPipelineView("viewLeads");
    else if (id === "client") setPipelineView("viewClient");
  };

  /* ─── Loading state ─── */
  if (refLoading) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-primary)", color: "var(--text-muted)", fontSize: 14, background: "var(--bg-app)" }}>
        Loading…
      </div>
    );
  }

  /* ─── Tab button style helper ─── */
  const tabStyle = (tab: ActiveTab): React.CSSProperties => ({
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: activeTab === tab ? 700 : 500,
    color: activeTab === tab ? "var(--accent)" : "var(--text-secondary)",
    background: activeTab === tab ? "var(--accent-bg)" : "transparent",
    border: activeTab === tab ? "1.5px solid var(--accent)" : "1.5px solid transparent",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 150ms ease",
    fontFamily: "inherit",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "var(--bg-app)", fontFamily: "var(--font-primary)" }}>

      {/* ══════════════════════════════════════════
           Page Header
           ══════════════════════════════════════════ */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        gap: 12,
        flexWrap: "wrap",
      }}>
        {/* Title + tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.3 }}>
              Leads
            </h1>
            <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              {activeTab === "pipeline"
                ? `${leads.length} leads${hasActiveFilters ? " (filtered)" : ""}`
                : "Manage partner referral sources"}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 4, background: "var(--bg-section)", padding: 3, borderRadius: 10, border: "1px solid var(--border-default)" }}>
            <button onClick={() => { setActiveTab("pipeline"); setPipelineView("landing"); }} style={tabStyle("pipeline")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Lead Pipeline
            </button>
            <button onClick={() => setActiveTab("generation")} style={tabStyle("generation")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Lead Generation
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
           Tab Content
           ══════════════════════════════════════════ */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {activeTab === "pipeline" ? (
          listLoading && leads.length === 0 ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
              Loading leads…
            </div>
          ) : (
            <>
              {/* ── Landing ── */}
              {pipelineView === "landing" && (
                <div style={{ flex: 1, overflowY: "auto" }}>
                  <LandingView
                    summary={summary}
                    leadCount={leads.length}
                    onNavigate={handleLandingNavigate}
                  />
                </div>
              )}

              {/* ── View Leads (Accordion) ── */}
              {pipelineView === "viewLeads" && (
                <>
                  <ViewLeadsSection
                    leads={leads}
                    filters={filters}
                    branches={branches}
                    onSetFilter={setFilter}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                    onSelectLead={selectLead}
                    onBack={() => setPipelineView("landing")}
                  />

                  {/* Side panel overlay for "View Leads" */}
                  {selectedLead && (
                    <>
                      <div
                        className="animate-fade-in"
                        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 150 }}
                        onClick={closeDetail}
                      />
                      <LeadDetailPanel
                        lead={selectedLead}
                        onClose={closeDetail}
                        onUpdateFields={updateFields}
                        onMoveStage={moveStage}
                        onSetHall={setHall}
                        onUpdateMenu={updateMenu}
                        onAddRemark={addRemark}
                        onUpdateAddOns={updateAddOns}
                        contractors={contractors}
                        catalog={catalog}
                      />
                    </>
                  )}

                  {/* Loading indicator for detail */}
                  {detailLoading && !selectedLead && (
                    <div style={{ position: "fixed", top: 0, right: 0, width: 480, height: "100vh", background: "var(--bg-section)", boxShadow: "var(--shadow-panel)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--font-primary)" }}>Loading…</div>
                    </div>
                  )}
                </>
              )}

              {/* ── View Specific Client (Full Page) ── */}
              {pipelineView === "viewClient" && (
                <ClientSearchView
                  leads={leads}
                  onSelectLead={selectLead}
                  selectedLead={selectedLead}
                  detailLoading={detailLoading}
                  onCloseDetail={closeDetail}
                  onUpdateFields={updateFields}
                  onMoveStage={moveStage}
                  onSetHall={setHall}
                  onUpdateMenu={updateMenu}
                  onAddRemark={addRemark}
                  onUpdateAddOns={updateAddOns}
                  contractors={contractors}
                  catalog={catalog}
                  onBack={() => { closeDetail(); setPipelineView("landing"); }}
                />
              )}
            </>
          )
        ) : (
          // Lead Generation tab — keep original LeadGenerationSection here
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>
            <LeadGenerationSection branches={branches} />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddLeadModal
          branches={branches}
          onClose={() => setShowAddModal(false)}
          onAdd={async (data) => { await createLead(data); setShowAddModal(false); }}
        />
      )}
      {showCSVModal && (
        <CSVImportModal
          onClose={() => setShowCSVModal(false)}
          onImport={importCSV}
        />
      )}
    </div>
  );
}
