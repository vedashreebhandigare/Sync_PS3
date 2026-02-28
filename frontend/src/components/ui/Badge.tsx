import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color: string;
  bg: string;
}

export default function Badge({ children, color, bg }: BadgeProps) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: "var(--radius-full)",
        background: bg,
        color,
        fontFamily: "var(--font-primary)",
        letterSpacing: 0.4,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {children}
    </span>
  );
}
