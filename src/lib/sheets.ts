import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import Papa from "papaparse";

export type Row = Record<string, string>;

const hasServiceAccount = Boolean(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY
);

const LOCAL_FALLBACK: Record<string, string> = {
  "1XCeMZRw6bU--3SeOFRI08J5eFxaFbvVflPWWaczufQc": "centros_negocios.csv",
  "1IGN_SaV7zKqwMRGc21N_avA-pyWtI4sY6IxnADbU9oU": "movimientos_2026.csv",
  "1b4QPLY0otfzhSkJ7QQscJALJu7DssHi9w1XCad2LI48": "pnl_data.csv",
};

async function readLocalCsv(spreadsheetId: string): Promise<Row[]> {
  const file = LOCAL_FALLBACK[spreadsheetId];
  if (!file) {
    // No local snapshot available (e.g. the full histórico file) — behave
    // as an empty sheet until real credentials are configured.
    return [];
  }
  const filePath = path.join(process.cwd(), "data", file);
  let csv: string;
  try {
    csv = await fs.readFile(filePath, "utf-8");
  } catch {
    // Local snapshot not present (e.g. deployed environment without
    // credentials configured yet) — degrade to empty instead of crashing.
    console.warn(`[sheets] no local fallback data at ${filePath}`);
    return [];
  }
  const { data } = Papa.parse<Row>(csv, { header: true, skipEmptyLines: true });
  return data;
}

let sheetsClientPromise: Promise<import("googleapis").sheets_v4.Sheets> | null = null;

async function getSheetsClient() {
  if (!sheetsClientPromise) {
    sheetsClientPromise = (async () => {
      const { google } = await import("googleapis");
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      });
      return google.sheets({ version: "v4", auth });
    })();
  }
  return sheetsClientPromise;
}

/** Fetches an entire tab as an array of header-keyed row objects. */
export async function fetchSheetRows(
  spreadsheetId: string,
  tabName: string
): Promise<Row[]> {
  if (!hasServiceAccount) {
    return readLocalCsv(spreadsheetId);
  }

  const sheets = await getSheetsClient();
  // A1 notation only needs single quotes around the sheet name when it
  // contains spaces or other special characters (e.g. "Hoja 1").
  const range = /[\s'!]/.test(tabName) ? `'${tabName.replace(/'/g, "''")}'` : tabName;
  // FORMATTED_VALUE (the API default) renders dates/numbers/percents as
  // display strings, matching what the CSV export gives us in local-dev
  // fallback mode. UNFORMATTED_VALUE would return date cells as raw Sheets
  // serial-day numbers instead of readable dates.
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    valueRenderOption: "FORMATTED_VALUE",
  });

  const values = res.data.values ?? [];
  if (values.length === 0) return [];

  const [header, ...rows] = values as (string | number)[][];
  return rows.map((row) => {
    const record: Row = {};
    header.forEach((key, i) => {
      const cell = row[i];
      record[String(key)] = cell === undefined || cell === null ? "" : String(cell);
    });
    return record;
  });
}

export const isLiveMode = hasServiceAccount;
