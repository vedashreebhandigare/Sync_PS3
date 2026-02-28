import { useState, useRef, useEffect } from "react";

export default function TopHeader() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="aurora-header" style={{ justifyContent: "space-between", position: "relative" }}>
            {/* Left: Logo Placeholder */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, width: 200 }}>
                {/* Leaving this blank/flexible as requested for the actual project logo later */}
            </div>

            {/* Center: Global Search */}
            <div className="aurora-search-box" style={{ flex: 1, maxWidth: 500, margin: "0 20px" }}>
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
                <input type="text" placeholder="Global Search..." />
            </div>

            {/* Right: Notifications & Profile */}
            <div className="aurora-header-right" style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {/* Notifications (🔔) */}
                <button className="aurora-header-icon-btn" title="Notifications" style={{ position: "relative" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                    <span className="notif-dot" style={{ position: "absolute", top: 6, right: 6, background: "var(--danger)", width: 8, height: 8, borderRadius: "50%", border: "2px solid var(--bg-card)" }} />
                </button>

                {/* User Profile Dropdown */}
                <div style={{ position: "relative" }} ref={menuRef}>
                    <button
                        className="aurora-header-avatar"
                        title="Profile"
                        style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            backgroundColor: "var(--bg-hover)",
                            color: "var(--text-primary)",
                            transition: "background 0.2s"
                        }}
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--border-default)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </button>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div
                            style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                marginTop: 8,
                                width: 180,
                                background: "#151f2d", // var(--bg-section) solid color to ensure opacity
                                border: "1px solid var(--border-light)",
                                borderRadius: "var(--radius-lg)",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                                overflow: "hidden",
                                zIndex: 9999,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {[
                                { label: "My Profile", icon: "user" },
                                { label: "Change Password", icon: "lock" },
                                { label: "Logout", icon: "log-out", danger: true }
                            ].map((item, i) => (
                                <button
                                    key={item.label}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        width: "100%",
                                        padding: "12px 16px",
                                        background: "none",
                                        border: "none",
                                        borderBottom: i < 2 ? "1px solid var(--border-light)" : "none",
                                        color: item.danger ? "var(--danger)" : "var(--text-secondary)",
                                        fontSize: 13,
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "all 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = item.danger ? "var(--danger-bg)" : "var(--bg-hover)";
                                        e.currentTarget.style.color = item.danger ? "var(--danger)" : "var(--text-primary)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "none";
                                        e.currentTarget.style.color = item.danger ? "var(--danger)" : "var(--text-secondary)";
                                    }}
                                >
                                    {/* Simplistic Icon Rendering based on type */}
                                    {item.icon === "user" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                                    {item.icon === "lock" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
                                    {item.icon === "log-out" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>}
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
