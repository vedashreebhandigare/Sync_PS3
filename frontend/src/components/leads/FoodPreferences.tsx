import { SectionLabel } from "../ui";

interface FoodPreferencesProps {
  foodPreferences: string;
  allergies: string;
  onChangePreferences: (val: string) => void;
  onChangeAllergies: (val: string) => void;
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1.5px solid var(--border-default)",
  borderRadius: "var(--radius-md)",
  fontSize: 12.5,
  fontFamily: "var(--font-primary)",
  outline: "none",
  resize: "vertical",
  minHeight: 40,
  background: "var(--bg-input)",
  color: "var(--text-primary)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--text-muted)",
  fontFamily: "var(--font-primary)",
  display: "block",
  marginBottom: 3,
};

export default function FoodPreferences({
  foodPreferences,
  allergies,
  onChangePreferences,
  onChangeAllergies,
}: FoodPreferencesProps) {
  return (
    <div>
      <SectionLabel>Food Preferences & Allergies</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <label style={labelStyle}>Food Preferences</label>
          <textarea value={foodPreferences} onChange={(e) => onChangePreferences(e.target.value)} placeholder="e.g. Vegetarian, North Indian, Chinese..." style={textareaStyle} />
        </div>
        <div>
          <label style={labelStyle}>Allergies / Dietary Restrictions</label>
          <textarea value={allergies} onChange={(e) => onChangeAllergies(e.target.value)} placeholder="e.g. No shellfish, nut allergy..." style={textareaStyle} />
        </div>
      </div>
    </div>
  );
}
