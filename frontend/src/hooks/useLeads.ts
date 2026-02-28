import { useState, useMemo, useCallback } from "react";
import type { Lead, LeadFilters, StageId, NewLeadForm, CSVRow } from "../types";
import { STAGES, SEED_LEADS, BRANCHES, DEFAULT_ADVANCE_PERCENT } from "../constants";
import { generateId } from "../utils";

interface UseLeadsReturn {
  leads: Lead[];
  filteredLeads: Lead[];
  filters: LeadFilters;
  setFilters: (f: LeadFilters) => void;
  stageCounts: Record<StageId, number>;
  hasActiveFilters: boolean;
  updateLead: (id: string, updated: Lead) => void;
  moveStage: (id: string, stage: StageId) => void;
  addLead: (form: NewLeadForm) => void;
  importCSV: (rows: CSVRow[]) => void;
}

export default function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>(SEED_LEADS);
  const [filters, setFilters] = useState<LeadFilters>({
    search: "",
    branch: "",
    eventType: "",
    source: "",
  });

  /* ── Derived: filtered leads ── */
  const filteredLeads = useMemo<Lead[]>(() => {
    const q = filters.search.toLowerCase();
    return leads.filter((lead) => {
      if (
        q &&
        !lead.name.toLowerCase().includes(q) &&
        !lead.phone.includes(q) &&
        !lead.email.toLowerCase().includes(q)
      )
        return false;
      if (filters.branch && lead.branch !== filters.branch) return false;
      if (filters.eventType && lead.eventType !== filters.eventType)
        return false;
      if (filters.source && lead.source !== filters.source) return false;
      return true;
    });
  }, [leads, filters]);

  /* ── Derived: counts per stage ── */
  const stageCounts = useMemo<Record<StageId, number>>(() => {
    const counts = {} as Record<StageId, number>;
    STAGES.forEach((s) => {
      counts[s.id] = 0;
    });
    filteredLeads.forEach((l) => {
      counts[l.stage] = (counts[l.stage] || 0) + 1;
    });
    return counts;
  }, [filteredLeads]);

  const hasActiveFilters =
    Boolean(filters.branch) ||
    Boolean(filters.eventType) ||
    Boolean(filters.source) ||
    Boolean(filters.search);

  /* ── Mutations ── */
  const updateLead = useCallback((id: string, updated: Lead): void => {
    setLeads((prev) => prev.map((l) => (l.id === id ? updated : l)));
  }, []);

  const moveStage = useCallback((id: string, stage: StageId): void => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, stage } : l))
    );
  }, []);

  const addLead = useCallback((form: NewLeadForm): void => {
    const newLead: Lead = {
      id: generateId(),
      name: form.name,
      phone: form.phone,
      email: form.email,
      eventType: form.eventType,
      eventDate: form.eventDate,
      guestCount: Number(form.guestCount) || 0,
      budget: form.budget,
      branch: form.branch,
      source: form.source,
      stage: "new",
      assignedTo: form.assignedTo,
      nextFollowUp: null,
      createdAt: "2026-02-28",
      selectedHall: null,
      menu: [],
      menuTotal: 0,
      foodPreferences: "",
      allergies: "",
      advancePercent: DEFAULT_ADVANCE_PERCENT,
      advancePaid: 0,
      totalCost: 0,
      decorType: "",
      decorContractors: [],
      addOns: [],
      feedbackPositives: "",
      feedbackNegatives: "",
      remarks: [
        {
          text: "Lead created manually.",
          author: form.assignedTo || "System",
          date: "2026-02-28",
          stage: "new",
        },
      ],
    };
    setLeads((prev) => [newLead, ...prev]);
  }, []);

  const importCSV = useCallback((rows: CSVRow[]): void => {
    const newLeads: Lead[] = rows.map((r) => ({
      id: generateId(),
      name: r.name || "Unknown",
      phone: r.phone || "",
      email: r.email || "",
      eventType: (r.eventType as Lead["eventType"]) || "Wedding",
      eventDate: r.eventDate || "",
      guestCount: Number(r.guestCount) || 0,
      budget: r.budget || "",
      branch: r.branch || BRANCHES[0],
      source: (r.source as Lead["source"]) || "Website",
      stage: "new",
      assignedTo: r.assignedTo || "",
      nextFollowUp: null,
      createdAt: "2026-02-28",
      selectedHall: null,
      menu: [],
      menuTotal: 0,
      foodPreferences: "",
      allergies: "",
      advancePercent: DEFAULT_ADVANCE_PERCENT,
      advancePaid: 0,
      totalCost: 0,
      decorType: "",
      decorContractors: [],
      addOns: [],
      feedbackPositives: "",
      feedbackNegatives: "",
      remarks: [
        {
          text: "Imported from CSV.",
          author: "System",
          date: "2026-02-28",
          stage: "new",
        },
      ],
    }));
    setLeads((prev) => [...newLeads, ...prev]);
  }, []);

  return {
    leads,
    filteredLeads,
    filters,
    setFilters,
    stageCounts,
    hasActiveFilters,
    updateLead,
    moveStage,
    addLead,
    importCSV,
  };
}
