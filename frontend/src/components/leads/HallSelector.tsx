import type { Hall, SelectedHall } from "../../types";
import { Button, SectionLabel } from "../ui";
import { BRANCHES_DATA } from "../../constants";
import { currency } from "../../utils";

interface HallSelectorProps {
  branch: string;
  selectedHall: SelectedHall | null;
  onSelect: (hall: Hall) => void;
}

export default function HallSelector({
  branch,
  selectedHall,
  onSelect,
}: HallSelectorProps): JSX.Element {
  const halls = BRANCHES_DATA[branch] ?? [];

  return (
    <div>
      <SectionLabel>Available Halls — {branch}</SectionLabel>

      <div
        style={{
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-default)",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
            fontFamily: "var(--font-primary)",
          }}
        >
          <thead>
            <tr style={{ background: "var(--bg-app)" }}>
              {["Property", "Location", "Capacity", "Types", "₹/Plate", ""].map(
                (header) => (
                  <th
                    key={header}
                    style={{
                      padding: "8px 10px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {halls.map((hall) => {
              const active = selectedHall?.id === hall.id;
              return (
                <tr
                  key={hall.id}
                  style={{
                    borderTop: "1px solid var(--border-light)",
                    background: active ? "var(--accent-bg)" : "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: "8px 10px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {hall.name}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {hall.location}
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {hall.capacity}
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <div
                      style={{ display: "flex", gap: 3, flexWrap: "wrap" }}
                    >
                      {hall.eventTypes.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 9.5,
                            background: "var(--bg-app)",
                            padding: "1px 5px",
                            borderRadius: 4,
                            color: "var(--text-muted)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {currency(hall.costPerPlate)}
                  </td>
                  <td style={{ padding: "8px 10px" }}>
                    <Button
                      variant={active ? "primary" : "secondary"}
                      onClick={() => onSelect(hall)}
                      style={{ padding: "4px 12px", fontSize: 11 }}
                    >
                      {active ? "✓ Selected" : "Select"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedHall && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11.5,
            color: "var(--success)",
            fontWeight: 600,
            fontFamily: "var(--font-primary)",
          }}
        >
          ✓ Selecting a hall auto-advances this lead to Food Tasting
        </div>
      )}
    </div>
  );
}
