import { useState, useCallback } from "react";
import { ChevronDownIcon } from "./Icons";

interface DropdownFilterProps {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  allLabel?: string;
}

export default function DropdownFilter({
  label,
  options,
  value,
  onChange,
  allLabel = "All",
}: DropdownFilterProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "6px 12px",
          background: value ? "var(--accent-bg)" : "#fff",
          border: value
            ? "1.5px solid var(--accent)"
            : "1.5px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          fontSize: 12.5,
          fontFamily: "var(--font-primary)",
          color: value ? "var(--accent)" : "var(--text-secondary)",
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {value || label} <ChevronDownIcon />
      </button>

      {open && (
        <>
          {/* Click-away overlay */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 90 }}
            onClick={() => setOpen(false)}
          />

          {/* Dropdown */}
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              background: "#fff",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 100,
              minWidth: 170,
              padding: 4,
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {[allLabel, ...options].map((opt) => {
              const isAll = opt === allLabel;
              const active = isAll ? !value : value === opt;
              return (
                <div
                  key={opt}
                  onClick={() => handleSelect(isAll ? "" : opt)}
                  style={{
                    padding: "7px 12px",
                    cursor: "pointer",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12.5,
                    fontFamily: "var(--font-primary)",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                    background: active ? "var(--accent-bg)" : "transparent",
                    fontWeight: active ? 600 : 400,
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.target as HTMLDivElement).style.background =
                        "var(--bg-app)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.target as HTMLDivElement).style.background =
                        "transparent";
                    }
                  }}
                >
                  {opt}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
