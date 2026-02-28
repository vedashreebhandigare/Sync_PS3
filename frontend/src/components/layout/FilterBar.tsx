import type { LeadFilters, Branch } from "../../types";
import { DropdownFilter, SearchIcon } from "../ui";
import { EVENT_TYPES, LEAD_SOURCES } from "../../constants";

interface FilterBarProps {
  filters: LeadFilters;
  onChange: (f: LeadFilters) => void;
  branches: Branch[];
  hasActiveFilters: boolean;
}

export default function FilterBar({
  filters,
  onChange,
  branches,
  hasActiveFilters,
}: FilterBarProps): JSX.Element {
  const set = (key: keyof LeadFilters, value: string): void => {
    onChange({ ...filters, [key]: value });
  };

  const clear = (): void => {
    onChange({ search: "", branch: "", event_type: "", source: "" });
  };

  const branchOptions = branches.map((b) => ({ label: b.name, value: b.id }));
  const eventOptions = EVENT_TYPES.map((t) => ({ label: t, value: t }));
  const sourceOptions = LEAD_SOURCES.map((s) => ({ label: s, value: s }));

  return (
    <div
      style={{
        padding: "8px 20px",
        borderBottom: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "var(--bg-card)",
        flexShrink: 0,
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
          padding: "6px 10px",
          border: "1.5px solid var(--border-default)",
          flex: 1,
          maxWidth: 260,
        }}
      >
        <SearchIcon />
        <input
          placeholder="Search name, phone, email..."
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            flex: 1,
            fontSize: 12.5,
            fontFamily: "var(--font-primary)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* Dropdowns */}
      <DropdownFilter
        label="Branch"
        options={branchOptions}
        value={filters.branch}
        onChange={(v) => set("branch", v)}
      />
      <DropdownFilter
        label="Event Type"
        options={eventOptions}
        value={filters.event_type}
        onChange={(v) => set("event_type", v)}
      />
      <DropdownFilter
        label="Source"
        options={sourceOptions}
        value={filters.source}
        onChange={(v) => set("source", v)}
      />

      {/* Active filter count + clear */}
      {hasActiveFilters && (
        <button
          onClick={clear}
          style={{
            background: "var(--danger-bg)",
            color: "var(--danger)",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "5px 10px",
            fontSize: 11.5,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-primary)",
            whiteSpace: "nowrap",
          }}
        >
          ✕ Clear filters
        </button>
      )}
    </div>
  );
}
