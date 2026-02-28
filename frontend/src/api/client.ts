import { getAuthToken } from "../hooks/useAuth";
import type {
  LeadBrief,
  LeadFull,
  LeadCreateInput,
  LeadUpdateInput,
  LeadFilters,
  StageId,
  Branch,
  Hall,
  Contractor,
  CatalogItem,
  CatalogItemInput,
  MenuItem,
  AddOn,
  Remark,
  MenuItemInput,
  AddOnInput,
  SummaryStats,
  PipelineStat,
  InventoryItem,
  InventoryItemInput,
  Partner,
  PartnerCreateInput,
  PartnerUpdateInput,
  PartnerSummary,
} from "../types";

const BASE = "";

// ============================================
// GENERIC FETCH HELPER (with auth)
// ============================================

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token expired — clear storage and redirect to login
    localStorage.removeItem("banquet_access_token");
    localStorage.removeItem("banquet_user");
    window.location.reload();
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `API ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ============================================
// LEADS
// ============================================

export async function fetchLeads(filters: LeadFilters): Promise<LeadBrief[]> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.branch) params.set("branch", filters.branch);
  if (filters.event_type) params.set("event_type", filters.event_type);
  if (filters.source) params.set("source", filters.source);
  const qs = params.toString();
  return request<LeadBrief[]>(`/api/leads${qs ? `?${qs}` : ""}`);
}

export async function fetchLead(id: string): Promise<LeadFull> {
  return request<LeadFull>(`/api/leads/${id}`);
}

export async function createLead(data: LeadCreateInput): Promise<LeadFull> {
  return request<LeadFull>("/api/leads", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLead(
  id: string,
  data: LeadUpdateInput
): Promise<LeadFull> {
  return request<LeadFull>(`/api/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changeStage(
  id: string,
  stage: StageId
): Promise<LeadFull> {
  return request<LeadFull>(`/api/leads/${id}/stage`, {
    method: "PATCH",
    body: JSON.stringify({ stage }),
  });
}

export async function deleteLead(id: string): Promise<void> {
  return request<void>(`/api/leads/${id}`, { method: "DELETE" });
}

// ============================================
// LEAD SUB-RESOURCES
// ============================================

export async function addRemark(
  leadId: string,
  text: string,
  author: string
): Promise<Remark> {
  return request<Remark>(`/api/leads/${leadId}/remarks`, {
    method: "POST",
    body: JSON.stringify({ text, author }),
  });
}

export async function replaceMenu(
  leadId: string,
  items: MenuItemInput[]
): Promise<MenuItem[]> {
  return request<MenuItem[]>(`/api/leads/${leadId}/menu`, {
    method: "PUT",
    body: JSON.stringify(items),
  });
}

export async function setHall(
  leadId: string,
  hallId: string
): Promise<LeadFull> {
  return request<LeadFull>(`/api/leads/${leadId}/hall`, {
    method: "PUT",
    body: JSON.stringify({ hall_id: hallId }),
  });
}

export async function replaceAddOns(
  leadId: string,
  addOns: AddOnInput[]
): Promise<AddOn[]> {
  return request<AddOn[]>(`/api/leads/${leadId}/addons`, {
    method: "PUT",
    body: JSON.stringify(addOns),
  });
}

export async function importCSV(file: File): Promise<{ imported: number }> {
  const token = getAuthToken();
  const form = new FormData();
  form.append("file", file);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}/api/leads/import-csv`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Import failed: ${res.status}`);
  }
  return res.json();
}

// ============================================
// INVENTORY
// ============================================

export async function fetchInventory(): Promise<InventoryItem[]> {
  return request<InventoryItem[]>("/api/inventory");
}

export async function fetchToBuy(): Promise<InventoryItem[]> {
  return request<InventoryItem[]>("/api/inventory/to-buy");
}

