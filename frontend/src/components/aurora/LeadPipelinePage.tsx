import { useState } from "react";
import useLeads from "../../hooks/useLeads";
import KanbanBoard from "../leads/KanbanBoard";
import { AddLeadModal, CSVImportModal } from "../leads";
import { STAGES, TERMINAL_STAGES, BRANCHES, EVENT_TYPES, LEAD_SOURCES } from "../../constants";
import type { StageId } from "../../types";

/* ─── CSS variable override: map light-theme vars → dark aurora values ─── */
const DARK_SCOPE_VARS: React.CSSProperties = {
    // Backgrounds
    ["--bg-app" as string]: "#111827",
    ["--bg-card" as string]: "#1a2332",
    ["--bg-section" as string]: "#151f2d",
    ["--bg-hover" as string]: "#1f2a3a",
    ["--bg-input" as string]: "#1a2332",
    // Text
    ["--text-primary" as string]: "#e2e8f0",
    ["--text-secondary" as string]: "#94a3b8",
    ["--text-muted" as string]: "#64748b",
    // Borders
    ["--border-default" as string]: "rgba(255,255,255,0.07)",
    ["--border-light" as string]: "rgba(255,255,255,0.04)",
    // Accent
    ["--accent" as string]: "#22d3a7",
    ["--accent-bg" as string]: "rgba(34,211,167,0.12)",
    ["--accent-hover" as string]: "#1ab892",
    // Semantic
    ["--danger" as string]: "#f87171",
    ["--danger-bg" as string]: "rgba(248,113,113,0.1)",
    ["--danger-border" as string]: "rgba(248,113,113,0.25)",
    ["--success" as string]: "#34d399",
    ["--success-bg" as string]: "rgba(52,211,153,0.1)",
    ["--success-border" as string]: "rgba(52,211,153,0.25)",
    ["--warning" as string]: "#fbbf24",
    // Shadows (darkened for dark bg)
    ["--shadow-sm" as string]: "0 1px 4px rgba(0,0,0,0.4)",
    ["--shadow-md" as string]: "0 4px 16px rgba(0,0,0,0.5)",
    ["--shadow-lg" as string]: "0 8px 30px rgba(0,0,0,0.6)",
    ["--shadow-panel" as string]: "-8px 0 40px rgba(0,0,0,0.5)",
    // Font
    ["--font-primary" as string]: "\"Outfit\", system-ui, -apple-system, sans-serif",
};

/* ─── Stage summary items shown in page header ─── */
const SUMMARY_ITEMS = [
    { label: "New", getCount: (c: Record<StageId, number>) => c.new ?? 0, color: "#6366f1" },
    {
        label: "Active",
        getCount: (c: Record<StageId, number>) =>
            Object.entries(c)
                .filter(([k]) => !["new", ...TERMINAL_STAGES].includes(k as StageId))
                .reduce((a, [, v]) => a + v, 0),
        color: "#f59e0b",
    },
    { label: "Won", getCount: (c: Record<StageId, number>) => c.converted ?? 0, color: "#22d3a7" },
    { label: "Lost", getCount: (c: Record<StageId, number>) => c.lost ?? 0, color: "#f87171" },
] as const;

