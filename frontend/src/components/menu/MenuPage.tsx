import { useState, useEffect } from "react";
import type { CatalogItem, CatalogItemInput, MenuCategory } from "../../types";
import { fetchMenuCatalog, createMenuCatalogItem, updateMenuCatalogItem, deleteMenuCatalogItem } from "../../api/client";
import { MENU_CATEGORIES } from "../../constants";
import { TrashIcon, EditIcon } from "../ui";
import useInventory from "../../hooks/useInventory";
import MenuDetailPanel from "./MenuDetailPanel";

import startersImg from '../ui/starters.jpg';
import mainCourseImg from '../ui/main_course_files/indian-lunch-dinner-main-course-food-group-includes-paneer-butter-masala-dal-makhani-palak-paneer-roti-rice-etc-selective-focus_466689-6712.jpg';
import breadsImg from '../ui/breads.webp';
import indianChatImg from '../ui/indian_chat.webp';
import beveragesImg from '../ui/beverages.jpg';

const CATEGORY_IMAGES: Record<string, string> = {
    "Starters": startersImg,
    "Main Course": mainCourseImg,
    "Breads": breadsImg,
    "Indian Chaat": indianChatImg,
    "Desserts": indianChatImg,
    "Beverages": beveragesImg,
    "Snacks": startersImg // Fallback
};