export async function createInventoryItem(data: InventoryItemInput): Promise<InventoryItem> {
  return request<InventoryItem>("/api/inventory", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateInventoryItem(id: string, data: InventoryItemInput): Promise<InventoryItem> {
  return request<InventoryItem>(`/api/inventory/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteInventoryItem(id: string): Promise<void> {
  return request<void>(`/api/inventory/${id}`, { method: "DELETE" });
}

// ============================================
// REFERENCE DATA
// ============================================

export async function fetchBranches(): Promise<Branch[]> {
  return request<Branch[]>("/api/branches");
}

export async function fetchHalls(branchId: string): Promise<Hall[]> {
  return request<Hall[]>(`/api/branches/${branchId}/halls`);
}

export async function fetchContractors(): Promise<Contractor[]> {
  return request<Contractor[]>("/api/contractors");
}

export async function fetchMenuCatalog(): Promise<CatalogItem[]> {
  return request<CatalogItem[]>("/api/menu-catalog");
}

export async function createMenuCatalogItem(data: CatalogItemInput): Promise<CatalogItem> {
  return request<CatalogItem>("/api/menu-catalog", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMenuCatalogItem(id: string, data: CatalogItemInput): Promise<CatalogItem> {
  return request<CatalogItem>(`/api/menu-catalog/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMenuCatalogItem(id: string): Promise<void> {
  return request<void>(`/api/menu-catalog/${id}`, { method: "DELETE" });
}

// ============================================
// STATS
// ============================================

export async function fetchSummary(branch?: string): Promise<SummaryStats> {
  const qs = branch ? `?branch=${branch}` : "";
  return request<SummaryStats>(`/api/stats/summary${qs}`);
}

export async function fetchPipeline(branch?: string): Promise<PipelineStat[]> {
  const qs = branch ? `?branch=${branch}` : "";
  return request<PipelineStat[]>(`/api/stats/pipeline${qs}`);
}

// ============================================
// CALENDAR
// ============================================

export interface CalendarEvent {
  id: string;
  title: string;
  hall_id: string | null;
  hall_name: string | null;
  branch_id: string;
  date: string;
  event_type: string;
  guest_count: number;
  stage: string;
  status: string;
  advance_paid: number;
  total_cost: number;
  customer_name: string;
  type: string;
}

export async function fetchCalendarEvents(
  startDate: string,
  endDate: string,
  branchId?: string,
  hallId?: string,
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams();
  params.set("start_date", startDate);
  params.set("end_date", endDate);
  if (branchId) params.set("branch_id", branchId);
  if (hallId) params.set("hall_id", hallId);
  return request<CalendarEvent[]>(`/api/calendar/events?${params.toString()}`);
}

export interface CalendarSummary {
  today_events: number;
  upcoming_7_days: number;
  tentative_holds: number;
  pending_followups: number;
}

export async function fetchCalendarSummary(): Promise<CalendarSummary> {
  return request<CalendarSummary>("/api/calendar/summary");
}

// ============================================
// PARTNERS
// ============================================

export async function fetchPartners(params?: {
  status?: string;
  branch_id?: string;
  search?: string;
}): Promise<Partner[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.branch_id) qs.set("branch_id", params.branch_id);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString();
  return request<Partner[]>(`/api/partners${query ? `?${query}` : ""}`);
}

export async function fetchPartnerSummary(): Promise<PartnerSummary> {
  return request<PartnerSummary>("/api/partners/summary");
}

export async function fetchPartner(id: string): Promise<Partner> {
  return request<Partner>(`/api/partners/${id}`);
}

export async function createPartner(data: PartnerCreateInput): Promise<Partner> {
  return request<Partner>("/api/partners", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePartner(
  id: string,
  data: PartnerUpdateInput
): Promise<Partner> {
  return request<Partner>(`/api/partners/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deletePartner(id: string): Promise<void> {
  return request<void>(`/api/partners/${id}`, { method: "DELETE" });
}

export async function createReferralLead(
  partnerId: string,
  data: Record<string, unknown>
): Promise<{ id: string; stage: string; partner: string }> {
  return request<{ id: string; stage: string; partner: string }>(`/api/partners/${partnerId}/refer`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
