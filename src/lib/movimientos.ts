import { fetchSheetRows, type Row } from "./sheets";
import { SPREADSHEET_IDS, SHEET_TABS, AREA_LABELS } from "./constants";
import { parseCLPNumber } from "./parseNumber";
import { type CentrosMap, resolveCentroName } from "./centros";

export type AccountNature = "Activo" | "Pasivo" | "Ingreso" | "Gasto" | "Otro";

function natureFromAccountCode(accountCode: string): AccountNature {
  switch (accountCode[0]) {
    case "1":
      return "Activo";
    case "2":
      return "Pasivo";
    case "3":
      return "Ingreso";
    case "4":
      return "Gasto";
    default:
      return "Otro";
  }
}

export type MovementRow = {
  accountCode: string;
  debit: number;
  credit: number;
  comment: string;
  businessCenterId: string;
  voucherNumber: string;
  voucherType: string;
  fiscalYear: string;
  date: string; // yyyy-mm-dd
  entryDate: string;
  month: number; // 1-12, from `date`
  area: string; // first 3 chars of businessCenterId
  centroNombre: string;
  nature: AccountNature;
};

function toRawMovement(row: Row) {
  return {
    accountCode: row["accountCode"]?.trim() ?? "",
    debit: parseCLPNumber(row["debit"]),
    credit: parseCLPNumber(row["credit"]),
    comment: row["comment"]?.trim() ?? "",
    businessCenterId: row["bussinessCenterId"]?.trim() ?? "",
    voucherNumber: row["voucherNumber"]?.trim() ?? "",
    voucherType: row["voucherType"]?.trim() ?? "",
    fiscalYear: row["fiscalYear"]?.trim() ?? "",
    date: (row["date"] ?? "").slice(0, 10),
    entryDate: row["entryDate"] ?? "",
  };
}

/**
 * Only the first detail line of a voucher tends to carry `bussinessCenterId`
 * in this export; the rest of the lines in the same voucher are left blank.
 * Forward-fill from whichever line in the group does have it so every line
 * can be attributed to a business center.
 */
function fillBusinessCenters<T extends { voucherNumber: string; businessCenterId: string }>(
  rows: T[]
): T[] {
  const centerByVoucher = new Map<string, string>();
  for (const row of rows) {
    if (row.businessCenterId && !centerByVoucher.has(row.voucherNumber)) {
      centerByVoucher.set(row.voucherNumber, row.businessCenterId);
    }
  }
  return rows.map((row) =>
    row.businessCenterId
      ? row
      : { ...row, businessCenterId: centerByVoucher.get(row.voucherNumber) ?? "" }
  );
}

export async function getMovimientos2026(centros: CentrosMap): Promise<MovementRow[]> {
  const rows = await fetchSheetRows(SPREADSHEET_IDS.movimientos2026, SHEET_TABS.movimientos);
  const filled = fillBusinessCenters(rows.map(toRawMovement));

  return filled.map((r) => {
    const area = r.businessCenterId.slice(0, 3).toUpperCase();
    return {
      ...r,
      month: Number(r.date.slice(5, 7)) || 0,
      area,
      centroNombre: resolveCentroName(centros, r.businessCenterId),
      nature: natureFromAccountCode(r.accountCode),
    };
  });
}

export type MovementFilters = {
  month?: number; // 1-12
  area?: string;
  businessCenterId?: string;
};

export function filterMovimientos(rows: MovementRow[], filters: MovementFilters): MovementRow[] {
  return rows.filter((r) => {
    if (filters.month && r.month !== filters.month) return false;
    if (filters.area && r.area !== filters.area) return false;
    if (filters.businessCenterId && r.businessCenterId !== filters.businessCenterId) return false;
    return true;
  });
}

export function sortMovementsDesc(rows: MovementRow[]): MovementRow[] {
  return [...rows]
    .filter((r) => r.debit !== 0 || r.credit !== 0)
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate));
}

export const MOVEMENTS_PAGE_SIZE = 50;

export type MovementsPage = {
  rows: MovementRow[];
  page: number;
  totalPages: number;
  totalCount: number;
};

export function paginateMovements(
  sorted: MovementRow[],
  requestedPage: number,
  pageSize = MOVEMENTS_PAGE_SIZE
): MovementsPage {
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(Math.max(requestedPage || 1, 1), totalPages);
  const start = (page - 1) * pageSize;
  return { rows: sorted.slice(start, start + pageSize), page, totalPages, totalCount };
}

export type CentroActivity = {
  businessCenterId: string;
  centroNombre: string;
  movimientos: number;
  debitTotal: number; // suma de debit, solo cuentas de ingreso (3) y gasto (4)
  creditTotal: number; // suma de credit, solo cuentas de ingreso (3) y gasto (4)
  resultado: number; // (credit - debit) de cuentas de ingreso, menos (debit - credit) de cuentas de gasto
};

export function getTopCentrosByActivity(rows: MovementRow[], limit = 10): CentroActivity[] {
  type Accumulator = CentroActivity & { ingresoNeto: number; gastoNeto: number };
  const map = new Map<string, Accumulator>();
  for (const row of rows) {
    if (!row.businessCenterId) continue;
    const existing = map.get(row.businessCenterId) ?? {
      businessCenterId: row.businessCenterId,
      centroNombre: row.centroNombre,
      movimientos: 0,
      debitTotal: 0,
      creditTotal: 0,
      resultado: 0,
      ingresoNeto: 0,
      gastoNeto: 0,
    };
    existing.movimientos += 1;
    // Cuentas de ingreso (3xxx) tienen saldo natural acreedor: un haber es
    // una ganancia. Cuentas de gasto (4xxx) tienen saldo natural deudor: un
    // debe es un costo. Restar ambos netos da la utilidad del centro.
    if (row.nature === "Ingreso") {
      existing.debitTotal += row.debit;
      existing.creditTotal += row.credit;
      existing.ingresoNeto += row.credit - row.debit;
    } else if (row.nature === "Gasto") {
      existing.debitTotal += row.debit;
      existing.creditTotal += row.credit;
      existing.gastoNeto += row.debit - row.credit;
    }
    existing.resultado = existing.ingresoNeto - existing.gastoNeto;
    map.set(row.businessCenterId, existing);
  }
  return [...map.values()]
    .map(({ businessCenterId, centroNombre, movimientos, debitTotal, creditTotal, resultado }) => ({
      businessCenterId,
      centroNombre,
      movimientos,
      debitTotal,
      creditTotal,
      resultado,
    }))
    .sort((a, b) => b.debitTotal + b.creditTotal - (a.debitTotal + a.creditTotal))
    .slice(0, limit);
}

export type CentroOption = { id: string; label: string };

export function getCentroOptions(rows: MovementRow[]): CentroOption[] {
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (row.businessCenterId && !seen.has(row.businessCenterId)) {
      seen.set(row.businessCenterId, row.centroNombre);
    }
  }
  return [...seen.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export const AREA_OPTIONS = Object.entries(AREA_LABELS).map(([id, label]) => ({ id, label }));
