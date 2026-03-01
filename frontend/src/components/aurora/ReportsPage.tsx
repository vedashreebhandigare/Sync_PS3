import { useState, useEffect } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { getAuthToken } from "../../hooks/useAuth";

/* ─── Types ─── */
interface HallUtilization {
    hall_id: string;
    hall_name: string;
    times_booked: number;
}

interface BranchPerformance {
    branch_id: string;
    branch_name: string;
    total_leads: number;
    converted_leads: number;
    rejected_leads: number;
    conversion_rate: number;
    total_revenue: number;
    overall_performance_score: number;
    hall_utilization: HallUtilization[];
}

interface SourcePerformance {
    source: string;
    total_leads: number;
    converted_leads: number;
    conversion_rate: number;
    total_revenue: number;
}

const BASE = "";

/* ─── Light Theme Tokens ─── */
const T = {
    bg: "#f5f6fa",
    cardBg: "#ffffff",
    border: "#e2e5ed",
    text: "#1a1d26",
    textSecondary: "#5f6577",
    textMuted: "#8b90a0",
    hoverBg: "#eef0f5",
    shadow: "0 2px 12px rgba(0,0,0,0.06)",
    tooltipBg: "#ffffff",
    tooltipBorder: "#e2e5ed",
};

/* ─── Helpers ─── */
const fmtCurrency = (val: number) => `₹${val.toLocaleString("en-IN")}`;
const fmtLakh = (val: number) => `₹${(val / 100000).toFixed(1)}L`;

const BRANCH_COLORS = ["#7c3aed", "#2563eb", "#059669", "#d97706"];
const SOURCE_COLORS = ["#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626", "#0d9488", "#e11d48"];

function getGrade(score: number): { label: string; color: string; bg: string } {
    if (score >= 75) return { label: "Excellent", color: "#059669", bg: "#ecfdf5" };
    if (score >= 55) return { label: "Good", color: "#2563eb", bg: "#eff6ff" };
    if (score >= 35) return { label: "Average", color: "#d97706", bg: "#fffbeb" };
    return { label: "Needs Improvement", color: "#dc2626", bg: "#fef2f2" };
}

