import { useState, useEffect, useCallback } from "react";
import type {
  LeadBrief,
  LeadFull,
  LeadFilters,
  LeadCreateInput,
  LeadUpdateInput,
  StageId,
  SummaryStats,
  MenuItemInput,
  AddOnInput,
} from "../types";
import * as api from "../api/client";

const EMPTY_FILTERS: LeadFilters = {
  search: "",
  branch: "",
  event_type: "",
  source: "",
};

const EMPTY_SUMMARY: SummaryStats = { new: 0, active: 0, converted: 0, lost: 0 };

interface UseLeadsReturn {
  /* list */
  leads: LeadBrief[];
  filters: LeadFilters;
  setFilters: (f: LeadFilters) => void;
  summary: SummaryStats;
  hasActiveFilters: boolean;
  listLoading: boolean;
  refreshList: () => Promise<void>;

  /* detail */
  selectedLead: LeadFull | null;
  detailLoading: boolean;
  selectLead: (id: string) => Promise<void>;
  closeDetail: () => void;

  /* mutations (all refresh data after success) */
  createLead: (data: LeadCreateInput) => Promise<void>;
  updateFields: (id: string, data: LeadUpdateInput) => Promise<void>;
  moveStage: (id: string, stage: StageId) => Promise<void>;
  setHall: (id: string, hallId: string) => Promise<void>;
  updateMenu: (id: string, items: MenuItemInput[]) => Promise<void>;
  addRemark: (id: string, text: string, author: string) => Promise<void>;
  updateAddOns: (id: string, addOns: AddOnInput[]) => Promise<void>;
  importCSV: (file: File) => Promise<number>;
}

export default function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<LeadBrief[]>([]);
  const [filters, setFilters] = useState<LeadFilters>(EMPTY_FILTERS);
  const [summary, setSummary] = useState<SummaryStats>(EMPTY_SUMMARY);
  const [listLoading, setListLoading] = useState<boolean>(true);

  const [selectedLead, setSelectedLead] = useState<LeadFull | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const hasActiveFilters =
    Boolean(filters.branch) ||
    Boolean(filters.event_type) ||
    Boolean(filters.source) ||
    Boolean(filters.search);

  /* ── Fetch lead list + summary ── */
  const refreshList = useCallback(async (): Promise<void> => {
    setListLoading(true);
    try {
      const [list, stats] = await Promise.all([
        api.fetchLeads(filters),
        api.fetchSummary(filters.branch || undefined),
      ]);
      setLeads(list);
      setSummary(stats);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setListLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  /* ── Fetch single lead detail ── */
  const refreshDetail = useCallback(async (id: string): Promise<void> => {
    try {
      const full = await api.fetchLead(id);
      setSelectedLead(full);
    } catch (err) {
      console.error("Failed to fetch lead detail:", err);
    }
  }, []);

  const selectLead = useCallback(async (id: string): Promise<void> => {
    setDetailLoading(true);
    await refreshDetail(id);
    setDetailLoading(false);
  }, [refreshDetail]);

  const closeDetail = useCallback((): void => {
    setSelectedLead(null);
  }, []);

  /* ── Mutations ── */

  const createLead = useCallback(async (data: LeadCreateInput): Promise<void> => {
    await api.createLead(data);
    await refreshList();
  }, [refreshList]);

  const updateFields = useCallback(async (
    id: string,
    data: LeadUpdateInput
  ): Promise<void> => {
    const updated = await api.updateLead(id, data);
    setSelectedLead(updated);
    await refreshList();
  }, [refreshList]);

  const moveStage = useCallback(async (
    id: string,
    stage: StageId
  ): Promise<void> => {
    const updated = await api.changeStage(id, stage);
    setSelectedLead(updated);
    await refreshList();
  }, [refreshList]);

  const setHall = useCallback(async (
    id: string,
    hallId: string
  ): Promise<void> => {
    const updated = await api.setHall(id, hallId);
    setSelectedLead(updated);       // may have auto-advanced stage
    await refreshList();
  }, [refreshList]);

  const updateMenu = useCallback(async (
    id: string,
    items: MenuItemInput[]
  ): Promise<void> => {
    await api.replaceMenu(id, items);
    await refreshDetail(id);        // refetch full lead (auto-advance + recalc)
    await refreshList();
  }, [refreshDetail, refreshList]);

  const addRemark = useCallback(async (
    id: string,
    text: string,
    author: string
  ): Promise<void> => {
    await api.addRemark(id, text, author);
    await refreshDetail(id);
  }, [refreshDetail]);

  const updateAddOns = useCallback(async (
    id: string,
    addOns: AddOnInput[]
  ): Promise<void> => {
    await api.replaceAddOns(id, addOns);
    await refreshDetail(id);
  }, [refreshDetail]);

  const importCSVFn = useCallback(async (file: File): Promise<number> => {
    const result = await api.importCSV(file);
    await refreshList();
    return result.imported;
  }, [refreshList]);

  return {
    leads,
    filters,
    setFilters,
    summary,
    hasActiveFilters,
    listLoading,
    refreshList,
    selectedLead,
    detailLoading,
    selectLead,
    closeDetail,
    createLead,
    updateFields,
    moveStage,
    setHall,
    updateMenu,
    addRemark,
    updateAddOns,
    importCSV: importCSVFn,
  };
}
