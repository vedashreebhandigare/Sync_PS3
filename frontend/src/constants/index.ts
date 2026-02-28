import type {
  Stage,
  StageId,
  EventType,
  LeadSource,
  BranchesData,
  MenuCatalogEntry,
  Contractor,
  Lead,
} from "../types";

// ============================================
// PIPELINE STAGES
// ============================================

export const STAGES: Stage[] = [
  { id: "new", label: "New Lead", icon: "✦", color: "#6366f1", bg: "#eef2ff" },
  { id: "call", label: "Call Done", icon: "✆", color: "#8b5cf6", bg: "#f5f3ff" },
  { id: "visit", label: "Property Visit", icon: "⌂", color: "#d97706", bg: "#fffbeb" },
  { id: "tasting", label: "Food Tasting", icon: "◎", color: "#ea580c", bg: "#fff7ed" },
  { id: "menu", label: "Menu Finalized", icon: "☰", color: "#0891b2", bg: "#ecfeff" },
  { id: "advance", label: "Advance Payment", icon: "₹", color: "#059669", bg: "#ecfdf5" },
  { id: "decor", label: "Decor & Event", icon: "❋", color: "#7c3aed", bg: "#f5f3ff" },
  { id: "fullpay", label: "Full Payment", icon: "$", color: "#16a34a", bg: "#f0fdf4" },
  { id: "post", label: "Post-Event", icon: "✓", color: "#64748b", bg: "#f8fafc" },
  { id: "feedback", label: "Feedback", icon: "★", color: "#0ea5e9", bg: "#f0f9ff" },
  { id: "converted", label: "Converted", icon: "✔", color: "#15803d", bg: "#f0fdf4" },
  { id: "lost", label: "Lost", icon: "✘", color: "#dc2626", bg: "#fef2f2" },
];

export const TERMINAL_STAGES: StageId[] = ["converted", "lost"];

// ============================================
// BRANCHES & HALLS
// ============================================

export const BRANCHES_DATA: BranchesData = {
  "Andheri Branch": [
    { id: "ah1", name: "Grand Ballroom", location: "3rd Floor, Main Building", capacity: 500, eventTypes: ["Wedding", "Reception", "Corporate"], costPerPlate: 1200 },
    { id: "ah2", name: "Garden Lawn", location: "Ground Floor, East Wing", capacity: 300, eventTypes: ["Wedding", "Reception", "Birthday"], costPerPlate: 900 },
    { id: "ah3", name: "Terrace Hall", location: "Rooftop", capacity: 150, eventTypes: ["Birthday", "Anniversary", "Engagement"], costPerPlate: 800 },
  ],
  "Bandra Branch": [
    { id: "bd1", name: "Sea View Banquet", location: "5th Floor, Tower A", capacity: 400, eventTypes: ["Wedding", "Reception", "Corporate"], costPerPlate: 1500 },
    { id: "bd2", name: "Crystal Room", location: "2nd Floor, Tower B", capacity: 200, eventTypes: ["Corporate", "Conference", "Birthday"], costPerPlate: 1100 },
  ],
  "Thane Branch": [
    { id: "th1", name: "Royal Palace Hall", location: "Ground Floor", capacity: 800, eventTypes: ["Wedding", "Reception"], costPerPlate: 1000 },
    { id: "th2", name: "Silver Oak Room", location: "1st Floor", capacity: 250, eventTypes: ["Corporate", "Conference", "Engagement"], costPerPlate: 850 },
    { id: "th3", name: "Courtyard", location: "Open Area, Back", capacity: 400, eventTypes: ["Wedding", "Reception", "Social Gathering"], costPerPlate: 750 },
  ],
  "Pune Branch": [
    { id: "pu1", name: "Heritage Hall", location: "Main Building", capacity: 600, eventTypes: ["Wedding", "Reception", "Corporate"], costPerPlate: 950 },
    { id: "pu2", name: "Lotus Banquet", location: "Annex Building", capacity: 350, eventTypes: ["Wedding", "Birthday", "Anniversary"], costPerPlate: 850 },
  ],
};

export const BRANCHES: string[] = Object.keys(BRANCHES_DATA);

// ============================================
// ENUMS / OPTIONS
// ============================================

export const EVENT_TYPES: EventType[] = [
  "Wedding",
  "Reception",
  "Corporate Event",
  "Birthday Party",
  "Anniversary",
  "Engagement",
  "Conference",
  "Social Gathering",
];

