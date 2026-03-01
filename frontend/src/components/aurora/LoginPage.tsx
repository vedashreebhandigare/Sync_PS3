import { useState, type FormEvent } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
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
        fontFamily: "var(--aurora-font, 'Inter', sans-serif)",
        background: "var(--aurora-bg-body, #111827)",
      }}
    >
      {/* Left side with background image and huge heading */}
      <div
        style={{
          flex: 1,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          /* User placeholder image, they said they will provide one later */
          backgroundImage: "url('https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=2670&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay to make text readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, rgba(16, 24, 39, 0.8), rgba(16, 24, 39, 0.4))",
          }}
        />

        {/* Content over image */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 40px" }}>
          <h1
            style={{
              fontSize: "4.5rem",
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              textShadow: "0 4px 24px rgba(0,0,0,0.5)"
            }}
          >
            Banquet<br />Management
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "1.2rem", marginTop: 24, fontWeight: 500, maxWidth: 500, marginInline: "auto" }}>
            The ultimate operating system for modern banquet halls to track leads, bookings, logistics, and more.
          </p>
        </div>
      </div>

      {/* Right side with Login form */}
      <div
        className="aurora-opaque-box"
        style={{
          width: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
          zIndex: 20,
          borderRadius: 0,
          border: "none",
        }}
      >
        <div style={{ width: "100%", maxWidth: 360 }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <svg viewBox="0 0 28 28" fill="none" width="36" height="36">
                <path
                  d="M14 2L6 15h6l-2 11 10-14h-6l4-10z"
                  fill="var(--aurora-accent, #22d3a7)"
                  stroke="var(--aurora-accent, #22d3a7)"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--aurora-text-primary, #f1f5f9)",
                  letterSpacing: "-0.5px",
                }}
              >
                Sync
              </span>
            </div>
            <p
              style={{
                marginTop: 8,
                fontSize: 14,
                color: "var(--aurora-text-muted, #64748b)",
              }}
            >
              Sign in to your account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 16px",
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
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--aurora-text-muted, #94a3b8)",
                  marginBottom: 8,
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
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--aurora-border, rgba(255,255,255,0.1))",
                  background: "var(--aurora-bg-input, #1a2332)",
                  color: "var(--aurora-text-primary, #f1f5f9)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--aurora-accent, #22d3a7)";
                  e.target.style.boxShadow = "var(--aurora-accent-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--aurora-border, rgba(255,255,255,0.1))";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--aurora-text-muted, #94a3b8)",
                  marginBottom: 8,
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
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "1px solid var(--aurora-border, rgba(255,255,255,0.1))",
                  background: "var(--aurora-bg-input, #1a2332)",
                  color: "var(--aurora-text-primary, #f1f5f9)",
                  fontSize: 14,
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--aurora-accent, #22d3a7)";
                  e.target.style.boxShadow = "var(--aurora-accent-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--aurora-border, rgba(255,255,255,0.1))";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !username || !password}
              style={{
                marginTop: 8,
                padding: "14px 0",
                borderRadius: 8,
                border: "none",
                background: loading || !username || !password
                  ? "var(--aurora-accent-dim, rgba(34, 211, 167, 0.15))"
                  : "var(--aurora-accent, #22d3a7)",
                color: loading || !username || !password ? "var(--aurora-text-muted)" : "#111827",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading || !username || !password ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          {/* Demo credentials hint */}
          <div
            style={{
              marginTop: 32,
              padding: "16px 20px",
              borderRadius: 8,
              background: "var(--aurora-accent-dim, rgba(34, 211, 167, 0.05))",
              border: "1px dashed var(--aurora-border, rgba(255,255,255,0.1))",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--aurora-text-secondary)",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                textAlign: "center"
              }}
            >
              Demo Credentials
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                    fontSize: 13,
                    color: "var(--aurora-text-muted, #94a3b8)",
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{cred.label}</span>
                  <button
                    onClick={() => {
                      setUsername(cred.user);
                      setPassword(cred.pass);
                      setError("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--aurora-accent, #22d3a7)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 4,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--aurora-accent-glow)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    {cred.user}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
