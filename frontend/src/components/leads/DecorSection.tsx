import type { DecorType, Contractor } from "../../types";
import { SectionLabel } from "../ui";
import { csvToArray, arrayToCsv } from "../../utils";

interface DecorSectionProps {
  decorType: DecorType;
  decorContractors: string;
  contractors: Contractor[];
  onChangeType: (val: DecorType) => void;
  onChangeContractors: (val: string) => void;
}

export default function DecorSection({ decorType, decorContractors, contractors, onChangeType, onChangeContractors }: DecorSectionProps) {
  const selected = csvToArray(decorContractors);

  const toggleContractor = (id: string): void => {
    const next = selected.includes(id) ? selected.filter((c) => c !== id) : [...selected, id];
    onChangeContractors(arrayToCsv(next));
  };

  return (
    <div>
      <SectionLabel>Decoration & Event Finalization</SectionLabel>

      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4, fontFamily: "var(--font-primary)" }}>Decoration Type</label>
        <div style={{ display: "flex", gap: 8 }}>
          {(["internal", "external"] as const).map((type) => (
            <button key={type} onClick={() => onChangeType(type)}
              style={{ flex: 1, padding: 10, borderRadius: "var(--radius-md)", border: decorType === type ? "2px solid var(--accent)" : "1.5px solid var(--border-default)", background: decorType === type ? "var(--accent-bg)" : "var(--bg-card)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-primary)", cursor: "pointer", color: decorType === type ? "var(--accent)" : "var(--text-secondary)", textTransform: "capitalize", transition: "all var(--transition-fast)" }}>
              {type === "internal" ? "🏠 Internal" : "🔗 External"}
            </button>
          ))}
        </div>
      </div>

      {decorType === "internal" && (
        <div>
          <label style={{ fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 4, fontFamily: "var(--font-primary)" }}>Select Contractors</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {contractors.map((c) => {
              const isSelected = selected.includes(c.id);
              return (
                <div key={c.id} onClick={() => toggleContractor(c.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: "var(--radius-md)", border: `1.5px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`, background: isSelected ? "var(--accent-bg)" : "var(--bg-card)", cursor: "pointer", transition: "all var(--transition-fast)" }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-primary)" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-primary)" }}>{c.specialty} · {c.phone}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${isSelected ? "var(--accent)" : "var(--border-default)"}`, background: isSelected ? "var(--accent)" : "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, transition: "all var(--transition-fast)" }}>
                    {isSelected && "✓"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {decorType === "external" && (
        <div style={{ padding: 12, background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--font-primary)" }}>🔗 External Decoration</div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-primary)" }}>Client managing decoration independently</div>
        </div>
      )}
    </div>
  );
}
