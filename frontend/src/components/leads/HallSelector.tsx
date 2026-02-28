import type { Hall } from "../../types";
import { Button, SectionLabel } from "../ui";
import { currency, csvToArray } from "../../utils";

interface HallSelectorProps {
  halls: Hall[];
  selectedHallId: string | null;
  onSelect: (hallId: string) => void;
}

export default function HallSelector({
  halls,
  selectedHallId,
  onSelect,
}: HallSelectorProps) {
  return (
    <div>
      <SectionLabel>Available Halls</SectionLabel>

      <div style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--font-primary)" }}>
          <thead>
            <tr style={{ background: "var(--bg-app)" }}>
              {["Property", "Location", "Capacity", "Types", "₹/Plate", ""].map((h) => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {halls.map((hall) => {
              const active = selectedHallId === hall.id;
              const types = csvToArray(hall.event_types);
              return (
                <tr key={hall.id} style={{ borderTop: "1px solid var(--border-light)", background: active ? "var(--accent-bg)" : "var(--bg-card)" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: "var(--text-primary)" }}>{hall.name}</td>
                  <td style={{ padding: "8px 10px", color: "var(--text-secondary)" }}>{hall.location}</td>
                  <td style={{ padding: "8px 10px", color: "var(--text-secondary)" }}>{hall.capacity}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {types.map((t) => (
                        <span key={t} style={{ fontSize: 9.5, background: "var(--bg-section)", padding: "1px 5px", borderRadius: 4, color: "var(--text-muted)" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: "var(--text-primary)" }}>{currency(hall.cost_per_plate)}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <Button variant={active ? "primary" : "secondary"} onClick={() => onSelect(hall.id)} style={{ padding: "4px 12px", fontSize: 11 }}>
                      {active ? "✓ Selected" : "Select"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedHallId && (
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--success)", fontWeight: 600, fontFamily: "var(--font-primary)" }}>
          ✓ Selecting a hall auto-advances this lead to Food Tasting
        </div>
      )}
    </div>
  );
}
