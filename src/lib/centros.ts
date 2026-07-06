import { fetchSheetRows, type Row } from "./sheets";
import { SPREADSHEET_IDS, SHEET_TABS, AREA_LABELS } from "./constants";

export type CentroInfo = {
  code: string;
  description: string;
  parentCode: string;
  area: string;
  areaLabel: string;
};

export type CentrosMap = Map<string, CentroInfo>;

function areaFromCode(code: string): string {
  return code.slice(0, 3).toUpperCase();
}

function toCentro(row: Row): CentroInfo | null {
  const code = row["Code"]?.trim();
  if (!code) return null;
  const area = areaFromCode(code);
  return {
    code,
    description: row["Description"]?.trim() || code,
    parentCode: row["Parent Code"]?.trim() || "",
    area,
    areaLabel: AREA_LABELS[area] ?? area,
  };
}

export async function getCentrosMap(): Promise<CentrosMap> {
  const rows = await fetchSheetRows(SPREADSHEET_IDS.centros, SHEET_TABS.centros);
  const map: CentrosMap = new Map();
  for (const row of rows) {
    const centro = toCentro(row);
    if (centro) map.set(centro.code, centro);
  }
  return map;
}

export function resolveCentroName(map: CentrosMap, businessCenterId: string): string {
  if (!businessCenterId) return "Sin centro asignado";
  return map.get(businessCenterId)?.description ?? businessCenterId;
}
