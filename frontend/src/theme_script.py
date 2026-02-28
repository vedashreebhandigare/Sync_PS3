import sys

file_path = r'c:\Users\PRANAY\OneDrive\Documents\Hackx_3.0\Sync_PS3\frontend\src\components\aurora\CalendarPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '"#fbbf24"': '"#d97706"',
    '"#22c55e"': '"#16a34a"',
    '"#ef4444"': '"#dc2626"',
    '"#818cf8"': '"#4f46e5"',
    'background: "#1e293b"': 'background: "#ffffff"',
    'border: "1px solid rgba(255,255,255,0.1)"': 'border: "1px solid rgba(0,0,0,0.1)"',
    'boxShadow: "0 8px 32px rgba(0,0,0,0.5)"': 'boxShadow: "0 8px 32px rgba(0,0,0,0.1)"',
    'color: "#e2e8f0"': 'color: "#0f172a"',
    'color: "#cbd5e1"': 'color: "#334155"',
    'borderBottom: "1px solid rgba(255,255,255,0.06)"': 'borderBottom: "1px solid rgba(0,0,0,0.06)"',
    'borderRight: di < 6 ? "1px solid rgba(255,255,255,0.04)" : "none"': 'borderRight: di < 6 ? "1px solid rgba(0,0,0,0.04)" : "none"',
    'borderBottom: "1px solid rgba(255,255,255,0.04)"': 'borderBottom: "1px solid rgba(0,0,0,0.04)"',
    'background: "rgba(0,0,0,0.15)"': 'background: "rgba(0,0,0,0.02)"',
    'borderRight: "1px solid rgba(255,255,255,0.04)"': 'borderRight: "1px solid rgba(0,0,0,0.04)"',
    'color: today ? "#22d3a7" : "#94a3b8"': 'color: today ? "#059669" : "#64748b"',
    'color: today ? "#22d3a7" : "#e2e8f0"': 'color: today ? "#059669" : "#0f172a"',
    'background: "#1a2332"': 'background: "#ffffff"',
    'background: "#111827"': 'background: "#f8fafc"',
    'border: "1px solid rgba(255,255,255,0.07)"': 'border: "1px solid #e2e8f0"',
    'color: view === opt.key ? "#22d3a7" : "#94a3b8"': 'color: view === opt.key ? "#059669" : "#64748b"',
    'background: "rgba(255,255,255,0.04)"': 'background: "#ffffff"',
    'border: "1px solid rgba(255,255,255,0.08)"': 'border: "1px solid #e2e8f0"',
    'color: "#94a3b8"': 'color: "#475569"',
    'border: `1px solid ${colors.border}`': 'border: `1px solid ${colors.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)"',
    'border: `1px solid ${FOLLOW_UP_STYLE.border}`': 'border: `1px solid ${FOLLOW_UP_STYLE.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.05)"',
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
