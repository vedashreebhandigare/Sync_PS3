// ============================================
// AUTH TYPES
// ============================================

export type UserRole = "owner" | "branch_manager";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  branch_id: string | null;
  branch_name: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

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
  | "Snacks"
  | "Indian Chaat"
  | "Main Course"
  | "Breads"
  | "Desserts"
  | "Beverages";

// ============================================
// API RESPONSE TYPES (snake_case from backend)
// ============================================

export interface Branch {
  id: string;
  name: string;
}

export interface Hall {
  id: string;
  branch_id: string;
  name: string;
  location: string;
  capacity: number;
  event_types: string;
  cost_per_plate: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  cost_per_plate: number;
}

export interface MenuItemInput {
  name: string;
  category: MenuCategory;
  cost_per_plate: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: MenuCategory;
  cost_per_plate: number;
}

export interface Contractor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
}

export interface AddOn {
  id: string;
  desc: string;
  cost: number;
}

export interface AddOnInput {
  desc: string;
  cost: number;
}

export interface Remark {
  id: number;
  text: string;
  author: string;
  date: string;
  stage: string;
}

// ============================================
// PARTNER TYPES
// ============================================

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

export interface PartnerSummary {
  active_partners: number;
  total_referred: number;
  total_converted: number;
  conversion_rate: number;
}

// ============================================
// LEAD TYPES
// ============================================

export interface LeadBrief {
  id: string;
  name: string;
  phone: string;
  email: string;
  event_type: EventType;
  event_date: string;
  guest_count: number;
  budget: string;
  branch: string;
  source: LeadSource;
  stage: StageId;
  assigned_to: string;
  next_follow_up: string | null;
  created_at: string;
  total_cost: number;
  advance_paid: number;
  referred_by_partner_id: string | null;
}

export interface LeadFull extends LeadBrief {
  selected_hall_id: string | null;
  menu_total: number;
  food_preferences: string;
  allergies: string;
  advance_percent: number;
  decor_type: DecorType;
  decor_contractors: string;
  feedback_positives: string;
  feedback_negatives: string;
  menu_items: MenuItem[];
  add_ons: AddOn[];
  remarks: Remark[];
}

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
// UI TYPES
// ============================================

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "ghost";

// ============================================
// INVENTORY / LOGISTICS TYPES
// ============================================

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  low_stock_threshold: number;
}

export interface InventoryItemInput {
  name: string;
  unit: string;
  quantity: number;
  low_stock_threshold: number;
}

// ============================================
// CALL COACHING TYPES
// ============================================

export type CallStatus =
  | "initiated"
  | "ringing"
  | "in-progress"
  | "completed"
  | "failed";

export interface TranscriptEntry {
  speaker: "staff" | "client" | "system";
  text: string;
  timestamp: string;
}

export interface AISuggestion {
  suggestion: string;
  reason: string;
  timestamp: string;
}

export interface CallRecord {
  id: string;
  lead_id: string;
  phone_number?: string;
  twilio_sid: string | null;
  start_time: string;
  started_at?: string;
  end_time: string | null;
  ended_at?: string | null;
  duration_seconds: number;
  transcript: string;
  analysis: string;
  ai_analysis?: string;
  status: CallStatus;
}

export type CatalogItemInput = Omit<CatalogItem, "id">;
