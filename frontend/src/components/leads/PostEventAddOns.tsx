import type { AddOn } from "../../types";
import { Button, SectionLabel, PlusIcon, TrashIcon } from "../ui";
import { currency, generateId } from "../../utils";

interface PostEventAddOnsProps {
  addOns: AddOn[];
  onUpdate: (addOns: AddOn[]) => void;
}

const inputStyle: React.CSSProperties = {
  padding: "7px 10px",
  border: "1.5px solid var(--border-default)",
  borderRadius: 7,
  fontSize: 12.5,
  fontFamily: "var(--font-primary)",
  outline: "none",
};

export default function PostEventAddOns({
  addOns,
  onUpdate,
}: PostEventAddOnsProps): JSX.Element {
  const addItem = (): void => {
    onUpdate([...addOns, { id: generateId(), desc: "", cost: 0 }]);
  };

  const updateItem = (id: string, field: keyof AddOn, value: string | number): void => {
    onUpdate(addOns.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeItem = (id: string): void => {
    onUpdate(addOns.filter((a) => a.id !== id));
  };

  const total = addOns.reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <div>
      <SectionLabel>Post-Event Add-ons / Additional Costs</SectionLabel>

      {addOns.map((addon) => (
        <div
          key={addon.id}
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 6,
            alignItems: "center",
          }}
        >
          <input
            placeholder="Description"
            value={addon.desc}
            onChange={(e) => updateItem(addon.id, "desc", e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="number"
            placeholder="₹ Cost"
            value={addon.cost || ""}
            onChange={(e) =>
              updateItem(addon.id, "cost", Number(e.target.value))
            }
            style={{ ...inputStyle, width: 90 }}
          />
          <button
            onClick={() => removeItem(addon.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--danger)",
              display: "flex",
            }}
          >
            <TrashIcon />
          </button>
        </div>
      ))}

      <Button
        variant="secondary"
        onClick={addItem}
        style={{ fontSize: 12, marginTop: 4 }}
      >
        <PlusIcon size={14} /> Add Cost Item
      </Button>

      {addOns.length > 0 && (
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            background: "#fff",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-default)",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text-primary)",
            textAlign: "right",
            fontFamily: "var(--font-primary)",
          }}
        >
          Additional Total: {currency(total)}
        </div>
      )}
    </div>
  );
}
