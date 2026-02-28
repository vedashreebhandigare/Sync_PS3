import { SectionLabel } from "../ui";

interface FeedbackSectionProps {
  positives: string;
  negatives: string;
  onChangePositives: (val: string) => void;
  onChangeNegatives: (val: string) => void;
}

export default function FeedbackSection({
  positives,
  negatives,
  onChangePositives,
  onChangeNegatives,
}: FeedbackSectionProps): JSX.Element {
  return (
    <div>
      <SectionLabel>Client Feedback</SectionLabel>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Positives */}
        <div>
          <label
            style={{
              fontSize: 11,
              color: "var(--success)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 4,
              fontFamily: "var(--font-primary)",
            }}
          >
            👍 Positives
          </label>
          <textarea
            value={positives}
            onChange={(e) => onChangePositives(e.target.value)}
            placeholder="What went well..."
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1.5px solid var(--success-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12.5,
              fontFamily: "var(--font-primary)",
              outline: "none",
              resize: "vertical",
              minHeight: 60,
              background: "var(--success-bg)",
            }}
          />
        </div>

        {/* Negatives */}
        <div>
          <label
            style={{
              fontSize: 11,
              color: "var(--danger)",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 4,
              fontFamily: "var(--font-primary)",
            }}
          >
            👎 Negatives
          </label>
          <textarea
            value={negatives}
            onChange={(e) => onChangeNegatives(e.target.value)}
            placeholder="Areas for improvement..."
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1.5px solid var(--danger-border)",
              borderRadius: "var(--radius-md)",
              fontSize: 12.5,
              fontFamily: "var(--font-primary)",
              outline: "none",
              resize: "vertical",
              minHeight: 60,
              background: "var(--danger-bg)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
