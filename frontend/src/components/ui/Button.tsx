import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ButtonVariant } from "../../types";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    boxShadow: "0 2px 8px #6d5cff33",
  },
  secondary: {
    background: "var(--bg-app)",
    color: "var(--text-primary)",
    border: "1.5px solid var(--border-default)",
  },
  danger: {
    background: "#fff",
    color: "var(--danger)",
    border: "1.5px solid var(--danger-border)",
  },
  success: {
    background: "var(--success)",
    color: "#fff",
    border: "none",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-secondary)",
    border: "none",
    padding: "8px 10px",
  },
};

export default function Button({
  variant = "primary",
  children,
  disabled,
  style,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: "var(--radius-md)",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "var(--font-primary)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all var(--transition-fast)",
        opacity: disabled ? 0.5 : 1,
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
