import { useState } from "react";
import type { MenuItem, MenuCategory } from "../../types";
import { Button, SectionLabel, PlusIcon, TrashIcon } from "../ui";
import { MENU_CATALOG } from "../../constants";
import { currency, generateId } from "../../utils";

interface MenuBuilderProps {
  menu: MenuItem[];
  guestCount: number;
  onUpdateMenu: (items: MenuItem[]) => void;
}

interface NewItemForm {
  name: string;
  category: MenuCategory;
  costPerPlate: string;
}

const INITIAL_FORM: NewItemForm = {
  name: "",
  category: "Starters",
  costPerPlate: "",
};

const inputStyle: React.CSSProperties = {
  padding: "7px 10px",
  border: "1.5px solid var(--border-default)",
  borderRadius: 7,
  fontSize: 12.5,
  fontFamily: "var(--font-primary)",
  outline: "none",
};

export default function MenuBuilder({
  menu,
  guestCount,
  onUpdateMenu,
}: MenuBuilderProps): JSX.Element {
  const [showCatalog, setShowCatalog] = useState<boolean>(false);
  const [form, setForm] = useState<NewItemForm>(INITIAL_FORM);

  const totalPerPlate = menu.reduce((sum, m) => sum + m.costPerPlate, 0);

  const addItem = (
    name: string,
    category: MenuCategory,
    cost: number
  ): void => {
    onUpdateMenu([
      ...menu,
      { id: generateId(), name, category, costPerPlate: cost },
    ]);
  };

  const removeItem = (id: string): void => {
    onUpdateMenu(menu.filter((m) => m.id !== id));
  };

  const handleAddCustom = (): void => {
    if (!form.name || !form.costPerPlate) return;
    addItem(form.name, form.category, Number(form.costPerPlate));
    setForm(INITIAL_FORM);
  };

  return (
    <div>
      <SectionLabel>Menu Items</SectionLabel>

      {/* Existing items table */}
      {menu.length > 0 && (
        <div
          style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-default)",
            overflow: "hidden",
            marginBottom: 10,
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
                {["Item", "Category", "₹/Plate", ""].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "7px 10px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--text-secondary)",
                      fontSize: 10.5,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderTop: "1px solid var(--border-light)" }}
                >
                  <td
                    style={{
                      padding: "7px 10px",
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{
                      padding: "7px 10px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {item.category}
                  </td>
                  <td
                    style={{
                      padding: "7px 10px",
                      fontWeight: 600,
                    }}
                  >
                    {currency(item.costPerPlate)}
                  </td>
                  <td style={{ padding: "7px 10px" }}>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--danger)",
                        display: "flex",
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals row */}
          <div
            style={{
              padding: "8px 10px",
              borderTop: "1px solid var(--border-default)",
              background: "var(--bg-app)",
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12.5,
              fontFamily: "var(--font-primary)",
            }}
          >
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              Total per plate: {currency(totalPerPlate)}
            </span>
            <span style={{ fontWeight: 700, color: "var(--accent)" }}>
              Est. total: {currency(totalPerPlate * guestCount)} ({guestCount}{" "}
              guests)
            </span>
          </div>
        </div>
      )}

      {/* Add custom item row */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input
          placeholder="Dish name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ ...inputStyle, flex: 1 }}
        />
        <select
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: e.target.value as MenuCategory })
          }
          style={{
            ...inputStyle,
            background: "#fff",
            padding: "7px 8px",
          }}
        >
          {MENU_CATALOG.map((c) => (
            <option key={c.category}>{c.category}</option>
          ))}
        </select>
        <input
          placeholder="₹/plate"
          type="number"
          value={form.costPerPlate}
          onChange={(e) => setForm({ ...form, costPerPlate: e.target.value })}
          style={{ ...inputStyle, width: 75 }}
        />
        <Button
          variant="primary"
          style={{ padding: "7px 12px" }}
          onClick={handleAddCustom}
        >
          <PlusIcon size={14} /> Add
        </Button>
      </div>

      {/* Quick-add catalog toggle */}
      <Button
        variant="ghost"
        onClick={() => setShowCatalog((prev) => !prev)}
        style={{ fontSize: 12 }}
      >
        {showCatalog ? "Hide" : "Show"} quick-add catalog
      </Button>

      {showCatalog && (
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {MENU_CATALOG.map((cat) => (
            <div key={cat.category}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: 4,
                  fontFamily: "var(--font-primary)",
                }}
              >
                {cat.category}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {cat.items.map((item) => {
                  const exists = menu.some((m) => m.name === item);
                  return (
                    <button
                      key={item}
                      disabled={exists}
                      onClick={() => addItem(item, cat.category, 100)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "var(--radius-sm)",
                        border: `1px solid ${exists ? "var(--border-light)" : "var(--border-default)"}`,
                        background: exists ? "var(--bg-app)" : "#fff",
                        fontSize: 11.5,
                        fontFamily: "var(--font-primary)",
                        cursor: exists ? "default" : "pointer",
                        color: exists
                          ? "var(--text-muted)"
                          : "var(--text-primary)",
                        fontWeight: 500,
                        opacity: exists ? 0.5 : 1,
                      }}
                    >
                      {exists ? "✓ " : "+ "}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {menu.length > 0 && (
        <div
          style={{
            marginTop: 10,
            fontSize: 11.5,
            color: "var(--success)",
            fontWeight: 600,
            fontFamily: "var(--font-primary)",
          }}
        >
          ✓ Adding menu items auto-advances this lead to Menu Finalized
        </div>
      )}
    </div>
  );
}
