import { useState, useEffect } from "react";
import type { CatalogItem, CatalogItemInput, CatalogIngredientInput, InventoryItem } from "../../types";
import { XIcon, TrashIcon } from "../ui";

interface MenuDetailPanelProps {
    item: CatalogItem;
    inventory: InventoryItem[];
    onClose: () => void;
    onSave: (id: string, data: CatalogItemInput) => Promise<void>;
}

const inputStyle: React.CSSProperties = {
    padding: "7px 10px",
    border: "1.5px solid var(--border-default)",
    borderRadius: 7,
    fontSize: 13,
    fontFamily: "var(--font-primary)",
    outline: "none",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
};

export default function MenuDetailPanel({ item, inventory, onClose, onSave }: MenuDetailPanelProps) {
    const [formData, setFormData] = useState<CatalogItemInput>({
        name: item.name,
        category: item.category,
        cost_per_plate: item.cost_per_plate,
        catalog_ingredients: item.catalog_ingredients ? item.catalog_ingredients.map(ing => ({
            inventory_item_id: ing.inventory_item_id,
            quantity_per_plate: ing.quantity_per_plate
        })) : [],
    });

    useEffect(() => {
        setFormData({
            name: item.name,
            category: item.category,
            cost_per_plate: item.cost_per_plate,
            catalog_ingredients: item.catalog_ingredients ? item.catalog_ingredients.map(ing => ({
                inventory_item_id: ing.inventory_item_id,
                quantity_per_plate: ing.quantity_per_plate
            })) : [],
        });
    }, [item]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(item.id, formData);
        onClose();
    };

    const updateIngredients = (ings: CatalogIngredientInput[]) => {
        setFormData(prev => ({ ...prev, catalog_ingredients: ings }));
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", zIndex: 199 }}
                onClick={onClose}
            />
            {/* Slide Panel */}
            <div className="animate-slide-in"
                style={{ position: "fixed", top: 0, right: 0, width: 500, height: "100vh", background: "var(--bg-card)", boxShadow: "var(--shadow-panel)", zIndex: 200, display: "flex", flexDirection: "column", fontFamily: "var(--font-primary)" }}>

                {/* ════════ HEADER ════════ */}
                <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "var(--text-primary)" }}>{item.name}</h2>
                        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Edit Item Details</div>
                    </div>
                    <button onClick={onClose} style={{ background: "var(--bg-hover)", border: "none", borderRadius: "var(--radius-md)", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
                        <XIcon />
                    </button>
                </div>

                {/* ════════ SCROLLABLE CONTENT ════════ */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px", display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Basic Info */}
                    <div style={{ background: "var(--bg-section)", padding: 16, borderRadius: 12, border: "1px solid var(--border-default)" }}>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px 0" }}>Basic Information</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Item Name</label>
                                <input
                                    required
                                    type="text"
                                    style={{ ...inputStyle, width: "100%" }}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Category</label>
                                    <select
                                        required
                                        style={{ ...inputStyle, width: "100%" }}
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {/* Simplified just to string to avoid importing MENU_CATEGORIES circularity if any */}
                                        <option value="Starters">Starters</option>
                                        <option value="Snacks">Snacks</option>
                                        <option value="Indian Chaat">Indian Chaat</option>
                                        <option value="Main Course">Main Course</option>
                                        <option value="Breads">Breads</option>
                                        <option value="Desserts">Desserts</option>
                                        <option value="Beverages">Beverages</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Cost per Plate (₹)</label>
                                    <input
                                        required
                                        type="number"
                                        min={0}
                                        style={{ ...inputStyle, width: "100%" }}
                                        value={formData.cost_per_plate}
                                        onChange={(e) => setFormData({ ...formData, cost_per_plate: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Ingredients Editor */}
                    <div style={{ background: "var(--bg-section)", padding: 16, borderRadius: 12, border: "1px solid var(--border-default)" }}>
                        <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px 0" }}>Default Ingredients</h3>
                        <IngredientEditor
                            ingredients={formData.catalog_ingredients}
                            inventory={inventory}
                            onChange={updateIngredients}
                        />
                    </div>
                </div>

                {/* ════════ FOOTER ════════ */}
                <div style={{ padding: "16px 22px", borderTop: "1px solid var(--border-default)", background: "var(--bg-app)" }}>
                    <button
                        onClick={handleSubmit}
                        style={{ width: "100%", padding: "10px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </>
    );
}

// Inline Ingredient Editor specific to the panel
function IngredientEditor({ ingredients, inventory, onChange }: { ingredients: CatalogIngredientInput[], inventory: InventoryItem[], onChange: (ings: CatalogIngredientInput[]) => void }) {
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
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-app)", padding: "8px 12px", borderRadius: "var(--radius-sm)", fontSize: 13, border: "1px solid var(--border-default)" }}>
                                <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                                    {inv?.name || "Unknown"}
                                    <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>{ing.quantity_per_plate} {inv?.unit}</span>
                                </span>
                                <button type="button" onClick={() => remove(i)} style={{ color: "var(--danger)", background: "var(--danger-bg)", border: "none", cursor: "pointer", display: "flex", padding: 6, borderRadius: 4 }}>
                                    <TrashIcon size={14} />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
            <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "stretch" }}>
                <select style={{ ...inputStyle, flex: 2 }} value={selectedInv} onChange={e => setSelectedInv(e.target.value)}>
                    <option value="">Select inventory item...</option>
                    {inventory.map(inv => <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>)}
                </select>
                <input type="number" step="0.01" style={{ ...inputStyle, flex: 1, minWidth: 60 }} value={qty} onChange={e => setQty(e.target.value)} placeholder="Qty / Plate" />
                <button type="button" style={{ padding: "0 16px", background: "var(--accent)", border: "none", borderRadius: 7, color: "#fff", fontWeight: 600, cursor: "pointer" }} onClick={add}>+</button>
            </div>
        </div>
    )
}
