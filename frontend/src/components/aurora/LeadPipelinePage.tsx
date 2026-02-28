import { useState, useMemo, useEffect, useCallback } from "react";
import useLeads from "../../hooks/useLeads";
import useReferenceData from "../../hooks/useReferenceData";
import KanbanBoard from "../leads/KanbanBoard";
import { AddLeadModal, CSVImportModal } from "../leads";
import { Button, Modal } from "../ui";
import { STAGES, EVENT_TYPES, LEAD_SOURCES } from "../../constants";
import type { SummaryStats, Partner, PartnerCreateInput, PartnerUpdateInput, PartnerSummary, Branch } from "../../types";
import * as partnerApi from "../../api/client";

/* ─── Tabs ─── */
type ActiveTab = "pipeline" | "generation";

/* ─── Stage summary items shown in page header ─── */
const SUMMARY_ITEMS = [
    { label: "New", getCount: (s: SummaryStats) => s.new, color: "#6366f1" },
    { label: "Active", getCount: (s: SummaryStats) => s.active, color: "#f59e0b" },
    { label: "Won", getCount: (s: SummaryStats) => s.converted, color: "#22d3a7" },
    { label: "Lost", getCount: (s: SummaryStats) => s.lost, color: "#f87171" },
] as const;


/* ═══════════════════════════════════════════════════════════
   Add / Edit Partner Modal
   ═══════════════════════════════════════════════════════════ */
interface PartnerModalProps {
    branches: Branch[];
    partner?: Partner | null;
    onClose: () => void;
    onSave: (data: PartnerCreateInput | PartnerUpdateInput, id?: string) => Promise<void>;
}

const partnerInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    border: "1.5px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    fontSize: 13,
    fontFamily: "var(--font-primary)",
    outline: "none",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
};

const partnerLabelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--text-secondary)",
    fontFamily: "var(--font-primary)",
    marginBottom: 4,
    display: "block",
};

const PARTNER_TYPES = [
    "Jewellery Shop",
    "Wedding Planner",
    "Clothing Store",
    "Catering Partner",
    "Photography Studio",
    "Makeup Artist",
    "Florist",
    "DJ / Entertainment",
    "Travel Agent",
    "Other",
];

