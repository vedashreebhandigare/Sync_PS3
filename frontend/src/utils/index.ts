// ============================================
// DATE FORMATTING
// ============================================

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / 86_400_000
  );
  return diff;
}

export function isUrgent(dateStr: string | null | undefined): boolean {
  const days = daysUntil(dateStr);
  return days !== null && days >= 0 && days <= 7;
}

// ============================================
// CURRENCY
// ============================================

export function currency(amount: number): string {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

// ============================================
// CLASSNAME HELPER
// ============================================

export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}

// ============================================
// COMMA-SEPARATED STRING HELPERS
// ============================================

/** Split backend comma-separated string to array, filtering empties */
export function csvToArray(str: string): string[] {
  if (!str) return [];
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

/** Join array back to comma-separated for backend */
export function arrayToCsv(arr: string[]): string {
  return arr.join(",");
}
