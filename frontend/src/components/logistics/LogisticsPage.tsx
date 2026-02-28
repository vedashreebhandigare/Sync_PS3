import { useState } from "react";
import useInventory from "../../hooks/useInventory";
import { Button, TrashIcon, EditIcon } from "../ui";
import type { InventoryItem, InventoryItemInput } from "../../types";

const inputStyle: React.CSSProperties = {
    padding: "9px 12px",
    border: "1.5px solid var(--border-default)",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "var(--font-primary)",
    outline: "none",
    background: "var(--bg-input)",
    color: "var(--text-primary)",
    width: "100%",
};

export default function LogisticsPage() {
    const { inventory, toBuy, loading, createItem, updateItem, deleteItem } = useInventory();

    const [form, setForm] = useState<InventoryItemInput>({
        name: "",
        unit: "",
        quantity: 0,
        low_stock_threshold: 0,
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSave = async () => {
        if (!form.name || !form.unit) return;
        if (editingId) {
            await updateItem(editingId, form);
            setEditingId(null);
        } else {
            await createItem(form);
        }
        setForm({ name: "", unit: "", quantity: 0, low_stock_threshold: 0 });
    };

    const startEdit = (item: InventoryItem) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            low_stock_threshold: item.low_stock_threshold,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({ name: "", unit: "", quantity: 0, low_stock_threshold: 0 });
    };

    return (
        <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto", width: "100%", height: "100%", overflowY: "auto", fontFamily: "var(--font-primary)", background: "var(--bg-app)", color: "var(--text-primary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Logistics & Inventory</h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 24, paddingBottom: 64 }}>

                {/* Left Side: Forms and To Buy List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    {/* Add / Edit Form */}
                    <div style={{ background: "var(--bg-card)", padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>{editingId ? "Edit Item" : "Add New Item"}</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Item Name</label>
                                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Potatoes, Mineral Water" />
                            </div>

                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Unit</label>
                                <input style={inputStyle} value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="e.g. kg, liters, bottles" />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Current Qty</label>
                                    <input type="number" step="0.01" style={inputStyle} value={form.quantity} onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Low Threshold</label>
                                    <input type="number" step="0.01" style={inputStyle} value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: parseFloat(e.target.value) || 0 })} />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <Button variant="primary" style={{ flex: 1 }} onClick={handleSave}>
                                    {editingId ? "Save Changes" : "Add Item"}
                                </Button>
                                {editingId && (
                                    <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* To Buy List */}
                    <div style={{ background: "var(--bg-card)", padding: 20, borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 0, color: "var(--danger)" }}>To Buy List</h3>
                        {toBuy.length === 0 ? (
                            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>All stock levels are sufficient.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {toBuy.map(item => (
                                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", border: "1px solid var(--border-light)", borderRadius: "var(--radius-md)", background: "var(--danger-light)" }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                                            <div style={{ fontSize: 11, color: "var(--danger)" }}>Need to restock. Threshold: {item.low_stock_threshold}{item.unit}</div>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--danger)" }}>
                                            {item.quantity} {item.unit}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Full Inventory */}
                <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-default)", background: "var(--bg-section)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Full Inventory</h3>
                    </div>

                    <div style={{ overflowY: "auto", flex: 1, padding: 20 }}>
                        {loading ? (
                            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>Loading inventory...</div>
                        ) : inventory.length === 0 ? (
                            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                                <PackageIcon />
                                <div style={{ marginTop: 12, fontSize: 14, fontWeight: 500 }}>No inventory items found.</div>
                                <div style={{ fontSize: 13, marginTop: 4 }}>Add some raw materials to get started.</div>
                            </div>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                <thead>
                                    <tr>
                                        {["Item Name", "Current Stock", "Threshold", "", ""].map((h, i) => (
                                            <th key={i} style={{ padding: "12px 8px", textAlign: "left", fontWeight: 600, color: "var(--text-secondary)", borderBottom: "1.5px solid var(--border-default)", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.map(item => {
                                        const lowStock = item.quantity <= item.low_stock_threshold;
                                        return (
                                            <tr key={item.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                                                <td style={{ padding: "12px 8px", fontWeight: 500 }}>{item.name}</td>
                                                <td style={{ padding: "12px 8px", fontWeight: 600, color: lowStock ? "var(--danger)" : "var(--text-primary)" }}>
                                                    {item.quantity} <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 400 }}>{item.unit}</span>
                                                </td>
                                                <td style={{ padding: "12px 8px", color: "var(--text-muted)" }}>{item.low_stock_threshold} {item.unit}</td>
                                                <td style={{ padding: "12px 14px", textAlign: "right", width: 44 }}>
                                                    <button onClick={() => startEdit(item)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", display: "flex", padding: 8, borderRadius: 6, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-bg)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"} title="Edit">
                                                        <EditIcon size={20} />
                                                    </button>
                                                </td>
                                                <td style={{ padding: "12px 14px", width: 44 }}>
                                                    <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", display: "flex", padding: 8, borderRadius: 6, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--danger-bg)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"} title="Delete">
                                                        <TrashIcon size={20} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function PackageIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" style={{ display: "inline-block", color: "currentColor" }}>
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    );
}
