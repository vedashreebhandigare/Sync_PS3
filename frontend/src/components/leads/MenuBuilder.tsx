import { useState, Fragment } from "react";
import type { MenuItem, MenuItemInput, MenuCategory, CatalogItem, MenuItemIngredientInput, InventoryItem } from "../../types";
import { Button, SectionLabel, PlusIcon, TrashIcon, XIcon } from "../ui";
import { MENU_CATEGORIES } from "../../constants";
import { currency } from "../../utils";
import useInventory from "../../hooks/useInventory";

const DEFAULT_INGREDIENTS: Record<string, { invName: string, qty: number }[]> = {
  "Mineral Water": [{ invName: "Mineral Water", qty: 1 }],
  "Coffee / Espresso": [{ invName: "Coffee Beans", qty: 0.015 }, { invName: "Milk", qty: 0.1 }],
  "Tomato Soup": [{ invName: "Tomatoes", qty: 0.2 }],
  "Tomato Basil Soup": [{ invName: "Tomatoes", qty: 0.2 }],
  "Espresso": [{ invName: "Coffee Beans", qty: 0.015 }, { invName: "Milk", qty: 0.1 }],
};

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
  background: "var(--bg-input)",
  color: "var(--text-primary)",
};

export default function MenuBuilder({ menu, guestCount, catalog, onSave }: MenuBuilderProps) {
  const [showCatalog, setShowCatalog] = useState<boolean>(false);
  const [form, setForm] = useState<NewItemForm>(INITIAL_FORM);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const { inventory } = useInventory();

  const totalPerPlate = menu.reduce((sum, m) => sum + m.cost_per_plate, 0);

  const toInputs = (items: MenuItem[]): MenuItemInput[] =>
    items.map((m) => ({
      name: m.name,
      category: m.category,
      cost_per_plate: m.cost_per_plate,
      ingredients: m.ingredients ? m.ingredients.map(ing => ({
        inventory_item_id: ing.inventory_item_id,
        quantity_per_plate: ing.quantity_per_plate
      })) : []
    }));

  const addItem = (name: string, category: MenuCategory, cost: number): void => {
    const catalogItem = catalog.find(c => c.name === name);
    let prefilled: MenuItemIngredientInput[] = [];

    if (catalogItem && catalogItem.catalog_ingredients && catalogItem.catalog_ingredients.length > 0) {
      prefilled = catalogItem.catalog_ingredients.map(ing => ({
        inventory_item_id: ing.inventory_item_id,
        quantity_per_plate: ing.quantity_per_plate
      }));
    } else {
      const defaultIngs = DEFAULT_INGREDIENTS[name] || [];
      prefilled = defaultIngs.map(d => {
        const inv = inventory.find(i => i.name.toLowerCase() === d.invName.toLowerCase());
        return inv ? { inventory_item_id: inv.id, quantity_per_plate: d.qty } : null;
      }).filter(Boolean) as MenuItemIngredientInput[];
    }

    const next = [...toInputs(menu), { name, category, cost_per_plate: cost, ingredients: prefilled }];
    onSave(next);
  };

  const updateIngredients = (itemId: string, newIngredients: MenuItemIngredientInput[]) => {
    const next = toInputs(menu);
    const idx = menu.findIndex(m => m.id === itemId);
    if (idx !== -1) {
      next[idx].ingredients = newIngredients;
      onSave(next);
    }
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
                <Fragment key={item.id}>
                  <tr style={{ borderTop: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "7px 10px", fontWeight: 500, color: "var(--text-primary)" }}>{item.name}</td>
                    <td style={{ padding: "7px 10px", color: "var(--text-secondary)" }}>{item.category}</td>
                    <td style={{ padding: "7px 10px", fontWeight: 600, color: "var(--text-primary)" }}>{currency(item.cost_per_plate)}</td>
                    <td style={{ padding: "7px 10px", display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 11, fontWeight: 600 }}>
                        {expandedItemId === item.id ? "Editing..." : "Edit Requirements"}
                      </button>
                      <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", display: "flex" }}>
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>

          {/* Slide-out Ingredients Panel within MenuBuilder */}
          {expandedItemId && (() => {
            const item = menu.find(m => m.id === expandedItemId);
            if (!item) return null;
            return (
              <>
                <div
                  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
                  onClick={() => setExpandedItemId(null)}
                />
                <div className="animate-slide-in"
                  style={{ position: "fixed", top: 0, right: 0, width: 450, height: "100vh", background: "var(--bg-card)", boxShadow: "var(--shadow-panel)", zIndex: 1100, display: "flex", flexDirection: "column", fontFamily: "var(--font-primary)" }}>
                  <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "var(--text-primary)" }}>{item.name}</h2>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Menu Requirements</div>
                    </div>
                    <button onClick={() => setExpandedItemId(null)} style={{ background: "var(--bg-hover)", border: "none", borderRadius: "var(--radius-md)", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
                      <XIcon />
                    </button>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
                    <IngredientEditor
                      ingredients={item.ingredients || []}
                      inventory={inventory}
                      onChange={(ings) => updateIngredients(item.id, ings)}
                    />
                  </div>
                  <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border-default)", background: "var(--bg-app)" }}>
                    <button
                      onClick={() => setExpandedItemId(null)}
                      style={{ width: "100%", padding: "10px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
                    >
                      Done Editing
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
          <div style={{ padding: "8px 10px", borderTop: "1px solid var(--border-default)", background: "var(--bg-app)", display: "flex", justifyContent: "space-between", fontSize: 12.5, fontFamily: "var(--font-primary)" }}>
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>Total per plate: {currency(totalPerPlate)}</span>
            <span style={{ fontWeight: 700, color: "var(--accent)" }}>Est. total: {currency(totalPerPlate * guestCount)} ({guestCount} guests)</span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        <input placeholder="Dish name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as MenuCategory })} style={{ ...inputStyle, padding: "7px 8px" }}>
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

      {
        showCatalog && (
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
                          style={{ padding: "4px 10px", borderRadius: "var(--radius-sm)", border: `1px solid ${exists ? "var(--border-light)" : "var(--border-default)"}`, background: exists ? "var(--bg-section)" : "var(--bg-card)", fontSize: 11.5, fontFamily: "var(--font-primary)", cursor: exists ? "default" : "pointer", color: exists ? "var(--text-muted)" : "var(--text-primary)", fontWeight: 500, opacity: exists ? 0.5 : 1 }}>
                          {exists ? "✓ " : "+ "}{item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        )
      }
    </div >
  );
}

function IngredientEditor({ ingredients, inventory, onChange }: { ingredients: MenuItemIngredientInput[], inventory: InventoryItem[], onChange: (ings: MenuItemIngredientInput[]) => void }) {
  const [selectedInv, setSelectedInv] = useState("");
  const [qty, setQty] = useState("");

  const add = () => {
    if (!selectedInv || !qty) return;
    onChange([...ingredients, { inventory_item_id: selectedInv, quantity_per_plate: Number(qty) }]);
    setSelectedInv("");
    setQty("");
  }

  const remove = (idx: number) => {
    const next = [...ingredients];
    next.splice(idx, 1);
    onChange(next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {ingredients.length === 0 && (
        <div style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: 12 }}>No ingredients specified. Add one below.</div>
      )}
      {ingredients.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ingredients.map((ing, i) => {
            const inv = inventory.find(x => x.id === ing.inventory_item_id);
            return (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-app)", padding: "10px 12px", borderRadius: "var(--radius-sm)", fontSize: 13, border: "1px solid var(--border-default)" }}>
                <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{inv?.name || "Unknown"} <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>{ing.quantity_per_plate} {inv?.unit}</span></span>
                <button type="button" onClick={() => remove(i)} style={{ color: "var(--danger)", background: "var(--danger-bg)", border: "none", cursor: "pointer", display: "flex", padding: 6, borderRadius: 4 }}>
                  <TrashIcon size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "stretch" }}>
        <select style={{ ...inputStyle, padding: "7px 8px", flex: 2, fontSize: 12 }} value={selectedInv} onChange={e => setSelectedInv(e.target.value)}>
          <option value="">Select inventory item...</option>
          {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>)}
        </select>
        <input type="number" step="0.01" style={{ ...inputStyle, padding: "7px 8px", flex: 1, minWidth: 60, fontSize: 12 }} value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty / Plate" />
        <button type="button" style={{ padding: "0 16px", background: "var(--accent)", border: "none", borderRadius: 7, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 16 }} onClick={add}>+</button>
      </div>
    </div>
  )
}
