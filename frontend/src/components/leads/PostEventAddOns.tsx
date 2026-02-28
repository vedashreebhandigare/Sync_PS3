import { useState } from "react";
import type { AddOn, AddOnInput } from "../../types";
import { Button, SectionLabel, PlusIcon, TrashIcon } from "../ui";
import { currency } from "../../utils";

interface PostEventAddOnsProps {
  addOns: AddOn[];
  onSave: (addOns: AddOnInput[]) => void;
}

const inputStyle: React.CSSProperties = {
  padding: "7px 10px",
  border: "1.5px solid var(--border-default)",
  borderRadius: 7,
  fontSize: 12.5,
  fontFamily: "var(--font-primary)",
  outline: "none",
  background: "var(--bg-input)",
  color: "var(--text-primary)",
};

export default function PostEventAddOns({ addOns, onSave }: PostEventAddOnsProps): JSX.Element {
  const [newDesc, setNewDesc] = useState("");
  const [newCost, setNewCost] = useState("");

  const toInputs = (items: AddOn[]): AddOnInput[] => items.map((a) => ({ desc: a.desc, cost: a.cost }));

  const addItem = (): void => {
    if (!newDesc) return;
    onSave([...toInputs(addOns), { desc: newDesc, cost: Number(newCost) || 0 }]);
    setNewDesc("");
    setNewCost("");
  };

  const removeItem = (id: string): void => { onSave(toInputs(addOns.filter((a) => a.id !== id))); };

  const total = addOns.reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <div>
      <SectionLabel>Post-Event Add-ons / Additional Costs</SectionLabel>

      {addOns.map((addon) => (
        <div key={addon.id} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center", padding: "6px 8px", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)" }}>
          <span style={{ flex: 1, fontSize: 12.5, fontFamily: "var(--font-primary)", color: "var(--text-primary)" }}>{addon.desc}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, fontFamily: "var(--font-primary)", color: "var(--text-primary)" }}>{currency(addon.cost)}</span>
          <button onClick={() => removeItem(addon.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", display: "flex" }}>
            <TrashIcon />
          </button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        <input placeholder="Description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
        <input type="number" placeholder="₹ Cost" value={newCost} onChange={(e) => setNewCost(e.target.value)} style={{ ...inputStyle, width: 90 }} />
        <Button variant="secondary" onClick={addItem} style={{ fontSize: 12 }}>
          <PlusIcon size={14} /> Add
        </Button>
      </div>

      {addOns.length > 0 && (
        <div style={{ marginTop: 10, padding: "8px 10px", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", textAlign: "right", fontFamily: "var(--font-primary)" }}>
          Additional Total: {currency(total)}
        </div>
      )}
    </div>
  );
}
