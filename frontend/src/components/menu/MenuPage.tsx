import { Fragment, useState, useEffect } from "react";
import type { CatalogItem, CatalogItemInput } from "../../types";
import { fetchMenuCatalog, createMenuCatalogItem, updateMenuCatalogItem, deleteMenuCatalogItem } from "../../api/client";
import { MENU_CATEGORIES } from "../../constants";
import { TrashIcon, EditIcon } from "../ui";
import useInventory from "../../hooks/useInventory";
import MenuDetailPanel from "./MenuDetailPanel";

export default function MenuPage() {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);

    const { inventory } = useInventory();
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

    const [newItemData, setNewItemData] = useState<CatalogItemInput>({
        name: "",
        category: "Starters",
        cost_per_plate: 0,
        catalog_ingredients: [],
    });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const data = await fetchMenuCatalog();
            setItems(data);
        } catch (err) {
            console.error("Failed to load catalog", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMenuCatalogItem(newItemData);
            await loadItems();
            setNewItemData({
                name: "",
                category: "Starters",
                cost_per_plate: 0,
                catalog_ingredients: [],
            });
        } catch (err) {
            console.error("Failed to save item", err);
            alert("Failed to create menu item");
        }
    };

    const handleUpdateItem = async (id: string, data: CatalogItemInput) => {
        try {
            await updateMenuCatalogItem(id, data);
            await loadItems();
            setSelectedItem(null);
        } catch (err) {
            console.error("Failed to update item", err);
            alert("Failed to update item");
        }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this menu item?")) return;
        try {
            await deleteMenuCatalogItem(id);
            await loadItems();
        } catch (err) {
            console.error("Failed to delete item", err);
            alert("Cannot delete item. It may be in use.");
        }
    };

    if (loading) {
        return <div style={{ padding: 24, background: "var(--bg-app)", color: "var(--text-primary)", height: "100%" }}>Loading Menu...</div>;
    }

    // Group items by category
    const groupedItems: Record<string, CatalogItem[]> = {};
    MENU_CATEGORIES.forEach(c => groupedItems[c] = []);
    items.forEach(item => {
        if (!groupedItems[item.category]) groupedItems[item.category] = [];
        groupedItems[item.category].push(item);
    });

    return (
        <>
            <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto", width: "100%", height: "100%", overflowY: "auto", fontFamily: "var(--font-primary)", background: "var(--bg-app)", color: "var(--text-primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Menu Configuration</h1>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "start" }}>
                    {/* ── Form Panel ── */}
                    <div style={{ background: "var(--bg-card)", padding: 20, borderRadius: 12, border: "1px solid var(--border-default)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", position: "sticky", top: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>Create New Item</h3>
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Item Name</label>
                                <input
                                    required
                                    type="text"
                                    style={{
                                        width: "100%", padding: "8px 12px", borderRadius: 8,
                                        border: "1px solid var(--border-default)", background: "var(--bg-input)",
                                        fontSize: 14, color: "var(--text-primary)"
                                    }}
                                    value={newItemData.name}
                                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Category</label>
                                <select
                                    required
                                    style={{
                                        width: "100%", padding: "8px 12px", borderRadius: 8,
                                        border: "1px solid var(--border-default)", background: "var(--bg-input)",
                                        fontSize: 14, color: "var(--text-primary)"
                                    }}
                                    value={newItemData.category}
                                    onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                                >
                                    {MENU_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, display: "block" }}>Cost per Plate (₹)</label>
                                <input
                                    required
                                    type="number"
                                    min={0}
                                    style={{
                                        width: "100%", padding: "8px 12px", borderRadius: 8,
                                        border: "1px solid var(--border-default)", background: "var(--bg-input)",
                                        fontSize: 14, color: "var(--text-primary)"
                                    }}
                                    value={newItemData.cost_per_plate}
                                    onChange={(e) => setNewItemData({ ...newItemData, cost_per_plate: Number(e.target.value) })}
                                />
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: "10px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
                                >
                                    + Add Catalog Item
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── List Panel ── */}
                    <div style={{ background: "var(--bg-card)", padding: 20, borderRadius: 12, border: "1px solid var(--border-default)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>Full Menu Catalog</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                            {MENU_CATEGORIES.map(category => {
                                const catItems = groupedItems[category];
                                if (!catItems || catItems.length === 0) return null;

                                return (
                                    <div key={category}>
                                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{category}</h4>
                                        <div style={{ border: "1px solid var(--border-light)", borderRadius: 8, overflow: "hidden" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                                <tbody>
                                                    {catItems.map((item, idx) => (
                                                        <Fragment key={item.id}>
                                                            <tr
                                                                style={{ borderTop: idx > 0 ? "1px solid var(--border-light)" : "none", background: "transparent", cursor: "pointer", transition: "background 0.2s" }}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                                                onClick={() => setSelectedItem(item)}
                                                            >
                                                                <td style={{ padding: "10px 12px", fontWeight: 500, color: "var(--text-primary)" }}>
                                                                    {item.name}
                                                                    {item.catalog_ingredients && item.catalog_ingredients.length > 0 && (
                                                                        <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 6px", background: "var(--accent-bg)", color: "var(--accent)", borderRadius: 4 }}>
                                                                            {item.catalog_ingredients.length} ings
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>₹{item.cost_per_plate}</td>
                                                                <td style={{ padding: "10px 12px", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedItem(item);
                                                                        }}
                                                                        style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", display: "flex", padding: 6, borderRadius: 6, transition: "background 0.2s" }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                                                        title="Edit Details"
                                                                    >
                                                                        <EditIcon size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleDelete(e, item.id)}
                                                                        style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", display: "flex", padding: 6, borderRadius: 6, transition: "background 0.2s" }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.background = "var(--danger-bg)"} onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                                                        title="Delete"
                                                                    >
                                                                        <TrashIcon size={18} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        </Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {
                selectedItem && (
                    <MenuDetailPanel
                        item={selectedItem}
                        inventory={inventory}
                        onClose={() => setSelectedItem(null)}
                        onSave={handleUpdateItem}
                    />
                )
            }
        </>
    );
}
