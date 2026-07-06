// Numbers coming from these sheets use "," as a thousands separator and no
// decimals (CLP has no cents), e.g. "1,620,678" or "-43,401,092".
export function parseCLPNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return value;
  const cleaned = value.replace(/[",]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function parsePercent(value: string | number | undefined | null): number {
  if (value === undefined || value === null || value === "") return 0;
  // Live Sheets API values come back as raw fractions (0.4 = 40%); the CSV
  // export we use for local fallback comes back pre-formatted as "40.00%".
  if (typeof value === "number") return value * 100;
  const cleaned = value.replace(/[%,]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function formatCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}
