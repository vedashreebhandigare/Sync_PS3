import { useState, useMemo } from "react";
import useLeads from "../../hooks/useLeads";
import useReferenceData from "../../hooks/useReferenceData";
import KanbanBoard from "../leads/KanbanBoard";
import { AddLeadModal, CSVImportModal } from "../leads";
import { STAGES, EVENT_TYPES, LEAD_SOURCES } from "../../constants";
import type { SummaryStats } from "../../types";

/* ─── Stage summary items shown in page header ─── */
const SUMMARY_ITEMS = [
    { label: "New", getCount: (s: SummaryStats) => s.new, color: "#6366f1" },
    { label: "Active", getCount: (s: SummaryStats) => s.active, color: "#f59e0b" },
    { label: "Won", getCount: (s: SummaryStats) => s.converted, color: "#22d3a7" },
    { label: "Lost", getCount: (s: SummaryStats) => s.lost, color: "#f87171" },
] as const;

export default function LeadPipelinePage() {
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

    /* ─── Derive per-stage counts from leads array ─── */
    const stageCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const lead of leads) {
            counts[lead.stage] = (counts[lead.stage] || 0) + 1;
        }
        return counts;
    }, [leads]);

    /* ─── Helper: update one filter key ─── */
    const setFilter = (key: keyof typeof filters, val: string) =>
        setFilters({ ...filters, [key]: val });

    const clearFilters = () =>
        setFilters({ search: "", branch: "", event_type: "", source: "" });

    const activeFilterCount = [filters.branch, filters.event_type, filters.source].filter(Boolean).length;

    /* ─── Loading state ─── */
    if (refLoading) {
        return (
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-primary)",
                    color: "var(--text-muted)",
                    fontSize: 14,
                    background: "var(--bg-app)",
                }}
            >
                Loading…
            </div>
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                background: "var(--bg-app)",
                fontFamily: "var(--font-primary)",
            }}
        >
            {/* ── Page Header ── */}
            <div
                style={{
                    padding: "16px 20px 12px",
                    borderBottom: "1px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.3 }}>
                        Lead Pipeline
                    </h1>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {leads.length} leads{hasActiveFilters ? " (filtered)" : ""}
                    </p>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                    {SUMMARY_ITEMS.map((item) => (
                        <div key={item.label} style={{ padding: "5px 12px", borderRadius: 8, background: `${item.color}18`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, display: "inline-block", flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.getCount(summary)}</span>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                        onClick={() => setShowCSVModal(true)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-default)", cursor: "pointer", transition: "all 150ms ease", fontFamily: "inherit" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
                        </svg>
                        Import CSV
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, fontSize: 12.5, fontWeight: 600, background: "var(--accent)", color: "#0f1623", border: "none", cursor: "pointer", transition: "all 150ms ease", boxShadow: "0 2px 10px rgba(34,211,167,0.25)", fontFamily: "inherit" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-hover)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Lead
                    </button>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--border-default)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--bg-input)", border: "1px solid var(--border-default)", borderRadius: 8, padding: "6px 12px", flex: "0 1 240px", minWidth: 160 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <input type="text" placeholder="Search name, phone..." value={filters.search} onChange={(e) => setFilter("search", e.target.value)}
                        style={{ border: "none", background: "transparent", outline: "none", fontSize: 12.5, color: "var(--text-primary)", width: "100%", fontFamily: "inherit" }} />
                    {filters.search && (
                        <button onClick={() => setFilter("search", "")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>

                {([
                    { key: "branch" as const, placeholder: "All Branches", options: branches.map((b) => b.name) },
                    { key: "event_type" as const, placeholder: "All Events", options: EVENT_TYPES as string[] },
                    { key: "source" as const, placeholder: "All Sources", options: LEAD_SOURCES as string[] },
                ] as const).map(({ key, placeholder, options }) => (
                    <select key={key} value={filters[key]} onChange={(e) => setFilter(key, e.target.value)}
                        style={{ background: "var(--bg-input)", border: `1px solid ${filters[key] ? "var(--accent)" : "var(--border-default)"}`, borderRadius: 8, color: filters[key] ? "var(--accent)" : "var(--text-secondary)", fontSize: 12.5, fontWeight: filters[key] ? 600 : 400, padding: "6px 10px", outline: "none", cursor: "pointer", fontFamily: "inherit", minWidth: 110 }}>
                        <option value="">{placeholder}</option>
                        {options.map((o) => (<option key={o} value={o} style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>{o}</option>))}
                    </select>
                ))}

                {activeFilterCount > 0 && (
                    <button onClick={clearFilters} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "4px 2px" }}>Clear all</button>
                )}

                <div style={{ marginLeft: "auto", display: "flex", gap: 5, alignItems: "center" }}>
                    {STAGES.slice(0, 6).map((s) => {
                        const count = stageCounts[s.id] ?? 0;
                        return count > 0 ? (
                            <span key={s.id} style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30`, whiteSpace: "nowrap" }}>
                                {s.icon} {s.label.split(" ")[0]} · {count}
                            </span>
                        ) : null;
                    })}
                </div>
            </div>

            {/* ── Kanban Board ── */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {listLoading && leads.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading leads…</div>
                ) : (
                    <KanbanBoard leads={leads} selectedLead={selectedLead} detailLoading={detailLoading} onSelectLead={selectLead} onCloseDetail={closeDetail} onUpdateFields={updateFields} onMoveStage={moveStage} onSetHall={setHall} onUpdateMenu={updateMenu} onAddRemark={addRemark} onUpdateAddOns={updateAddOns} contractors={contractors} catalog={catalog} />
                )}
            </div>

            {showAddModal && (<AddLeadModal branches={branches} onClose={() => setShowAddModal(false)} onAdd={async (data) => { await createLead(data); setShowAddModal(false); }} />)}
            {showCSVModal && (<CSVImportModal onClose={() => setShowCSVModal(false)} onImport={importCSV} />)}
        </div>
    );
}
