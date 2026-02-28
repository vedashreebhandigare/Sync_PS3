import type { Stage, StageId, EventType, LeadSource } from "../types";

// ============================================
// PIPELINE STAGES (UI display config — Aurora dark theme)
// ============================================

export const STAGES: Stage[] = [
  { id: "new", label: "New Lead", icon: "✦", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  { id: "call", label: "Call", icon: "✆", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
  { id: "visit", label: "Property Visit", icon: "⌂", color: "#d97706", bg: "rgba(217,119,6,0.12)" },
  { id: "tasting", label: "Food Tasting", icon: "◎", color: "#ea580c", bg: "rgba(234,88,12,0.12)" },
  { id: "menu", label: "Menu Finalization", icon: "☰", color: "#0891b2", bg: "rgba(8,145,178,0.12)" },
  { id: "advance", label: "Advance Payment", icon: "₹", color: "#059669", bg: "rgba(5,150,105,0.12)" },
  { id: "decor", label: "Decoration & Event Final", icon: "❋", color: "#7c3aed", bg: "rgba(124,58,237,0.12)" },
  { id: "fullpay", label: "Full Payment", icon: "$", color: "#16a34a", bg: "rgba(22,163,74,0.12)" },
  { id: "post", label: "Post-Event Settlement", icon: "✓", color: "#64748b", bg: "rgba(100,116,139,0.12)" },
  { id: "feedback", label: "Feedback", icon: "★", color: "#0ea5e9", bg: "rgba(14,165,233,0.12)" },
  { id: "converted", label: "Converted ✅", icon: "✔", color: "#15803d", bg: "rgba(21,128,61,0.12)" },
  { id: "lost", label: "Lost ❌", icon: "✘", color: "#dc2626", bg: "rgba(220,38,38,0.12)" },
];

export const TERMINAL_STAGES: StageId[] = ["converted", "lost"];

// ============================================
// ENUMS (for dropdowns)
// ============================================

export const EVENT_TYPES: EventType[] = [
  "Wedding", "Reception", "Corporate Event", "Birthday Party",
  "Anniversary", "Engagement", "Conference", "Social Gathering",
];

export const LEAD_SOURCES: LeadSource[] = [
  "Walk-in", "Website", "Referral", "Social Media", "Google Ads", "WhatsApp",
];

export const MENU_CATEGORIES = [
  "Starters", "Main Course", "Breads", "Desserts", "Beverages",
] as const;

// ============================================
// BRANCH LIST (static for filters)
// ============================================

export const BRANCHES = [
  "branch-andheri",
  "branch-thane",
  "branch-powai",
  "branch-panvel",
];

// ============================================
// EVENT TYPE STYLING — Aurora dark-mode colors
// ============================================

export const EVENT_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Wedding: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  "Corporate Event": { bg: "rgba(96,165,250,0.15)", color: "#60a5fa" },
  Reception: { bg: "rgba(244,114,182,0.15)", color: "#f472b6" },
  "Birthday Party": { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  Conference: { bg: "rgba(56,189,248,0.15)", color: "#38bdf8" },
  Anniversary: { bg: "rgba(251,191,36,0.15)", color: "#fbbf24" },
  Engagement: { bg: "rgba(244,114,182,0.15)", color: "#f472b6" },
  "Social Gathering": { bg: "rgba(148,163,184,0.15)", color: "#94a3b8" },
};

export const DEFAULT_ADVANCE_PERCENT = 20;
