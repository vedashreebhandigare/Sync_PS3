// ============================================
// CORE DOMAIN TYPES
// ============================================

export type StageId =
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
  | "WhatsApp";

export type DecorType = "" | "internal" | "external";

// ============================================
// HALL / PROPERTY TYPES
// ============================================

export interface Hall {
  id: string;
  name: string;
  location: string;
  capacity: number;
  eventTypes: string[];
  costPerPlate: number;
}

export interface SelectedHall {
  id: string;
  name: string;
}

export type BranchesData = Record<string, Hall[]>;

// ============================================
// MENU TYPES
// ============================================

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  costPerPlate: number;
}

export type MenuCategory =
  | "Starters"
  | "Main Course"
  | "Breads"
  | "Desserts"
  | "Beverages";

export interface MenuCatalogEntry {
  category: MenuCategory;
  items: string[];
}

// ============================================
// CONTRACTOR TYPES
// ============================================

export interface Contractor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
}

// ============================================
// ADD-ON & FEEDBACK TYPES
// ============================================

export interface AddOn {
  id: string;
  desc: string;
  cost: number;
}

export interface Remark {
  text: string;
  author: string;
  date: string;
  stage: StageId;
}

// ============================================
// LEAD TYPE
// ============================================

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  eventType: EventType;
  eventDate: string;
  guestCount: number;
  budget: string;
  branch: string;
  source: LeadSource;
  stage: StageId;
  assignedTo: string;
  nextFollowUp: string | null;
  createdAt: string;
  selectedHall: SelectedHall | null;
  menu: MenuItem[];
  menuTotal: number;
  foodPreferences: string;
  allergies: string;
  advancePercent: number;
  advancePaid: number;
  totalCost: number;
  decorType: DecorType;
  decorContractors: string[];
  addOns: AddOn[];
  feedbackPositives: string;
  feedbackNegatives: string;
  remarks: Remark[];
}

// ============================================
// FORM / INPUT TYPES
// ============================================

export interface NewLeadForm {
  name: string;
  phone: string;
  email: string;
  eventType: EventType;
  eventDate: string;
  guestCount: string;
  budget: string;
  branch: string;
  source: LeadSource;
  assignedTo: string;
}

export interface CSVRow {
  [key: string]: string;
}

export interface CSVPreview {
  headers: string[];
  rows: CSVRow[];
  total: number;
  allRows: CSVRow[];
}

// ============================================
// FILTER TYPES
// ============================================

export interface LeadFilters {
  search: string;
  branch: string;
  eventType: string;
  source: string;
}

// ============================================
// UI / COMPONENT PROP TYPES
// ============================================

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success"
  | "ghost";

export interface DropdownOption {
  label: string;
  value: string;
}