export const LEAD_SOURCES: LeadSource[] = [
  "Walk-in",
  "Website",
  "Referral",
  "Social Media",
  "Google Ads",
  "WhatsApp",
];

// ============================================
// MENU CATALOG
// ============================================

export const MENU_CATALOG: MenuCatalogEntry[] = [
  { category: "Starters", items: ["Paneer Tikka", "Chicken Seekh Kebab", "Veg Spring Rolls", "Tandoori Prawns", "Hara Bhara Kebab"] },
  { category: "Main Course", items: ["Dal Makhani", "Butter Chicken", "Palak Paneer", "Biryani", "Rogan Josh", "Kadai Paneer"] },
  { category: "Breads", items: ["Naan", "Roti", "Garlic Naan", "Paratha", "Kulcha"] },
  { category: "Desserts", items: ["Gulab Jamun", "Rasmalai", "Ice Cream", "Pastries", "Jalebi", "Kheer"] },
  { category: "Beverages", items: ["Soft Drinks", "Fresh Juice", "Masala Chai", "Coffee", "Mocktails", "Lassi"] },
];

// ============================================
// CONTRACTORS
// ============================================

export const CONTRACTORS: Contractor[] = [
  { id: "c1", name: "Sharma Decorators", specialty: "Floral & Stage", phone: "98201 11111" },
  { id: "c2", name: "LightUp Events", specialty: "LED & Lighting", phone: "98201 22222" },
  { id: "c3", name: "DreamTheme Co.", specialty: "Theme Decor", phone: "98201 33333" },
  { id: "c4", name: "Royal Setups", specialty: "Mandap & Stage", phone: "98201 44444" },
  { id: "c5", name: "Balloon Galaxy", specialty: "Balloon & Props", phone: "98201 55555" },
];

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

// ============================================
// DEFAULT ADVANCE PERCENTAGE
// ============================================

export const DEFAULT_ADVANCE_PERCENT = 20;

// ============================================
// SEED DATA
// ============================================

