import type { Stage, StageId, EventType, LeadSource } from "../types";

// ============================================
// PIPELINE STAGES (UI display config)
// ============================================

export const STAGES: Stage[] = [
  { id: "new", label: "New Lead", icon: "✦", color: "#6366f1", bg: "#eef2ff" },
  { id: "call", label: "Call", icon: "✆", color: "#8b5cf6", bg: "#f5f3ff" },
  { id: "visit", label: "Property Visit", icon: "⌂", color: "#d97706", bg: "#fffbeb" },
  { id: "tasting", label: "Food Tasting", icon: "◎", color: "#ea580c", bg: "#fff7ed" },
  { id: "menu", label: "Menu Finalization", icon: "☰", color: "#0891b2", bg: "#ecfeff" },
  { id: "advance", label: "Advance Payment", icon: "₹", color: "#059669", bg: "#ecfdf5" },
  { id: "decor", label: "Decoration & Event Final", icon: "❋", color: "#7c3aed", bg: "#f5f3ff" },
  { id: "fullpay", label: "Full Payment", icon: "$", color: "#16a34a", bg: "#f0fdf4" },
  { id: "post", label: "Post-Event Settlement", icon: "✓", color: "#64748b", bg: "#f8fafc" },
  { id: "feedback", label: "Feedback", icon: "★", color: "#0ea5e9", bg: "#f0f9ff" },
  { id: "converted", label: "Converted ✅", icon: "✔", color: "#15803d", bg: "#f0fdf4" },
  { id: "lost", label: "Lost ❌", icon: "✘", color: "#dc2626", bg: "#fef2f2" },
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
// EVENT TYPE STYLING
// ============================================

export const EVENT_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  Wedding: { bg: "#fef3c7", color: "#92400e" },
  "Corporate Event": { bg: "#dbeafe", color: "#1e40af" },
  Reception: { bg: "#fce7f3", color: "#9d174d" },
  "Birthday Party": { bg: "#ede9fe", color: "#5b21b6" },
  Conference: { bg: "#e0f2fe", color: "#0369a1" },
  Anniversary: { bg: "#fef3c7", color: "#b45309" },
  Engagement: { bg: "#fce7f3", color: "#be185d" },
  "Social Gathering": { bg: "#f3f4f6", color: "#374151" },
};

export const DEFAULT_ADVANCE_PERCENT = 20;