/* ─── Component ─── */
export default function ReportsPage() {
    const [branchData, setBranchData] = useState<BranchPerformance[]>([]);
    const [sourceData, setSourceData] = useState<SourcePerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchReports() {
            try {
                const token = getAuthToken();
                const headers: Record<string, string> = {};
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const [branchRes, sourceRes] = await Promise.all([
                    fetch(`${BASE}/api/stats/branch-performance`, { headers }),
                    fetch(`${BASE}/api/stats/source-performance`, { headers }),
                ]);

                if (branchRes.ok) setBranchData(await branchRes.json());
                else setError("Failed to load branch data");

                if (sourceRes.ok) setSourceData(await sourceRes.json());
            } catch (err) {
                console.error("Failed to load reports:", err);
                setError("Connection error: Could not reach backend.");
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, []);

    if (loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: T.bg, color: T.textMuted }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                    <div>Loading reports…</div>
                </div>
            </div>
        );
    }

    if (error && branchData.length === 0) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: T.bg, color: "#dc2626" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
                    <div>{error}</div>
                </div>
            </div>
        );
    }

    const totalRevenue = branchData.reduce((a, b) => a + b.total_revenue, 0);
    const totalConverted = branchData.reduce((a, b) => a + b.converted_leads, 0);
    const totalRejected = branchData.reduce((a, b) => a + b.rejected_leads, 0);
    const totalLeads = branchData.reduce((a, b) => a + b.total_leads, 0);
    const overallConversion = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : "0";

    const conversionChartData = branchData.map((b) => ({
        name: b.branch_name.replace(" Branch", ""),
        converted: b.converted_leads,
        rejected: b.rejected_leads,
        active: b.total_leads - b.converted_leads - b.rejected_leads,
        rate: b.conversion_rate,
    }));

    const revenueChartData = branchData.map((b, i) => ({
        name: b.branch_name.replace(" Branch", ""),
        revenue: b.total_revenue,
        fill: BRANCH_COLORS[i % BRANCH_COLORS.length],
    }));

    return (
        <div style={{ overflowY: "auto", height: "100%", padding: "28px 32px 64px 32px", background: T.bg, color: T.text }}>

            {/* ─── Header ─── */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: T.text }}>
                    📊 Business Reports
                </h1>
                <p style={{ marginTop: 6, color: T.textSecondary, fontSize: 14 }}>
                    Branch performance, conversion ratios, hall utilization &amp; lead source analysis — all from your real data.
                </p>
            </div>

            {/* ─── KPI Summary Cards ─── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
                {[
                    { label: "Total Revenue", value: fmtCurrency(totalRevenue), icon: "💰", accent: "#059669" },
                    { label: "Total Leads", value: totalLeads.toString(), icon: "📋", accent: "#2563eb" },
                    { label: "Converted", value: totalConverted.toString(), icon: "✅", accent: "#059669" },
                    { label: "Rejected (Lost)", value: totalRejected.toString(), icon: "❌", accent: "#dc2626" },
                    { label: "Overall Conversion", value: `${overallConversion}%`, icon: "📈", accent: "#7c3aed" },
                ].map((kpi) => (
                    <div
                        key={kpi.label}
                        style={{
                            background: T.cardBg,
                            border: `1px solid ${T.border}`,
                            borderRadius: 12,
                            padding: "20px 18px",
                            boxShadow: T.shadow,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 18 }}>{kpi.icon}</span>
                            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{kpi.label}</span>
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 700, color: kpi.accent }}>{kpi.value}</div>
                    </div>
                ))}
            </div>

            {/* ═══════════ SECTION 1: BRANCH-WISE PERFORMANCE RANKING ═══════════ */}
            <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: T.text }}>
                    🏆 Branch-wise Performance Ranking
                </h2>
                <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 18 }}>
                    Score = 40% Conversion Rate + 40% Revenue (relative) + 20% Hall Utilization Density.
                    Threshold: ≥75 Excellent · ≥55 Good · ≥35 Average · &lt;35 Needs Improvement.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                    {branchData.map((b, idx) => {
                        const grade = getGrade(b.overall_performance_score);
                        return (
                            <div
                                key={b.branch_id}
                                style={{
                                    background: T.cardBg,
                                    border: `1.5px solid ${grade.color}30`,
                                    borderRadius: 14,
                                    padding: 22,
                                    boxShadow: T.shadow,
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                            >
                                {/* Rank badge */}
                                <div style={{
                                    position: "absolute", top: 14, right: 16, width: 32, height: 32, borderRadius: "50%",
                                    background: grade.bg, display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 14, fontWeight: 700, color: grade.color,
                                }}>
                                    #{idx + 1}
                                </div>

                                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: T.text }}>
                                    {b.branch_name}
                                </div>

                                {/* Score bar */}
                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                        <span style={{ fontSize: 12, color: T.textMuted }}>Performance Score</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: grade.color }}>
                                            {b.overall_performance_score}/100 — {grade.label}
                                        </span>
                                    </div>
                                    <div style={{ height: 8, borderRadius: 4, background: T.hoverBg, overflow: "hidden" }}>
                                        <div style={{
                                            width: `${Math.min(b.overall_performance_score, 100)}%`,
                                            height: "100%",
                                            borderRadius: 4,
                                            background: `linear-gradient(90deg, ${grade.color}, ${grade.color}bb)`,
                                            transition: "width 0.6s ease",
                                        }} />
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", fontSize: 13 }}>
                                    <div>
                                        <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 2 }}>Revenue</div>
                                        <div style={{ fontWeight: 600, color: "#059669" }}>{fmtCurrency(b.total_revenue)}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 2 }}>Total Leads</div>
                                        <div style={{ fontWeight: 600, color: T.text }}>{b.total_leads}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 2 }}>Converted</div>
                                        <div style={{ fontWeight: 600, color: "#059669" }}>{b.converted_leads}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 2 }}>Rejected</div>
                                        <div style={{ fontWeight: 600, color: "#dc2626" }}>{b.rejected_leads}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 2 }}>Conversion Rate</div>
                                        <div style={{ fontWeight: 600, color: "#7c3aed" }}>{b.conversion_rate}%</div>
                                    </div>
                                    <div>
                                        <div style={{ color: T.textMuted, fontSize: 11, marginBottom: 2 }}>Rejection Rate</div>
                                        <div style={{ fontWeight: 600, color: "#dc2626" }}>
                                            {b.total_leads > 0 ? ((b.rejected_leads / b.total_leads) * 100).toFixed(1) : 0}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════ SECTION 2: REVENUE & CONVERSION CHARTS ═══════════ */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 36 }}>

                {/* Revenue by Branch */}
                <div style={{
                    background: T.cardBg, border: `1px solid ${T.border}`,
                    borderRadius: 14, padding: "22px 20px", boxShadow: T.shadow,
                }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: T.text }}>
                        💰 Revenue by Branch
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={revenueChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.border} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: T.textSecondary, fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tickFormatter={fmtLakh} tick={{ fill: T.textMuted, fontSize: 11 }} />
                            <RechartsTooltip
                                contentStyle={{ background: T.tooltipBg, border: `1px solid ${T.tooltipBorder}`, borderRadius: 8, fontSize: 13, color: T.text }}
                                formatter={(value: any) => [fmtCurrency(value), "Revenue"]}
                            />
                            <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                                {revenueChartData.map((_, i) => (
                                    <Cell key={i} fill={BRANCH_COLORS[i % BRANCH_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Converted vs Rejected vs Active */}
                <div style={{
                    background: T.cardBg, border: `1px solid ${T.border}`,
                    borderRadius: 14, padding: "22px 20px", boxShadow: T.shadow,
                }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, color: T.text }}>
                        📊 Converted vs Rejected vs Active (by Branch)
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={conversionChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={T.border} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: T.textSecondary, fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: T.textMuted, fontSize: 11 }} />
                            <RechartsTooltip contentStyle={{ background: T.tooltipBg, border: `1px solid ${T.tooltipBorder}`, borderRadius: 8, fontSize: 13, color: T.text }} />
                            <Legend wrapperStyle={{ fontSize: 12, color: T.textSecondary }} />
                            <Bar dataKey="converted" stackId="a" fill="#059669" name="Converted" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="rejected" stackId="a" fill="#dc2626" name="Rejected" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="active" stackId="a" fill="#2563eb" name="In Pipeline" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ═══════════ SECTION 3: HALL UTILIZATION ═══════════ */}
            <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: T.text }}>
                    🏛️ Hall Utilization (Converted Bookings)
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                    {branchData.map((branch) => (
                        <div
                            key={branch.branch_id}
                            style={{
                                background: T.cardBg, border: `1px solid ${T.border}`,
                                borderRadius: 14, padding: 20, boxShadow: T.shadow,
                            }}
                        >
                            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: "#7c3aed" }}>
                                {branch.branch_name}
                            </h4>

                            {branch.hall_utilization.length === 0 ? (
                                <div style={{ color: T.textMuted, fontSize: 13 }}>No halls assigned</div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {branch.hall_utilization.map((hall, hIdx) => {
                                        const maxBookings = branch.hall_utilization[0].times_booked || 1;
                                        const pct = (hall.times_booked / maxBookings) * 100;
                                        return (
                                            <div key={hall.hall_id}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                                                    <span style={{ color: T.text, fontWeight: 500 }}>
                                                        {hIdx === 0 ? "🥇 " : hIdx === branch.hall_utilization.length - 1 ? "🔻 " : ""}{hall.hall_name}
                                                    </span>
                                                    <span style={{
                                                        fontWeight: 600,
                                                        color: hIdx === 0 ? "#059669" : hIdx === branch.hall_utilization.length - 1 ? "#d97706" : T.textSecondary
                                                    }}>
                                                        {hall.times_booked} bookings
                                                    </span>
                                                </div>
                                                <div style={{ height: 6, borderRadius: 3, background: T.hoverBg, overflow: "hidden" }}>
                                                    <div style={{
                                                        width: `${pct}%`, height: "100%", borderRadius: 3,
                                                        background: hIdx === 0 ? "#059669" : hIdx === branch.hall_utilization.length - 1 ? "#d97706" : "#2563eb",
                                                        transition: "width 0.5s ease",
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════ SECTION 4: LEAD SOURCE ANALYSIS ═══════════ */}
            <div style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: T.text }}>
                    📡 Lead Source Analysis
                </h2>
                <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 18 }}>
                    Data sourced from the <code style={{ background: T.hoverBg, padding: "2px 6px", borderRadius: 4, fontSize: 12 }}>source</code> field of every lead in your database.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                    {/* Pie chart */}
                    <div style={{
                        background: T.cardBg, border: `1px solid ${T.border}`,
                        borderRadius: 14, padding: "22px 20px", boxShadow: T.shadow,
                    }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: T.text }}>
                            Lead Distribution by Source
                        </h3>
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={sourceData.filter(s => s.total_leads > 0)}
                                    cx="50%" cy="45%"
                                    innerRadius={50} outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="total_leads"
                                    nameKey="source"
                                >
                                    {sourceData.map((_, i) => (
                                        <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ background: T.tooltipBg, border: `1px solid ${T.tooltipBorder}`, borderRadius: 8, fontSize: 13, color: T.text }}
                                    formatter={(value: any, name: any) => [`${value} leads`, name]}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    wrapperStyle={{ fontSize: 12, paddingTop: 12, color: T.textSecondary }}
                                    formatter={(value: string) => {
                                        const item = sourceData.find(s => s.source === value);
                                        const total = sourceData.reduce((a, b) => a + b.total_leads, 0);
                                        const pct = item && total > 0 ? ((item.total_leads / total) * 100).toFixed(0) : "0";
                                        return `${value} (${pct}%)`;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Source table */}
                    <div style={{
                        background: T.cardBg, border: `1px solid ${T.border}`,
                        borderRadius: 14, padding: "22px 20px", boxShadow: T.shadow,
                    }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: T.text }}>
                            Source Performance Table
                        </h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                                    <th style={{ textAlign: "left", padding: "8px 6px", color: T.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>Source</th>
                                    <th style={{ textAlign: "right", padding: "8px 6px", color: T.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>Leads</th>
                                    <th style={{ textAlign: "right", padding: "8px 6px", color: T.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>Converted</th>
                                    <th style={{ textAlign: "right", padding: "8px 6px", color: T.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>Conv %</th>
                                    <th style={{ textAlign: "right", padding: "8px 6px", color: T.textMuted, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sourceData.map((s, i) => (
                                    <tr key={s.source} style={{ borderBottom: `1px solid ${T.border}` }}>
                                        <td style={{ padding: "10px 6px", fontWeight: 500, color: T.text }}>
                                            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: SOURCE_COLORS[i % SOURCE_COLORS.length], marginRight: 8 }} />
                                            {s.source}
                                        </td>
                                        <td style={{ padding: "10px 6px", textAlign: "right", color: T.textSecondary }}>{s.total_leads}</td>
                                        <td style={{ padding: "10px 6px", textAlign: "right", color: "#059669", fontWeight: 600 }}>{s.converted_leads}</td>
                                        <td style={{ padding: "10px 6px", textAlign: "right", color: "#7c3aed", fontWeight: 600 }}>{s.conversion_rate}%</td>
                                        <td style={{ padding: "10px 6px", textAlign: "right", fontWeight: 600, color: T.text }}>{fmtCurrency(s.total_revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ─── Performance Threshold Legend ─── */}
            <div style={{
                background: T.cardBg, border: `1px solid ${T.border}`,
                borderRadius: 14, padding: "18px 24px", boxShadow: T.shadow,
                display: "flex", gap: 28, alignItems: "center", fontSize: 12,
            }}>
                <span style={{ fontWeight: 600, color: T.textMuted }}>Performance Thresholds:</span>
                {[
                    { label: "≥75 Excellent", color: "#059669" },
                    { label: "≥55 Good", color: "#2563eb" },
                    { label: "≥35 Average", color: "#d97706" },
                    { label: "<35 Needs Improvement", color: "#dc2626" },
                ].map((t) => (
                    <span key={t.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: t.color, display: "inline-block" }} />
                        <span style={{ color: t.color, fontWeight: 500 }}>{t.label}</span>
                    </span>
                ))}
            </div>

        </div>
    );
}