export const SEED_LEADS: Lead[] = [
  { id: "l1", name: "Priya Sharma", phone: "98201 45678", email: "priya.sharma@gmail.com", eventType: "Wedding", eventDate: "2026-04-15", guestCount: 350, budget: "₹8L - ₹12L", branch: "Andheri Branch", source: "Referral", stage: "new", assignedTo: "Rahul M.", nextFollowUp: "2026-03-02", createdAt: "2026-02-25", selectedHall: null, menu: [], menuTotal: 0, foodPreferences: "", allergies: "", advancePercent: 20, advancePaid: 0, totalCost: 0, decorType: "", decorContractors: [], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "Looking for premium wedding package with outdoor lawn setup.", author: "Rahul M.", date: "2026-02-25", stage: "new" }] },
  { id: "l2", name: "Vikram Patel", phone: "99876 54321", email: "vikram.p@outlook.com", eventType: "Corporate Event", eventDate: "2026-03-20", guestCount: 120, budget: "₹3L - ₹5L", branch: "Bandra Branch", source: "Website", stage: "call", assignedTo: "Sneha K.", nextFollowUp: "2026-03-01", createdAt: "2026-02-20", selectedHall: null, menu: [], menuTotal: 0, foodPreferences: "Vegetarian + Non-Veg", allergies: "", advancePercent: 20, advancePaid: 0, totalCost: 0, decorType: "", decorContractors: [], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "Annual company dinner. Needs projector and AV setup.", author: "Sneha K.", date: "2026-02-20", stage: "call" }] },
  { id: "l3", name: "Anita Deshmukh", phone: "87654 32109", email: "anita.d@yahoo.com", eventType: "Reception", eventDate: "2026-05-10", guestCount: 500, budget: "₹12L - ₹18L", branch: "Thane Branch", source: "Walk-in", stage: "visit", assignedTo: "Rahul M.", nextFollowUp: "2026-03-03", createdAt: "2026-02-18", selectedHall: null, menu: [], menuTotal: 0, foodPreferences: "", allergies: "", advancePercent: 20, advancePaid: 0, totalCost: 0, decorType: "", decorContractors: [], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "Visited the hall. Loved the main banquet area.", author: "Rahul M.", date: "2026-02-18", stage: "visit" }, { text: "Wants to bring family for second visit.", author: "Rahul M.", date: "2026-02-19", stage: "visit" }] },
  { id: "l4", name: "Rajesh Kumar", phone: "91234 56789", email: "rajesh.k@gmail.com", eventType: "Wedding", eventDate: "2026-06-22", guestCount: 800, budget: "₹18L - ₹25L", branch: "Pune Branch", source: "Social Media", stage: "tasting", assignedTo: "Amit S.", nextFollowUp: "2026-03-05", createdAt: "2026-02-15", selectedHall: { id: "pu1", name: "Heritage Hall" }, menu: [], menuTotal: 0, foodPreferences: "North Indian + Chinese", allergies: "No shellfish", advancePercent: 20, advancePaid: 0, totalCost: 0, decorType: "", decorContractors: [], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "Tasting scheduled. Very particular about dessert counter.", author: "Amit S.", date: "2026-02-15", stage: "tasting" }] },
  { id: "l5", name: "Meera Joshi", phone: "90876 12345", email: "meera.j@gmail.com", eventType: "Birthday Party", eventDate: "2026-03-28", guestCount: 80, budget: "₹1.5L - ₹2.5L", branch: "Andheri Branch", source: "Google Ads", stage: "menu", assignedTo: "Sneha K.", nextFollowUp: "2026-03-04", createdAt: "2026-02-10", selectedHall: { id: "ah3", name: "Terrace Hall" }, menu: [{ id: "m1", name: "Paneer Tikka", category: "Starters", costPerPlate: 120 }, { id: "m2", name: "Dal Makhani", category: "Main Course", costPerPlate: 150 }, { id: "m3", name: "Gulab Jamun", category: "Desserts", costPerPlate: 80 }], menuTotal: 350, foodPreferences: "Jain options needed", allergies: "Nut allergy (2 guests)", advancePercent: 20, advancePaid: 0, totalCost: 28000, decorType: "", decorContractors: [], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "50th birthday celebration. Wants live music.", author: "Sneha K.", date: "2026-02-10", stage: "new" }, { text: "Menu finalized with Jain options.", author: "Sneha K.", date: "2026-02-22", stage: "menu" }] },
  { id: "l6", name: "Suresh Reddy", phone: "88765 43210", email: "suresh.r@company.com", eventType: "Conference", eventDate: "2026-04-05", guestCount: 200, budget: "₹5L - ₹8L", branch: "Bandra Branch", source: "Referral", stage: "advance", assignedTo: "Rahul M.", nextFollowUp: "2026-03-01", createdAt: "2026-02-05", selectedHall: { id: "bd2", name: "Crystal Room" }, menu: [{ id: "m4", name: "Veg Spring Rolls", category: "Starters", costPerPlate: 100 }, { id: "m5", name: "Biryani", category: "Main Course", costPerPlate: 200 }], menuTotal: 300, foodPreferences: "Continental Day 1, Indian Day 2", allergies: "", advancePercent: 20, advancePaid: 12000, totalCost: 60000, decorType: "internal", decorContractors: [], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "2-day tech conference. Tea breaks x4.", author: "Rahul M.", date: "2026-02-05", stage: "new" }, { text: "Advance of ₹12,000 received.", author: "Rahul M.", date: "2026-02-25", stage: "advance" }] },
  { id: "l7", name: "Kavita Nair", phone: "97654 32100", email: "kavita.n@gmail.com", eventType: "Engagement", eventDate: "2026-04-18", guestCount: 150, budget: "₹4L - ₹6L", branch: "Thane Branch", source: "WhatsApp", stage: "decor", assignedTo: "Amit S.", nextFollowUp: "2026-03-06", createdAt: "2026-01-28", selectedHall: { id: "th2", name: "Silver Oak Room" }, menu: [{ id: "m6", name: "Paneer Tikka", category: "Starters", costPerPlate: 120 }, { id: "m7", name: "Butter Chicken", category: "Main Course", costPerPlate: 180 }, { id: "m8", name: "Rasmalai", category: "Desserts", costPerPlate: 90 }], menuTotal: 390, foodPreferences: "Mix veg/non-veg", allergies: "", advancePercent: 20, advancePaid: 11700, totalCost: 58500, decorType: "internal", decorContractors: ["c1", "c2"], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "Rose gold theme confirmed.", author: "Amit S.", date: "2026-02-20", stage: "decor" }] },
  { id: "l8", name: "Amit Agarwal", phone: "93456 78901", email: "amit.a@business.com", eventType: "Social Gathering", eventDate: "2026-03-12", guestCount: 60, budget: "₹1L - ₹1.5L", branch: "Pune Branch", source: "Walk-in", stage: "fullpay", assignedTo: "Sneha K.", nextFollowUp: "2026-03-10", createdAt: "2026-01-20", selectedHall: { id: "pu2", name: "Lotus Banquet" }, menu: [{ id: "m9", name: "Hara Bhara Kebab", category: "Starters", costPerPlate: 100 }], menuTotal: 100, foodPreferences: "Pure Veg", allergies: "", advancePercent: 20, advancePaid: 1200, totalCost: 6000, decorType: "external", decorContractors: [], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "Full payment received. Housewarming party.", author: "Sneha K.", date: "2026-02-28", stage: "fullpay" }] },
  { id: "l9", name: "Deepika Iyer", phone: "96543 21098", email: "deepika.i@gmail.com", eventType: "Anniversary", eventDate: "2026-03-08", guestCount: 100, budget: "₹3L - ₹4L", branch: "Andheri Branch", source: "Referral", stage: "post", assignedTo: "Rahul M.", nextFollowUp: "2026-03-09", createdAt: "2026-01-15", selectedHall: { id: "ah2", name: "Garden Lawn" }, menu: [], menuTotal: 0, foodPreferences: "", allergies: "", advancePercent: 20, advancePaid: 0, totalCost: 300000, decorType: "internal", decorContractors: ["c3"], addOns: [{ id: "a1", desc: "Extra valet parking", cost: 5000 }, { id: "a2", desc: "Extended DJ hours", cost: 8000 }], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "Event completed. Minor parking issue.", author: "Rahul M.", date: "2026-03-08", stage: "post" }, { text: "Remaining ₹25,000 to collect.", author: "Rahul M.", date: "2026-03-09", stage: "post" }] },
  { id: "l10", name: "Nikhil Mehta", phone: "92345 67890", email: "nikhil.m@email.com", eventType: "Wedding", eventDate: "2026-03-05", guestCount: 450, budget: "₹10L - ₹15L", branch: "Bandra Branch", source: "Website", stage: "feedback", assignedTo: "Amit S.", nextFollowUp: "2026-03-07", createdAt: "2026-01-10", selectedHall: { id: "bd1", name: "Sea View Banquet" }, menu: [], menuTotal: 0, foodPreferences: "", allergies: "", advancePercent: 20, advancePaid: 0, totalCost: 0, decorType: "internal", decorContractors: ["c1", "c4"], addOns: [], feedbackPositives: "Excellent food quality. Staff was very cooperative.", feedbackNegatives: "AC was not working properly in one section.", remarks: [{ text: "Client very happy. Requesting Google review.", author: "Amit S.", date: "2026-03-06", stage: "feedback" }] },
  { id: "l11", name: "Snehal Patil", phone: "98765 00112", email: "snehal.p@gmail.com", eventType: "Wedding", eventDate: "2026-05-25", guestCount: 700, budget: "₹20L - ₹30L", branch: "Andheri Branch", source: "Referral", stage: "new", assignedTo: "Amit S.", nextFollowUp: "2026-03-01", createdAt: "2026-02-27", selectedHall: null, menu: [], menuTotal: 0, foodPreferences: "", allergies: "", advancePercent: 20, advancePaid: 0, totalCost: 0, decorType: "", decorContractors: [], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "High-value lead from existing client referral.", author: "Amit S.", date: "2026-02-27", stage: "new" }] },
  { id: "l12", name: "Farhan Sheikh", phone: "90012 33456", email: "farhan.s@gmail.com", eventType: "Reception", eventDate: "2026-06-14", guestCount: 400, budget: "₹10L - ₹14L", branch: "Bandra Branch", source: "Walk-in", stage: "new", assignedTo: "Sneha K.", nextFollowUp: "2026-03-02", createdAt: "2026-02-26", selectedHall: null, menu: [], menuTotal: 0, foodPreferences: "", allergies: "", advancePercent: 20, advancePaid: 0, totalCost: 0, decorType: "", decorContractors: [], addOns: [], feedbackPositives: "", feedbackNegatives: "", remarks: [{ text: "Walked in with family. Comparing with 2 other venues.", author: "Sneha K.", date: "2026-02-26", stage: "new" }] },
];