export default function MenuPage() {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { inventory } = useInventory();

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);

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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createMenuCatalogItem(newItemData);
            await loadItems();
            setNewItemData({
                name: "",
                category: selectedCategory ? (selectedCategory as MenuCategory) : "Starters",
                cost_per_plate: 0,
                catalog_ingredients: [],
            });
            setIsCreating(false);
        } catch (err) {
            console.error("Failed to save item", err);
            alert("Failed to create menu item");
        }
    };

    const handleUpdateItem = async (id: string, data: CatalogItemInput) => {
        try {
            await updateMenuCatalogItem(id, data);
            await loadItems();

            // Note: we purposefully don't close setSelectedItem(null) immediately if it's open, 
            // since MenuDetailPanel might close itself or we might just want to update data behind.
            // Oh, MenuDetailPanel calls onClose when user clicks "×"
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
        <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto", width: "100%", height: "100%", overflowY: "auto", fontFamily: "var(--font-primary)", background: "var(--bg-app)", color: "var(--text-primary)" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                        {selectedCategory && (
                            <button
                                onClick={() => setSelectedCategory(null)}
                                style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 24, display: "flex", alignItems: "center", padding: 0 }}
                                title="Back to Categories"
                            >
                                ←
                            </button>
                        )}
                        {selectedCategory ? `${selectedCategory} Menu` : 'Menu Configuration'}
                    </h1>
                    <p style={{ color: "var(--text-secondary)", margin: "8px 0 0 0" }}>
                        {selectedCategory ? `Manage your ${selectedCategory.toLowerCase()} items and ingredients` : 'Organize and manage your entire food catalog'}
                    </p>
                </div>

                {!selectedCategory && (
                    <button
                        onClick={() => {
                            setNewItemData(prev => ({ ...prev, category: "Starters" }));
                            setIsCreating(true);
                        }}
                        style={{ padding: "12px 24px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(99,102,241,0.3)", transition: "transform 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                        <span style={{ fontSize: 18 }}>+</span> Add New Menu Item
                    </button>
                )}
            </div>

            {/* View Switching */}
            {!selectedCategory ? (
                // CATEGORY GRID VIEW
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
                    {MENU_CATEGORIES.map(category => {
                        const bgImg = CATEGORY_IMAGES[category];
                        const count = groupedItems[category]?.length || 0;

                        return (
                            <div
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                style={{
                                    position: "relative", height: 200, borderRadius: 16, overflow: "hidden", cursor: "pointer",
                                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", transition: "transform 0.3s, box-shadow 0.3s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px)";
                                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.2)";
                                    const img = e.currentTarget.querySelector('.img-scale') as HTMLElement;
                                    if (img) img.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                                    const img = e.currentTarget.querySelector('.img-scale') as HTMLElement;
                                    if (img) img.style.transform = "scale(1)";
                                }}
                            >
                                {/* Background Image/Gradient */}
                                {bgImg ? (
                                    <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${bgImg})`, backgroundSize: "cover", backgroundPosition: "center", transition: "transform 0.5s", zIndex: 0 }} className="img-scale" />
                                ) : (
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, var(--accent), var(--accent-hover, #4f46e5))", zIndex: 0 }} />
                                )}

                                {/* Overlay gradient for text readability */}
                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)", zIndex: 1 }} />

                                {/* Content */}
                                <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 24 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                                        <h3 style={{ margin: 0, color: "#fff", fontSize: 24, fontWeight: 700, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                                            {category}
                                        </h3>
                                        <span style={{
                                            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
                                            padding: "6px 12px", borderRadius: 20, color: "#fff",
                                            fontSize: 13, fontWeight: 600, border: "1px solid rgba(255,255,255,0.3)"
                                        }}>
                                            {count} {count === 1 ? 'Item' : 'Items'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Explicit Add Card */}
                    <div
                        onClick={() => {
                            setNewItemData(prev => ({ ...prev, category: "Starters" }));
                            setIsCreating(true);
                        }}
                        style={{
                            height: 200, borderRadius: 16, border: "2px dashed var(--accent)",
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.2s", background: "var(--accent-bg)"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-hover)";
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "var(--accent-bg)";
                            e.currentTarget.style.borderColor = "var(--accent)";
                            e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        <div style={{ width: 48, height: 48, borderRadius: 24, background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 12 }}>+</div>
                        <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 16 }}>Create New Menu Item</span>
                    </div>
                </div>
            ) : (
                // ITEMS LIST VIEW
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                        <h3 style={{ fontSize: 18, margin: 0, color: "var(--text-primary)" }}>Items in {selectedCategory}</h3>
                        <button
                            onClick={() => {
                                setNewItemData(prev => ({ ...prev, category: selectedCategory as MenuCategory }));
                                setIsCreating(true);
                            }}
                            style={{ padding: "8px 16px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", transition: "transform 0.2s" }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        >
                            + Add Item
                        </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                        {groupedItems[selectedCategory]?.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                style={{
                                    background: "var(--bg-card)", border: "1px solid var(--border-light)",
                                    borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-4px)";
                                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.08)";
                                    e.currentTarget.style.borderColor = "var(--accent)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                                    e.currentTarget.style.borderColor = "var(--border-light)";
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                    <h4 style={{ margin: 0, fontSize: 16, color: "var(--text-primary)", fontWeight: 600 }}>{item.name}</h4>
                                    <div style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>₹{item.cost_per_plate}</div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{
                                        fontSize: 12, padding: "4px 10px",
                                        background: item.catalog_ingredients && item.catalog_ingredients.length > 0 ? "var(--accent-bg)" : "var(--bg-hover)",
                                        color: item.catalog_ingredients && item.catalog_ingredients.length > 0 ? "var(--accent)" : "var(--text-secondary)",
                                        borderRadius: 20, fontWeight: 600, border: item.catalog_ingredients && item.catalog_ingredients.length > 0 ? "1px solid var(--accent)" : "1px solid transparent"
                                    }}>
                                        {item.catalog_ingredients?.length || 0} Ingredients Linked
                                    </span>

                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                                            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 6, borderRadius: 6, transition: "0.2s" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--accent)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                                            title="Edit Details & Ingredients"
                                        >
                                            <EditIcon size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, item.id)}
                                            style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 6, borderRadius: 6, transition: "0.2s" }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--danger-bg)"; e.currentTarget.style.color = "var(--danger)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                                            title="Delete Item"
                                        >
                                            <TrashIcon size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {groupedItems[selectedCategory]?.length === 0 && (
                            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40, color: "var(--text-secondary)", border: "1px dashed var(--border-light)", borderRadius: 12 }}>
                                No items in this category yet. Click "+ Add Item" to create one.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Item Modal */}
            {isCreating && (
                <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fadeIn 0.2s ease" }}>
                    <div style={{ background: "var(--bg-card)", width: "100%", maxWidth: 450, borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.3)", animation: "slideUp 0.3s ease" }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ margin: 0, fontSize: 20, color: "var(--text-primary)" }}>Create New Menu Item</h2>
                            <button onClick={() => setIsCreating(false)} style={{ background: "none", border: "none", fontSize: 24, color: "var(--text-secondary)", cursor: "pointer", padding: 0, display: "flex" }}>×</button>
                        </div>
                        <form onSubmit={handleCreate} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Item Name</label>
                                <input
                                    required autoFocus
                                    type="text"
                                    value={newItemData.name}
                                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 14 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Category</label>
                                <select
                                    required
                                    value={newItemData.category}
                                    onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value as MenuCategory })}
                                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 14 }}
                                >
                                    {MENU_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Cost per Plate (₹)</label>
                                <input
                                    required type="number" min={0}
                                    value={newItemData.cost_per_plate}
                                    onChange={(e) => setNewItemData({ ...newItemData, cost_per_plate: Number(e.target.value) })}
                                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 14 }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                                <button type="button" onClick={() => setIsCreating(false)} style={{ flex: 1, padding: "12px", background: "var(--bg-hover)", color: "var(--text-primary)", border: "1px solid var(--border-light)", borderRadius: 8, fontWeight: 600, cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--border-light)"} onMouseLeave={e => e.currentTarget.style.background = "var(--bg-hover)"}>Cancel</button>
                                <button type="submit" style={{ flex: 2, padding: "12px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", transition: "0.2s", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter = "none"}>Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedItem && (
                <MenuDetailPanel
                    item={selectedItem}
                    inventory={inventory}
                    onClose={() => setSelectedItem(null)}
                    onSave={handleUpdateItem}
                />
            )}
        </div>
    );
}
