import { getCentrosMap } from "./centros";
import { getPnlRows } from "./pnl";
import { getMovimientos2026, getCentroOptions } from "./movimientos";
import { isLiveMode } from "./sheets";

async function loadDashboardData() {
  const centros = await getCentrosMap();
  const [pnlRows, movimientos] = await Promise.all([
    getPnlRows(),
    getMovimientos2026(centros),
  ]);

  return {
    isLiveMode,
    fetchedAt: new Date().toISOString(),
    pnlRows,
    movimientos,
    centroOptions: getCentroOptions(movimientos),
  };
}

export type DashboardData = Awaited<ReturnType<typeof loadDashboardData>>;

// The movimientos dataset (40k+ rows) is too large for Next's `unstable_cache`
// (2MB per-entry limit), so we keep a plain in-memory cache instead. It's
// per server instance, which is fine here: worst case a cold instance just
// refetches from Google Sheets once.
const REVALIDATE_MS = 10 * 60 * 1000;
let cached: { data: DashboardData; expiresAt: number } | null = null;
let inFlight: Promise<DashboardData> | null = null;

export async function getDashboardData(): Promise<DashboardData> {
  if (cached && Date.now() < cached.expiresAt) return cached.data;
  if (!inFlight) {
    inFlight = loadDashboardData().finally(() => {
      inFlight = null;
    });
  }
  const data = await inFlight;
  cached = { data, expiresAt: Date.now() + REVALIDATE_MS };
  return data;
}

export function invalidateDashboardData(): void {
  cached = null;
}
