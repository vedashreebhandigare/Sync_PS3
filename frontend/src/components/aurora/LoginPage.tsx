import { useState, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage(): JSX.Element {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--aurora-bg-primary, #0a0f1a)",
        fontFamily: "var(--aurora-font, 'Inter', sans-serif)",
      }}
    >
      <div
        style={{
          width: 400,
          padding: "40px 36px",
          background: "var(--aurora-bg-card, #111827)",
          borderRadius: 16,
          border: "1px solid var(--aurora-border, rgba(255,255,255,0.08))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <svg viewBox="0 0 28 28" fill="none" width="32" height="32">
              <path
                d="M14 2L6 15h6l-2 11 10-14h-6l4-10z"
                fill="var(--aurora-accent, #6366f1)"
                stroke="var(--aurora-accent, #6366f1)"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "var(--aurora-text-primary, #f1f5f9)",
                letterSpacing: "-0.5px",
              }}
            >
              aurora
            </span>
          </div>
          <p
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "var(--aurora-text-muted, #64748b)",
            }}
          >
            Banquet Management System
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 8,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#ef4444",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--aurora-text-muted, #94a3b8)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoFocus
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 8,
                border: "1px solid var(--aurora-border, rgba(255,255,255,0.1))",
                background: "var(--aurora-bg-primary, #0a0f1a)",
                color: "var(--aurora-text-primary, #f1f5f9)",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--aurora-accent, #6366f1)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--aurora-border, rgba(255,255,255,0.1))")}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--aurora-text-muted, #94a3b8)",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 8,
                border: "1px solid var(--aurora-border, rgba(255,255,255,0.1))",
                background: "var(--aurora-bg-primary, #0a0f1a)",
                color: "var(--aurora-text-primary, #f1f5f9)",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--aurora-accent, #6366f1)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--aurora-border, rgba(255,255,255,0.1))")}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !username || !password}
            style={{
              marginTop: 6,
              padding: "12px 0",
              borderRadius: 8,
              border: "none",
              background: loading || !username || !password
                ? "rgba(99,102,241,0.4)"
                : "var(--aurora-accent, #6366f1)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading || !username || !password ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              letterSpacing: "0.3px",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Demo credentials hint */}
        <div
          style={{
            marginTop: 28,
            padding: "14px 16px",
            borderRadius: 8,
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.12)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--aurora-accent, #6366f1)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Demo Credentials
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { label: "Owner", user: "owner", pass: "owner123" },
              { label: "Andheri Mgr", user: "andheri.mgr", pass: "andheri123" },
              { label: "Thane Mgr", user: "thane.mgr", pass: "thane123" },
              { label: "Powai Mgr", user: "powai.mgr", pass: "powai123" },
              { label: "Panvel Mgr", user: "panvel.mgr", pass: "panvel123" },
            ].map((cred) => (
              <div
                key={cred.user}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 12,
                  color: "var(--aurora-text-muted, #94a3b8)",
                }}
              >
                <span>{cred.label}</span>
                <button
                  onClick={() => {
                    setUsername(cred.user);
                    setPassword(cred.pass);
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--aurora-accent, #6366f1)",
                    fontSize: 11,
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: "2px 4px",
                  }}
                >
                  {cred.user} / {cred.pass}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
