import { useState, useEffect } from "react";
import type { Branch, Contractor, CatalogItem } from "../types";
import * as api from "../api/client";

interface UseReferenceDataReturn {
  branches: Branch[];
  contractors: Contractor[];
  catalog: CatalogItem[];
  loading: boolean;
}

export default function useReferenceData(): UseReferenceDataReturn {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      try {
        const [b, c, m] = await Promise.all([
          api.fetchBranches(),
          api.fetchContractors(),
          api.fetchMenuCatalog(),
        ]);
        if (!cancelled) {
          setBranches(b);
          setContractors(c);
          setCatalog(m);
        }
      } catch (err) {
        console.error("Failed to load reference data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { branches, contractors, catalog, loading };
}
