// ============================================
// ID GENERATION
// ============================================

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

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

const TODAY = new Date("2026-02-28");

export function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - TODAY.getTime()) / 86_400_000
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
