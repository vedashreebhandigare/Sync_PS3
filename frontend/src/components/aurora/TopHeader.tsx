import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function TopHeader(): JSX.Element {
    const { user, isOwner, logout, changePassword } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdCurrent, setPwdCurrent] = useState("");
    const [pwdNew, setPwdNew] = useState("");
    const [pwdConfirm, setPwdConfirm] = useState("");
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChangePassword = async () => {
        setPwdError("");
        if (pwdNew !== pwdConfirm) {
            setPwdError("New passwords do not match");
            return;
        }
        if (pwdNew.length < 6) {
            setPwdError("Password must be at least 6 characters");
            return;
        }
        setPwdLoading(true);
        try {
            await changePassword(pwdCurrent, pwdNew);
            setPwdSuccess(true);
            setTimeout(() => {
                setShowPasswordModal(false);
                setPwdCurrent("");
                setPwdNew("");
                setPwdConfirm("");
                setPwdSuccess(false);
            }, 1500);
        } catch (err: any) {
            setPwdError(err.message || "Failed to change password");
        } finally {
            setPwdLoading(false);
        }
    };

    const roleBadge = isOwner
        ? { label: "Owner", bg: "rgba(99,102,241,0.15)", color: "#818cf8" }
        : { label: user?.branch_name || "Branch Manager", bg: "rgba(34,197,94,0.15)", color: "#4ade80" };

    return (
        <>
            <header className="aurora-header" style={{ justifyContent: "space-between", position: "relative" }}>
                {/* Left: User context */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
                    <span style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--aurora-text-muted, #94a3b8)",
                    }}>
                        {isOwner ? "All Branches" : user?.branch_name}
                    </span>
                    <span style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background: roleBadge.bg,
                        color: roleBadge.color,
                        letterSpacing: "0.3px",
                    }}>
                        {roleBadge.label}
                    </span>
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
                                gap: 8,
                                height: 38,
                                borderRadius: 20,
                                paddingLeft: 4,
                                paddingRight: 12,
                                backgroundColor: "var(--bg-hover)",
                                color: "var(--text-primary)",
                                transition: "background 0.2s",
                            }}
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--border-default)"}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                        >
                            <div style={{
                                width: 30,
                                height: 30,
                                borderRadius: "50%",
                                background: isOwner
                                    ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                                    : "linear-gradient(135deg, #22c55e, #16a34a)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 700,
                                color: "#fff",
                            }}>
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--aurora-text-primary, #f1f5f9)" }}>
                                {user?.name || "User"}
                            </span>
                        </button>

                        {showProfileMenu && (
                            <div
                                className="aurora-opaque-box aurora-animate-fade-in"
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: 0,
                                    marginTop: 8,
                                    width: 220,
                                    borderRadius: "var(--radius-lg)",
                                    overflow: "hidden",
                                    zIndex: 9999,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* User info header */}
                                <div style={{
                                    padding: "16px 18px",
                                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                                }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                                        {user?.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                                        @{user?.username}
                                    </div>
                                    <span style={{
                                        display: "inline-block",
                                        marginTop: 8,
                                        padding: "2px 8px",
                                        borderRadius: 12,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        background: "rgba(255,255,255,0.1)",
                                        color: "#fff",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.5px",
                                    }}>
                                        {user?.role}
                                    </span>
                                </div>

                                {[
                                    {
                                        label: "Change Password",
                                        icon: "lock",
                                        danger: false,
                                        action: () => {
                                            setShowProfileMenu(false);
                                            setShowPasswordModal(true);
                                        },
                                    },
                                    {
                                        label: "Logout",
                                        icon: "log-out",
                                        danger: true,
                                        action: logout,
                                    },
                                ].map((item, i) => (
                                    <button
                                        key={item.label}
                                        onClick={item.action}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 12,
                                            width: "100%",
                                            padding: "12px 18px",
                                            background: "none",
                                            border: "none",
                                            borderBottom: i < 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                                            color: item.danger ? "#f87171" : "rgba(255,255,255,0.8)",
                                            fontSize: 13,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                            e.currentTarget.style.color = "#fff";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "none";
                                            e.currentTarget.style.color = item.danger ? "#f87171" : "rgba(255,255,255,0.8)";
                                        }}
                                    >
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

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10000,
                    }}
                    onClick={() => setShowPasswordModal(false)}
                >
                    <div
                        className="aurora-opaque-box aurora-animate-fade-in"
                        style={{
                            width: 380,
                            padding: "28px 24px",
                            borderRadius: "var(--radius-xl)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--aurora-text-primary, #f1f5f9)" }}>
                            Change Password
                        </h3>

                        {pwdSuccess ? (
                            <div style={{ marginTop: 20, padding: 16, borderRadius: 8, background: "rgba(34,197,94,0.12)", color: "#4ade80", fontSize: 14, fontWeight: 500, textAlign: "center" }}>
                                Password updated successfully!
                            </div>
                        ) : (
                            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                                {pwdError && (
                                    <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontSize: 12 }}>
                                        {pwdError}
                                    </div>
                                )}
                                {["Current Password", "New Password", "Confirm New Password"].map((label, idx) => {
                                    const val = [pwdCurrent, pwdNew, pwdConfirm][idx];
                                    const setter = [setPwdCurrent, setPwdNew, setPwdConfirm][idx];
                                    return (
                                        <div key={label}>
                                            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--aurora-text-muted, #94a3b8)", marginBottom: 4 }}>
                                                {label}
                                            </label>
                                            <input
                                                type="password"
                                                value={val}
                                                onChange={(e) => setter(e.target.value)}
                                                style={{
                                                    width: "100%",
                                                    padding: "9px 12px",
                                                    borderRadius: 6,
                                                    border: "1px solid var(--aurora-border, rgba(255,255,255,0.1))",
                                                    background: "var(--aurora-bg-primary, #0a0f1a)",
                                                    color: "var(--aurora-text-primary, #f1f5f9)",
                                                    fontSize: 13,
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                                    <button
                                        onClick={() => setShowPasswordModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: "10px 0",
                                            borderRadius: 6,
                                            border: "1px solid var(--aurora-border, rgba(255,255,255,0.1))",
                                            background: "transparent",
                                            color: "var(--aurora-text-muted, #94a3b8)",
                                            fontSize: 13,
                                            fontWeight: 500,
                                            cursor: "pointer",
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={pwdLoading}
                                        style={{
                                            flex: 1,
                                            padding: "10px 0",
                                            borderRadius: 6,
                                            border: "none",
                                            background: "var(--aurora-accent, #6366f1)",
                                            color: "#fff",
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: pwdLoading ? "not-allowed" : "pointer",
                                        }}
                                    >
                                        {pwdLoading ? "Updating..." : "Update Password"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