function PartnerModal({ branches, partner, onClose, onSave }: PartnerModalProps): JSX.Element {
    const isEdit = !!partner;

    const [form, setForm] = useState({
        name: partner?.name ?? "",
        type: partner?.type ?? PARTNER_TYPES[0],
        contact_person: partner?.contact_person ?? "",
        phone: partner?.phone ?? "",
        email: partner?.email ?? "",
        branch_id: partner?.branch_id ?? "",
        notes: partner?.notes ?? "",
    });
    const [saving, setSaving] = useState(false);

    const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.type.trim()) return;
        setSaving(true);
        try {
            const payload = {
                ...form,
                branch_id: form.branch_id || null,
            };
            await onSave(payload, partner?.id);
            onClose();
        } catch (err) {
            alert(`Failed to save: ${err instanceof Error ? err.message : "Unknown error"}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            title={isEdit ? "Edit Partner" : "Add Partner Source"}
            onClose={onClose}
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Partner"}
                    </Button>
                </>
            }
        >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                    <label style={partnerLabelStyle}>Partner / Business Name *</label>
                    <input placeholder="e.g. Rajesh Jewellers" value={form.name} onChange={(e) => set("name", e.target.value)} style={partnerInputStyle} />
                </div>
                <div>
                    <label style={partnerLabelStyle}>Type *</label>
                    <select value={form.type} onChange={(e) => set("type", e.target.value)} style={partnerInputStyle}>
                        {PARTNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label style={partnerLabelStyle}>Contact Person</label>
                    <input placeholder="Contact name" value={form.contact_person} onChange={(e) => set("contact_person", e.target.value)} style={partnerInputStyle} />
                </div>
                <div>
                    <label style={partnerLabelStyle}>Phone</label>
                    <input placeholder="Phone number" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={partnerInputStyle} />
                </div>
                <div>
                    <label style={partnerLabelStyle}>Email</label>
                    <input type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} style={partnerInputStyle} />
                </div>
                <div>
                    <label style={partnerLabelStyle}>Branch (optional)</label>
                    <select value={form.branch_id} onChange={(e) => set("branch_id", e.target.value)} style={partnerInputStyle}>
                        <option value="">All Branches</option>
                        {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                    <label style={partnerLabelStyle}>Notes</label>
                    <textarea
                        placeholder="Any notes about this partnership..."
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                        style={{ ...partnerInputStyle, minHeight: 60, resize: "vertical" } as React.CSSProperties}
                    />
                </div>
            </div>
        </Modal>
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
   Main Page
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
            {/* ══════════════════════════════════════════
                 Page Header
                 ══════════════════════════════════════════ */}
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

                    {/* ── Tab switcher ── */}
                    <div style={{ display: "flex", gap: 4, background: "var(--bg-section)", padding: 3, borderRadius: 10, border: "1px solid var(--border-default)" }}>
                        <button onClick={() => setActiveTab("pipeline")} style={tabStyle("pipeline")}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                            Lead Pipeline
                        </button>
                        <button onClick={() => setActiveTab("generation")} style={tabStyle("generation")}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            Lead Generation
                        </button>
                    </div>
                </div>

                {/* Summary pills (pipeline tab only) */}
                {activeTab === "pipeline" && (
                    <div style={{ display: "flex", gap: 6 }}>
                        {SUMMARY_ITEMS.map((item) => (
                            <div key={item.label} style={{ padding: "5px 12px", borderRadius: 8, background: `${item.color}18`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", gap: 5 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, display: "inline-block", flexShrink: 0 }} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.getCount(summary)}</span>
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action buttons (pipeline tab only) */}
                {activeTab === "pipeline" && (
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
                        {/* ── BIGGER Add Lead button ── */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            style={{
                                display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 10,
                                fontSize: 14, fontWeight: 700, background: "var(--accent)", color: "#0f1623", border: "none",
                                cursor: "pointer", transition: "all 150ms ease", boxShadow: "0 3px 14px rgba(34,211,167,0.3)", fontFamily: "inherit",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-hover)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(34,211,167,0.4)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.boxShadow = "0 3px 14px rgba(34,211,167,0.3)"; }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add Lead
                        </button>
                    </div>
                )}
            </div>

            {/* ══════════════════════════════════════════
                 Filter Bar (pipeline tab only)
                 ══════════════════════════════════════════ */}
            {activeTab === "pipeline" && (
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
                        {STAGES.slice(0, 7).map((s) => {
                            const count = stageCounts[s.id] ?? 0;
                            return count > 0 ? (
                                <span key={s.id} style={{ fontSize: 10.5, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30`, whiteSpace: "nowrap" }}>
                                    {s.icon} {s.label.split(" ")[0]} · {count}
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════
                 Tab Content
                 ══════════════════════════════════════════ */}
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {activeTab === "pipeline" ? (
                    listLoading && leads.length === 0 ? (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading leads…</div>
                    ) : (
                        <KanbanBoard leads={leads} selectedLead={selectedLead} detailLoading={detailLoading} onSelectLead={selectLead} onCloseDetail={closeDetail} onUpdateFields={updateFields} onMoveStage={moveStage} onSetHall={setHall} onUpdateMenu={updateMenu} onAddRemark={addRemark} onUpdateAddOns={updateAddOns} contractors={contractors} catalog={catalog} />
                    )
                ) : (
                    <LeadGenerationSection branches={branches} />
                )}
            </div>

            {showAddModal && (<AddLeadModal branches={branches} onClose={() => setShowAddModal(false)} onAdd={async (data) => { await createLead(data); setShowAddModal(false); }} />)}
            {showCSVModal && (<CSVImportModal onClose={() => setShowCSVModal(false)} onImport={importCSV} />)}
        </div>
    );
}
