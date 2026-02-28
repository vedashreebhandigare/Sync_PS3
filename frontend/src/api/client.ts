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
  MenuItem,
  AddOn,
  Remark,
  MenuItemInput,
  AddOnInput,
  SummaryStats,
  PipelineStat,
} from "../types";

const BASE = "http://localhost:8000";

// ============================================
// GENERIC FETCH HELPER
// ============================================

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
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
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/api/leads/import-csv`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Import failed: ${res.status}`);
  }
  return res.json();
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
