import { fetchSheetRows, type Row } from "./sheets";
import { SPREADSHEET_IDS, SHEET_TABS, AREA_LABELS } from "./constants";
import { parseCLPNumber, parsePercent } from "./parseNumber";

export type PnlRow = {
  area: string;
  areaLabel: string;
  year: number;
  month: number;
  yearMonth: string;
  ingresos: number;
  gastos: number;
  resultado: number;
  margenPct: number;
};

function toPnlRow(row: Row): PnlRow | null {
  const area = row["area"]?.trim();
  const year = Number(row["year"]);
  const month = Number(row["month"]);
  if (!area || !Number.isFinite(year) || !Number.isFinite(month)) return null;
  return {
    area,
    areaLabel: AREA_LABELS[area] ?? row["area_nombre"]?.trim() ?? area,
    year,
    month,
    yearMonth: `${year}-${String(month).padStart(2, "0")}`,
    ingresos: parseCLPNumber(row["ingresos"]),
    gastos: parseCLPNumber(row["gastos"]),
    resultado: parseCLPNumber(row["resultado"]),
    margenPct: parsePercent(row["margen_pct"]),
  };
}

export async function getPnlRows(): Promise<PnlRow[]> {
  const rows = await fetchSheetRows(SPREADSHEET_IDS.pnl, SHEET_TABS.pnl);
  return rows
    .map(toPnlRow)
    .filter((r): r is PnlRow => r !== null)
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
}

export type PnlFilters = {
  year?: number;
  month?: number;
  area?: string;
};

export function filterPnlRows(rows: PnlRow[], filters: PnlFilters): PnlRow[] {
  return rows.filter((r) => {
    if (filters.year && r.year !== filters.year) return false;
    if (filters.month && r.month !== filters.month) return false;
    if (filters.area && r.area !== filters.area) return false;
    return true;
  });
}

function margin(ingresos: number, resultado: number): number {
  return ingresos !== 0 ? (resultado / ingresos) * 100 : 0;
}

export type MonthlySummary = {
  yearMonth: string;
  year: number;
  month: number;
  ingresos: number;
  gastos: number;
  resultado: number;
  margenPct: number;
};

export function summarizeByMonth(rows: PnlRow[]): MonthlySummary[] {
  const map = new Map<string, MonthlySummary>();
  for (const row of rows) {
    const existing = map.get(row.yearMonth);
    if (existing) {
      existing.ingresos += row.ingresos;
      existing.gastos += row.gastos;
      existing.resultado += row.resultado;
    } else {
      map.set(row.yearMonth, {
        yearMonth: row.yearMonth,
        year: row.year,
        month: row.month,
        ingresos: row.ingresos,
        gastos: row.gastos,
        resultado: row.resultado,
        margenPct: 0,
      });
    }
  }
  const result = [...map.values()];
  for (const m of result) m.margenPct = margin(m.ingresos, m.resultado);
  return result.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));
}

export type AreaSummary = {
  area: string;
  areaLabel: string;
  ingresos: number;
  gastos: number;
  resultado: number;
  margenPct: number;
};

export function summarizeByArea(rows: PnlRow[]): AreaSummary[] {
  const map = new Map<string, AreaSummary>();
  for (const row of rows) {
    const existing = map.get(row.area);
    if (existing) {
      existing.ingresos += row.ingresos;
      existing.gastos += row.gastos;
      existing.resultado += row.resultado;
    } else {
      map.set(row.area, {
        area: row.area,
        areaLabel: row.areaLabel,
        ingresos: row.ingresos,
        gastos: row.gastos,
        resultado: row.resultado,
        margenPct: 0,
      });
    }
  }
  const result = [...map.values()];
  for (const a of result) a.margenPct = margin(a.ingresos, a.resultado);
  return result.sort((a, b) => b.resultado - a.resultado);
}
