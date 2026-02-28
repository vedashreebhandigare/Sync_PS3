import type { LeadFilters } from "../../types";
import { DropdownFilter, SearchIcon, XIcon } from "../ui";
import { BRANCHES, EVENT_TYPES, LEAD_SOURCES } from "../../constants";

interface FilterBarProps {
  filters: LeadFilters;
  onChangeFilters: (filters: LeadFilters) => void;
}

export default function FilterBar({
  filters,
  onChangeFilters,
}: FilterBarProps): JSX.Element {
  const activeCount = [filters.branch, filters.eventType, filters.source].filter(
    Boolean
  ).length;

  const set = (key: keyof LeadFilters, val: string): void => {
    onChangeFilters({ ...filters, [key]: val });
  };

  const clearAll = (): void => {
    onChangeFilters({ search: "", branch: "", eventType: "", source: "" });
  };

  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid var(--border-default)",
        padding: "8px 20px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        flexWrap: "wrap",
      }}
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--bg-app)",
          borderRadius: "var(--radius-md)",
          padding: "6px 12px",
          flex: "0 1 260px",
          minWidth: 160,
        }}
      >
        <SearchIcon />
        <input
          type="text"
          placeholder="Search name, phone, email..."
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            fontSize: 12.5,
            fontFamily: "var(--font-primary)",
            color: "var(--text-primary)",
            width: "100%",
          }}
        />
        {filters.search && (
          <button
            onClick={() => set("search", "")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              display: "flex",
              padding: 0,
            }}
          >
            <XIcon size={14} />
          </button>
        )}
      </div>

      {/* Dropdowns */}
      <DropdownFilter
        label="Branch"
        options={BRANCHES}
        value={filters.branch}
        onChange={(v) => set("branch", v)}
        allLabel="All Branches"
      />
      <DropdownFilter
        label="Event Type"
        options={EVENT_TYPES}
        value={filters.eventType}
        onChange={(v) => set("eventType", v)}
        allLabel="All Events"
      />
      <DropdownFilter
        label="Source"
        options={LEAD_SOURCES}
        value={filters.source}
        onChange={(v) => set("source", v)}
        allLabel="All Sources"
      />

      {/* Clear all */}
      {activeCount > 0 && (
        <button
          onClick={clearAll}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-primary)",
          }}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
