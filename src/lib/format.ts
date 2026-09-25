export function money(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not defined";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

export function num(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}

export function pct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "Not defined";
  return `${value.toFixed(1)}%`;
}
