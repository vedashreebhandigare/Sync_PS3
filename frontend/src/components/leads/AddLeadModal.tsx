import { useState } from "react";
import type { NewLeadForm, EventType, LeadSource } from "../../types";
import { Button, Modal } from "../ui";
import { BRANCHES, EVENT_TYPES, LEAD_SOURCES } from "../../constants";

interface AddLeadModalProps {
  onClose: () => void;
  onAdd: (form: NewLeadForm) => void;
}

interface FieldConfig {
  key: keyof NewLeadForm;
  label: string;
  type: "text" | "email" | "date" | "number" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  fullWidth?: boolean;
}

const FIELDS: FieldConfig[] = [
  { key: "name", label: "Full Name", type: "text", required: true, fullWidth: true },
  { key: "phone", label: "Phone", type: "text", required: true },
  { key: "email", label: "Email", type: "email" },
  { key: "eventType", label: "Event Type", type: "select", options: EVENT_TYPES },
  { key: "eventDate", label: "Event Date", type: "date" },
  { key: "guestCount", label: "Guest Count", type: "number" },
  { key: "budget", label: "Budget Range", type: "text", placeholder: "e.g. ₹5L - ₹8L" },
  { key: "branch", label: "Branch", type: "select", options: BRANCHES },
  { key: "source", label: "Source", type: "select", options: LEAD_SOURCES },
  { key: "assignedTo", label: "Assigned To", type: "text" },
];

const INITIAL_FORM: NewLeadForm = {
  name: "",
  phone: "",
  email: "",
  eventType: EVENT_TYPES[0],
  eventDate: "",
  guestCount: "",
  budget: "",
  branch: BRANCHES[0],
  source: LEAD_SOURCES[0],
  assignedTo: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1.5px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  fontSize: 13,
  fontFamily: "var(--font-primary)",
  outline: "none",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-secondary)",
  fontFamily: "var(--font-primary)",
  marginBottom: 4,
  display: "block",
};

export default function AddLeadModal({
  onClose,
  onAdd,
}: AddLeadModalProps): JSX.Element {
  const [form, setForm] = useState<NewLeadForm>(INITIAL_FORM);

  const set = (key: keyof NewLeadForm, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (): void => {
    if (!form.name || !form.phone) return;
    onAdd(form);
    onClose();
  };

  return (
    <Modal
      title="Add New Lead"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Add Lead
          </Button>
        </>
      }
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {FIELDS.map((field) => (
          <div
            key={field.key}
            style={field.fullWidth ? { gridColumn: "1 / -1" } : {}}
          >
            <label style={labelStyle}>
              {field.label}
              {field.required && " *"}
            </label>

            {field.type === "select" ? (
              <select
                value={form[field.key]}
                onChange={(e) =>
                  set(field.key, e.target.value as EventType | LeadSource)
                }
                style={inputStyle}
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                placeholder={field.placeholder ?? field.label}
                value={form[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                style={inputStyle}
              />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
