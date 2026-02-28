import { SectionLabel } from "../ui";
import { currency } from "../../utils";

interface AdvancePaymentProps {
  totalCost: number;
  menuTotal: number;
  guestCount: number;
  advancePercent: number;
  advancePaid: number;
  onChangePercent: (val: number) => void;
  onChangePaid: (val: number) => void;
}

const inputStyle: React.CSSProperties = {
  padding: "6px 8px",
  border: "1.5px solid var(--border-default)",
  borderRadius: 7,
  fontSize: 13,
  fontFamily: "var(--font-primary)",
  outline: "none",
};

export default function AdvancePayment({
  totalCost,
  menuTotal,
  guestCount,
  advancePercent,
  advancePaid,
  onChangePercent,
  onChangePaid,
}: AdvancePaymentProps): JSX.Element {
  const estimatedTotal = totalCost || menuTotal * guestCount;
  const requiredAdvance = Math.round((estimatedTotal * advancePercent) / 100);

  return (
    <div>
      <SectionLabel>Advance Payment</SectionLabel>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <div>
          <label
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 3,
              fontFamily: "var(--font-primary)",
            }}
          >
            Total Estimated Cost
          </label>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text-primary)",
              fontFamily: "var(--font-primary)",
            }}
          >
            {currency(estimatedTotal)}
          </div>
        </div>

        <div>
          <label
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              display: "block",
              marginBottom: 3,
              fontFamily: "var(--font-primary)",
            }}
          >
            Advance % (configurable)
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="number"
              value={advancePercent}
              onChange={(e) => onChangePercent(Number(e.target.value))}
              style={{ ...inputStyle, width: 60, textAlign: "center" }}
            />
            <span
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-primary)",
              }}
            >
              %
            </span>
          </div>
        </div>
      </div>

      {/* Required vs Paid comparison */}
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-md)",
          padding: 12,
          border: "1px solid var(--border-default)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "var(--font-primary)",
            }}
          >
            Required Advance
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--accent)",
              fontFamily: "var(--font-primary)",
            }}
          >
            {currency(requiredAdvance)}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "var(--font-primary)",
            }}
          >
            Paid
          </div>
          <input
            type="number"
            value={advancePaid || ""}
            onChange={(e) => onChangePaid(Number(e.target.value))}
            style={{
              ...inputStyle,
              width: 100,
              textAlign: "right",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--success)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
