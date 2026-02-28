import { useState } from "react";
import type { MenuItem, MenuItemInput, MenuCategory, CatalogItem } from "../../types";
import { Button, SectionLabel, PlusIcon, TrashIcon } from "../ui";
import { MENU_CATEGORIES } from "../../constants";
import { currency } from "../../utils";

interface MenuBuilderProps {
  menu: MenuItem[];
  guestCount: number;
  catalog: CatalogItem[];
  onSave: (items: MenuItemInput[]) => void;
}

interface NewItemForm {
  name: string;
  category: MenuCategory;
  cost: string;
}

const INITIAL_FORM: NewItemForm = { name: "", category: "Starters", cost: "" };

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
  catalog,
  onSave,
}: MenuBuilderProps): JSX.Element {
  const [showCatalog, setShowCatalog] = useState<boolean>(false);
  const [form, setForm] = useState<NewItemForm>(INITIAL_FORM);

  const totalPerPlate = menu.reduce((sum, m) => sum + m.cost_per_plate, 0);

  /* Convert current menu to inputs (strip server-generated id) */
  const toInputs = (items: MenuItem[]): MenuItemInput[] =>
    items.map((m) => ({ name: m.name, category: m.category, cost_per_plate: m.cost_per_plate }));

  const addItem = (name: string, category: MenuCategory, cost: number): void => {
    const next = [...toInputs(menu), { name, category, cost_per_plate: cost }];
    onSave(next);
  };

  const removeItem = (id: string): void => {
    const next = toInputs(menu.filter((m) => m.id !== id));
    onSave(next);
  };

  const handleAddCustom = (): void => {
    if (!form.name || !form.cost) return;
    addItem(form.name, form.category, Number(form.cost));
    setForm(INITIAL_FORM);
  };

  /* Group catalog by category */
  const catalogByCategory = MENU_CATEGORIES.map((cat) => ({
    category: cat,
    items: catalog.filter((c) => c.category === cat),
  }));

  return (
    <div>
      <SectionLabel>Menu Items</SectionLabel>

      {menu.length > 0 && (
        <div style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border-default)", overflow: "hidden", marginBottom: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "var(--font-primary)" }}>
            <thead>
              <tr style={{ background: "var(--bg-app)" }}>
                {["Item", "Category", "₹/Plate", ""].map((h) => (
                  <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {menu.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "7px 10px", fontWeight: 500, color: "var(--text-primary)" }}>{item.name}</td>
                  <td style={{ padding: "7px 10px", color: "var(--text-secondary)" }}>{item.category}</td>
                  <td style={{ padding: "7px 10px", fontWeight: 600 }}>{currency(item.cost_per_plate)}</td>
                  <td style={{ padding: "7px 10px" }}>
                    <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", display: "flex" }}>
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "8px 10px", borderTop: "1px solid var(--border-default)", background: "var(--bg-app)", display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: "var(--font-primary)" }}>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Total per plate: {currency(totalPerPlate)}</span>
            <span style={{ fontWeight: 700, color: "var(--accent)" }}>Est. total: {currency(totalPerPlate * guestCount)} ({guestCount} guests)</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input placeholder="Dish name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MenuCategory })} style={{ ...inputStyle, background: "#fff", padding: "7px 8px" }}>
          {MENU_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input placeholder="₹/plate" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} style={{ ...inputStyle, width: 75 }} />
        <Button variant="primary" style={{ padding: "7px 12px" }} onClick={handleAddCustom}>
          <PlusIcon size={14} /> Add
        </Button>
      </div>

      <Button variant="ghost" onClick={() => setShowCatalog((p) => !p)} style={{ fontSize: 12 }}>
        {showCatalog ? "Hide" : "Show"} quick-add catalog
      </Button>

      {showCatalog && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          {catalogByCategory.map((group) => (
            group.items.length > 0 && (
              <div key={group.category}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-primary)" }}>{group.category}</div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {group.items.map((item) => {
                    const exists = menu.some((m) => m.name === item.name);
                    return (
                      <button key={item.id} disabled={exists} onClick={() => addItem(item.name, item.category, item.cost_per_plate)}
                        style={{ padding: "4px 10px", borderRadius: "var(--radius-sm)", border: `1px solid ${exists ? "var(--border-light)" : "var(--border-default)"}`, background: exists ? "var(--bg-app)" : "#fff", fontSize: 11.5, fontFamily: "var(--font-primary)", cursor: exists ? "default" : "pointer", color: exists ? "var(--text-muted)" : "var(--text-primary)", fontWeight: 500, opacity: exists ? 0.5 : 1 }}>
                        {exists ? "✓ " : "+ "}{item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}
