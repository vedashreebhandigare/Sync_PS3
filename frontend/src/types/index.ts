// ============================================
// CORE DOMAIN TYPES
// ============================================

export type StageId =
  | "potential"
  | "new"
  | "call"
  | "visit"
  | "tasting"
  | "menu"
  | "advance"
  | "decor"
  | "fullpay"
  | "post"
  | "feedback"
  | "converted"
  | "lost";

export interface Stage {
  id: StageId;
  label: string;
  icon: string;
  color: string;
  bg: string;
}

export type EventType =
  | "Wedding"
  | "Reception"
  | "Corporate Event"
  | "Birthday Party"
  | "Anniversary"
  | "Engagement"
  | "Conference"
  | "Social Gathering";

export type LeadSource =
  | "Walk-in"
  | "Website"
  | "Referral"
  | "Social Media"
  | "Google Ads"
  | "WhatsApp"
  | "Partner Referral";

export type DecorType = "" | "internal" | "external";

export type MenuCategory =
  | "Starters"
  | "Main Course"
  | "Breads"
  | "Desserts"
  | "Beverages";

// ============================================
// API RESPONSE TYPES (snake_case from backend)
// ============================================

/** Returned by GET /api/branches */
export interface Branch {
  id: string;
  name: string;
}

/** Returned by GET /api/branches/{id}/halls */
export interface Hall {
  id: string;
  branch_id: string;
  name: string;
  location: string;
  capacity: number;
  event_types: string;       // comma-separated, e.g. "Wedding,Reception"
  cost_per_plate: number;
}

/** Returned inside LeadFull.menu_items */
export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  cost_per_plate: number;
}

/** Sent to PUT /api/leads/{id}/menu (no id — backend generates) */
export interface MenuItemInput {
  name: string;
  category: MenuCategory;
  cost_per_plate: number;
}

/** Returned by GET /api/menu-catalog */
export interface CatalogItem {
  id: string;
  name: string;
  category: MenuCategory;
  cost_per_plate: number;
}

/** Returned by GET /api/contractors */
export interface Contractor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
}

/** Returned inside LeadFull.add_ons */
export interface AddOn {
  id: string;
  desc: string;
  cost: number;
}

/** Sent to PUT /api/leads/{id}/addons */
export interface AddOnInput {
  desc: string;
  cost: number;
}

/** Returned inside LeadFull.remarks */
export interface Remark {
  id: number;
  text: string;
  author: string;
  date: string;
  stage: string;
}

// ============================================
// PARTNER TYPES (Lead Generation)
// ============================================

/** Returned by GET /api/partners (with computed stats) */
export interface Partner {
  id: string;
  name: string;
  type: string;
  contact_person: string;
  phone: string;
  email: string;
  branch_id: string | null;
  status: "active" | "inactive";
  notes: string;
  created_at: string;
  leads_referred: number;
  leads_converted: number;
  conversion_rate: number;
}

/** Sent to POST /api/partners */
export interface PartnerCreateInput {
  name: string;
  type: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  branch_id?: string | null;
  status?: "active" | "inactive";
  notes?: string;
}

/** Sent to PUT /api/partners/:id */
export interface PartnerUpdateInput {
  name?: string;
  type?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  branch_id?: string | null;
  status?: "active" | "inactive";
  notes?: string;
}

/** Returned by GET /api/partners/summary */
export interface PartnerSummary {
  active_partners: number;
  total_referred: number;
  total_converted: number;
  conversion_rate: number;
}

// ============================================
// LEAD TYPES
// ============================================

/** Returned by GET /api/leads (list — no nested sub-resources) */
export interface LeadBrief {
  id: string;
  name: string;
  phone: string;
  email: string;
  event_type: EventType;
  event_date: string;
  guest_count: number;
  budget: string;
  branch: string;            // branch ID e.g. "branch-andheri"
  source: LeadSource;
  stage: StageId;
  assigned_to: string;
  next_follow_up: string | null;
  created_at: string;
  total_cost: number;
  advance_paid: number;
  referred_by_partner_id: string | null;
}

/** Returned by GET /api/leads/{id} (full detail with nested data) */
export interface LeadFull extends LeadBrief {
  selected_hall_id: string | null;
  menu_total: number;
  food_preferences: string;
  allergies: string;
  advance_percent: number;
  decor_type: DecorType;
  decor_contractors: string;   // comma-separated contractor IDs
  feedback_positives: string;
  feedback_negatives: string;
  menu_items: MenuItem[];
  add_ons: AddOn[];
  remarks: Remark[];
}

/** Sent to POST /api/leads */
export interface LeadCreateInput {
  name: string;
  phone?: string;
  email?: string;
  event_type: EventType;
  event_date: string;
  guest_count?: number;
  budget?: string;
  branch: string;
  source?: LeadSource;
  assigned_to?: string;
  next_follow_up?: string;
  food_preferences?: string;
  allergies?: string;
  advance_percent?: number;
  referred_by_partner_id?: string | null;
}

/** Sent to PUT /api/leads/{id} (partial update) */
export interface LeadUpdateInput {
  name?: string;
  phone?: string;
  email?: string;
  event_type?: EventType;
  event_date?: string;
  guest_count?: number;
  budget?: string;
  branch?: string;
  source?: LeadSource;
  assigned_to?: string;
  next_follow_up?: string | null;
  food_preferences?: string;
  allergies?: string;
  advance_percent?: number;
  advance_paid?: number;
  decor_type?: DecorType;
  decor_contractors?: string;
  feedback_positives?: string;
  feedback_negatives?: string;
  referred_by_partner_id?: string | null;
}

// ============================================
// STATS TYPES
// ============================================

export interface PipelineStat {
  stage: StageId;
  count: number;
}

export interface SummaryStats {
  new: number;
  active: number;
  converted: number;
  lost: number;
  potential: number;
}

// ============================================
// FILTER TYPES
// ============================================

export interface LeadFilters {
  search: string;
  branch: string;
  event_type: string;
  source: string;
}

// ============================================
// UI TYPES (unchanged)
// ============================================

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "ghost";
