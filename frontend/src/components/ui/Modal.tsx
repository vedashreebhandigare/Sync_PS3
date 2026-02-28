import type { ReactNode } from "react";
import { XIcon } from "./Icons";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export default function Modal({
  title,
  onClose,
  children,
  footer,
  width = 520,
}: ModalProps): JSX.Element {
  return (
    <>
      {/* Overlay */}
      <div
        className="animate-fade-in"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 300,
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="animate-fade-up"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width,
          maxHeight: "85vh",
          background: "#fff",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          zIndex: 310,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              fontFamily: "var(--font-primary)",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg-app)",
              border: "none",
              borderRadius: "var(--radius-md)",
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
            }}
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 24px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: "14px 24px",
              borderTop: "1px solid var(--border-default)",
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
