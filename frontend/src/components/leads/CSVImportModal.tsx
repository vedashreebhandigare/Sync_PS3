import { useState, useRef } from "react";
import type { CSVPreview, CSVRow } from "../../types";
import { Button, Modal } from "../ui";

interface CSVImportModalProps {
  onClose: () => void;
  onImport: (rows: CSVRow[]) => void;
}

export default function CSVImportModal({
  onClose,
  onImport,
}: CSVImportModalProps): JSX.Element {
  const [preview, setPreview] = useState<CSVPreview | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text !== "string") return;

      const lines = text.split("\n").filter((l) => l.trim());
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows: CSVRow[] = lines.slice(1).map((line) => {
        const vals = line.split(",");
        const obj: CSVRow = {};
        headers.forEach((h, i) => {
          obj[h] = vals[i]?.trim() ?? "";
        });
        return obj;
      });

      setPreview({
        headers,
        rows: rows.slice(0, 5),
        total: rows.length,
        allRows: rows,
      });
    };
    reader.readAsText(file);
  };

  const handleImport = (): void => {
    if (!preview) return;
    onImport(preview.allRows);
    onClose();
  };

  return (
    <Modal
      title="Import Leads from CSV"
      onClose={onClose}
      width={600}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!preview}
            onClick={handleImport}
          >
            Import {preview?.total ?? 0} Leads
          </Button>
        </>
      }
    >
      {!preview ? (
        /* Upload area */
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            border: "2px dashed var(--border-default)",
            borderRadius: "var(--radius-xl)",
            cursor: "pointer",
          }}
          onClick={() => fileRef.current?.click()}
        >
          <input
            type="file"
            ref={fileRef}
            accept=".csv"
            onChange={handleFile}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-primary)",
              fontFamily: "var(--font-primary)",
            }}
          >
            Click to upload CSV file
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily: "var(--font-primary)",
              marginTop: 4,
            }}
          >
            Expected columns: name, phone, email, eventType, eventDate,
            guestCount, budget, branch, source
          </div>
        </div>
      ) : (
        /* Preview table */
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--success)",
              fontFamily: "var(--font-primary)",
              marginBottom: 10,
            }}
          >
            ✓ Found {preview.total} leads — showing first 5 rows:
          </div>

          <div
            style={{
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              overflow: "auto",
              maxHeight: 200,
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 11,
                fontFamily: "var(--font-primary)",
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-app)" }}>
                  {preview.headers.map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "6px 8px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderTop: "1px solid var(--border-light)",
                    }}
                  >
                    {preview.headers.map((h) => (
                      <td
                        key={h}
                        style={{
                          padding: "6px 8px",
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}