export default function LeadPipelinePage(): JSX.Element {
    const {
        filteredLeads,
        filters,
        setFilters,
        stageCounts,
        hasActiveFilters,
        updateLead,
        moveStage,
        addLead,
        importCSV,
    } = useLeads();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showCSVModal, setShowCSVModal] = useState(false);

    /* ─── Helper: update one filter key ─── */
    const setFilter = (key: keyof typeof filters, val: string) =>
        setFilters({ ...filters, [key]: val });

    const clearFilters = () =>
        setFilters({ search: "", branch: "", eventType: "", source: "" });

    const activeFilterCount = [filters.branch, filters.eventType, filters.source].filter(Boolean).length;

    return (
        <div
            style={{
                ...DARK_SCOPE_VARS,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
                background: "#111827",
                fontFamily: "var(--aurora-font, 'Outfit', system-ui)",
            }}
        >
            {/* ── Page Header ── */}
            <div
                style={{
                    padding: "16px 20px 12px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                    gap: 12,
                    flexWrap: "wrap",
                }}
            >
                {/* Left: title + subtitle */}
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#e2e8f0",
                            letterSpacing: -0.3,
                        }}
                    >
                        Lead Pipeline
                    </h1>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {filteredLeads.length} leads{hasActiveFilters ? " (filtered)" : ""}
                    </p>
                </div>

                {/* Centre: stage summary badges */}
                <div style={{ display: "flex", gap: 6 }}>
                    {SUMMARY_ITEMS.map((item) => (
                        <div
                            key={item.label}
                            style={{
                                padding: "5px 12px",
                                borderRadius: 8,
                                background: `${item.color}18`,
                                border: `1px solid ${item.color}30`,
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                            }}
                        >
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    background: item.color,
                                    display: "inline-block",
                                    flexShrink: 0,
                                }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>
                                {item.getCount(stageCounts)}
                            </span>
                            <span style={{ fontSize: 11, color: "#64748b" }}>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Right: action buttons */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                        onClick={() => setShowCSVModal(true)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 14px",
                            borderRadius: 8,
                            fontSize: 12.5,
                            fontWeight: 600,
                            background: "rgba(255,255,255,0.04)",
                            color: "#94a3b8",
                            border: "1px solid rgba(255,255,255,0.08)",
                            cursor: "pointer",
                            transition: "all 150ms ease",
                            fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                            e.currentTarget.style.color = "#e2e8f0";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                            e.currentTarget.style.color = "#94a3b8";
                        }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <path d="M17 8l-5-5-5 5" />
                            <path d="M12 3v12" />
                        </svg>
                        Import CSV
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "7px 16px",
                            borderRadius: 8,
                            fontSize: 12.5,
                            fontWeight: 600,
                            background: "#22d3a7",
                            color: "#0f1623",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 150ms ease",
                            boxShadow: "0 2px 10px rgba(34,211,167,0.25)",
                            fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#1ab892"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#22d3a7"; }}
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Lead
                    </button>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div
                style={{
                    padding: "8px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                    flexWrap: "wrap",
                }}
            >
                {/* Search */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        background: "#1a2332",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: 8,
                        padding: "6px 12px",
                        flex: "0 1 240px",
                        minWidth: 160,
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search name, phone..."
                        value={filters.search}
                        onChange={(e) => setFilter("search", e.target.value)}
                        style={{
                            border: "none",
                            background: "transparent",
                            outline: "none",
                            fontSize: 12.5,
                            color: "#e2e8f0",
                            width: "100%",
                            fontFamily: "inherit",
                        }}
                    />
                    {filters.search && (
                        <button
                            onClick={() => setFilter("search", "")}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0, display: "flex" }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Dropdowns */}
                {([
                    { key: "branch" as const, placeholder: "All Branches", options: BRANCHES },
                    { key: "eventType" as const, placeholder: "All Events", options: EVENT_TYPES as string[] },
                    { key: "source" as const, placeholder: "All Sources", options: LEAD_SOURCES as string[] },
                ] as const).map(({ key, placeholder, options }) => (
                    <select
                        key={key}
                        value={filters[key]}
                        onChange={(e) => setFilter(key, e.target.value)}
                        style={{
                            background: "#1a2332",
                            border: `1px solid ${filters[key] ? "rgba(34,211,167,0.4)" : "rgba(255,255,255,0.07)"}`,
                            borderRadius: 8,
                            color: filters[key] ? "#22d3a7" : "#94a3b8",
                            fontSize: 12.5,
                            fontWeight: filters[key] ? 600 : 400,
                            padding: "6px 10px",
                            outline: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            minWidth: 110,
                        }}
                    >
                        <option value="">{placeholder}</option>
                        {options.map((o) => (
                            <option key={o} value={o} style={{ color: "#e2e8f0", background: "#1a2332" }}>
                                {o}
                            </option>
                        ))}
                    </select>
                ))}

                {/* Clear filters */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#22d3a7",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            padding: "4px 2px",
                        }}
                    >
                        Clear all
                    </button>
                )}

                {/* Stage quick-filter chips */}
                <div
                    style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: 5,
                        alignItems: "center",
                    }}
                >
                    {STAGES.slice(0, 6).map((s) => {
                        const count = stageCounts[s.id] ?? 0;
                        return count > 0 ? (
                            <span
                                key={s.id}
                                style={{
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    padding: "3px 9px",
                                    borderRadius: 20,
                                    background: `${s.color}18`,
                                    color: s.color,
                                    border: `1px solid ${s.color}30`,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {s.icon} {s.label.split(" ")[0]} · {count}
                            </span>
                        ) : null;
                    })}
                </div>
            </div>

            {/* ── Kanban Board (flex: 1 so it fills remaining height) ── */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                <KanbanBoard
                    leads={filteredLeads}
                    onUpdateLead={updateLead}
                    onMoveStage={moveStage}
                />
            </div>

            {/* ── Modals ── */}
            {showAddModal && (
                <AddLeadModal onClose={() => setShowAddModal(false)} onAdd={addLead} />
            )}
            {showCSVModal && (
                <CSVImportModal onClose={() => setShowCSVModal(false)} onImport={importCSV} />
            )}
        </div>
    );
}
