import type { ReactNode } from "react";

// ============================================
// SectionLabel — uppercase header inside detail sections
// ============================================

interface SectionLabelProps {
  children: ReactNode;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 700,
        color: "var(--text-muted)",
        textTransform: "uppercase",
        letterSpacing: 1.2,
        marginBottom: 10,
        fontFamily: "var(--font-primary)",
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// InfoRow — label + value pair in a grid
// ============================================

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function InfoRow({
  label,
  value,
  highlight = false,
}: InfoRowProps) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginBottom: 2,
          fontFamily: "var(--font-primary)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: highlight ? "var(--danger)" : "var(--text-primary)",
          fontFamily: "var(--font-primary)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
