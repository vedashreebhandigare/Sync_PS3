import { useState } from "react";
import type { Remark } from "../../types";
import { Button, SectionLabel } from "../ui";
import { STAGES } from "../../constants";
import { formatDate } from "../../utils";

interface RemarksStackProps {
  remarks: Remark[];
  onAddRemark: (text: string) => void;
}

export default function RemarksStack({
  remarks,
  onAddRemark,
}: RemarksStackProps): JSX.Element {
  const [text, setText] = useState<string>("");

  const handleAdd = (): void => {
    if (!text.trim()) return;
    onAddRemark(text.trim());
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleAdd();
  };

  const reversedRemarks = [...remarks].reverse();

  return (
    <div>
      <SectionLabel>Remarks Timeline</SectionLabel>

      {/* Add remark */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <input
          placeholder="Add a remark..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1.5px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            fontSize: 12.5,
            fontFamily: "var(--font-primary)",
            outline: "none",
          }}
        />
        <Button variant="primary" style={{ padding: "8px 14px" }} onClick={handleAdd}>
          Add
        </Button>
      </div>

      {/* Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {reversedRemarks.map((remark, idx) => {
          const stg = STAGES.find((s) => s.id === remark.stage);
          return (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: 10,
                padding: "8px 0",
                borderBottom:
                  idx < reversedRemarks.length - 1
                    ? "1px solid var(--border-light)"
                    : "none",
              }}
            >
              {/* Color bar */}
              <div
                style={{
                  width: 3,
                  borderRadius: 3,
                  background: stg?.color ?? "var(--border-default)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-primary)",
                    lineHeight: 1.5,
                  }}
                >
                  {remark.text}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-primary)",
                    marginTop: 2,
                  }}
                >
                  {remark.author} · {formatDate(remark.date)} ·{" "}
                  <span style={{ color: stg?.color }}>{stg?.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
