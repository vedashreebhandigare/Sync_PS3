import { useState } from "react";
import type { LeadCreateInput, EventType, LeadSource, Branch } from "../../types";
import { Button, Modal } from "../ui";
import { EVENT_TYPES, LEAD_SOURCES } from "../../constants";

interface AddLeadModalProps {
  branches: Branch[];
  onClose: () => void;
  onAdd: (data: LeadCreateInput) => void;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  event_type: EventType;
  event_date: string;
  guest_count: string;
  budget: string;
  branch: string;
  source: LeadSource;
  assigned_to: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1.5px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  fontSize: 13,
  fontFamily: "var(--font-primary)",
  outline: "none",
  background: "var(--bg-input)",
  color: "var(--text-primary)",
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
  branches,
  onClose,
  onAdd,
}: AddLeadModalProps): JSX.Element {
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    event_type: EVENT_TYPES[0],
    event_date: "",
    guest_count: "",
    budget: "",
    branch: branches[0]?.id ?? "",
    source: LEAD_SOURCES[0],
    assigned_to: "",
  });

  const set = (key: keyof FormState, value: string): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (): void => {
    if (!form.name || !form.event_type || !form.event_date || !form.branch) return;
    const payload: LeadCreateInput = {
      name: form.name,
      phone: form.phone || undefined,
      email: form.email || undefined,
      event_type: form.event_type,
      event_date: form.event_date,
      guest_count: Number(form.guest_count) || undefined,
      budget: form.budget || undefined,
      branch: form.branch,
      source: form.source,
      assigned_to: form.assigned_to || undefined,
    };
    onAdd(payload);
    onClose();
  };

  return (
    <Modal title="Add New Lead" onClose={onClose}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit}>Add Lead</Button>
      </>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Full Name *</label>
          <input placeholder="Full Name" value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Phone</label>
          <input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Event Type *</label>
          <select value={form.event_type} onChange={(e) => set("event_type", e.target.value)} style={inputStyle}>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Event Date *</label>
          <input type="date" value={form.event_date} onChange={(e) => set("event_date", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Guest Count</label>
          <input type="number" placeholder="Guest Count" value={form.guest_count} onChange={(e) => set("guest_count", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Budget</label>
          <input placeholder="e.g. ₹5L - ₹8L" value={form.budget} onChange={(e) => set("budget", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Branch *</label>
          <select value={form.branch} onChange={(e) => set("branch", e.target.value)} style={inputStyle}>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Source</label>
          <select value={form.source} onChange={(e) => set("source", e.target.value)} style={inputStyle}>
            {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Assigned To</label>
          <input placeholder="Assigned To" value={form.assigned_to} onChange={(e) => set("assigned_to", e.target.value)} style={inputStyle} />
        </div>
      </div>
    </Modal>
  );
}
