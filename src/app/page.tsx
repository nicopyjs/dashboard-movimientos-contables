import Link from "next/link";
import { getDashboardData } from "@/lib/getDashboardData";
import { filterPnlRows, summarizeByArea, summarizeByMonth } from "@/lib/pnl";
import {
  filterMovimientos,
  sortMovementsDesc,
  paginateMovements,
  getTopCentrosByActivity,
  AREA_OPTIONS,
} from "@/lib/movimientos";
import { KpiCard } from "@/components/KpiCard";
import { TrendChart } from "@/components/TrendChart";
import { AreaBarChart } from "@/components/AreaBarChart";
import { IngresosDonutChart } from "@/components/IngresosDonutChart";
import { MargenTrendChart } from "@/components/MargenTrendChart";
import { CumulativeResultChart } from "@/components/CumulativeResultChart";
import { RecentMovementsTable } from "@/components/RecentMovementsTable";
import { TopCentrosTable } from "@/components/TopCentrosTable";
import { RefreshButton } from "@/components/RefreshButton";
import { Filters } from "@/components/Filters";
import { ToggleFullHistory } from "@/components/ToggleFullHistory";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

type SearchParams = {
  year?: string;
  month?: string;
  area?: string;
  centro?: string;
  full?: string;
  page?: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const data = await getDashboardData();
  const { year, month, area, centro, full, page } = await searchParams;

  const years = [...new Set(data.pnlRows.map((r) => r.year))].sort((a, b) => a - b);
  const latestYear = years[years.length - 1] ?? new Date().getFullYear();
  const selectedYear = Number(year) || latestYear;
  const selectedMonth = Number(month) || 0;
  const selectedArea = area ?? "";
  const selectedCentro = centro ?? "";
  const showFullHistory = full === "1";

  const pnlForKpi = filterPnlRows(data.pnlRows, {
    year: selectedYear,
    month: selectedMonth || undefined,
    area: selectedArea || undefined,
  });
  const pnlForTrend = filterPnlRows(data.pnlRows, {
    year: showFullHistory ? undefined : selectedYear,
    month: selectedMonth || undefined,
    area: selectedArea || undefined,
  });

  const ingresos = pnlForKpi.reduce((sum, r) => sum + r.ingresos, 0);
  const gastos = pnlForKpi.reduce((sum, r) => sum + r.gastos, 0);
  const resultado = pnlForKpi.reduce((sum, r) => sum + r.resultado, 0);
  const margenPct = ingresos !== 0 ? (resultado / ingresos) * 100 : 0;

  const monthly = summarizeByMonth(pnlForTrend);
  const areaData = summarizeByArea(pnlForKpi);

  const movimientosForYear = data.movimientos.filter((m) => m.fiscalYear === String(selectedYear));
  const movFiltered = filterMovimientos(movimientosForYear, {
    month: selectedMonth || undefined,
    area: selectedArea || undefined,
    businessCenterId: selectedCentro || undefined,
  });
  const sortedMovements = sortMovementsDesc(movFiltered);
  const movementsPage = paginateMovements(sortedMovements, Number(page) || 1);
  const topCentros = getTopCentrosByActivity(movFiltered, 10);
  const hasDetailForYear = movimientosForYear.length > 0;

  return (
    <div className="min-h-full flex-1 bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Movimientos Contables — Neb Chile
            </h1>
            <p className="text-sm text-slate-500">
              {data.isLiveMode ? "Datos en vivo desde Google Sheets" : "Datos de muestra (modo local)"}
              {" · actualizado "}
              {new Date(data.fetchedAt).toLocaleString("es-CL")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/estado-resultado"
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              Estado de Resultado →
            </Link>
            <RefreshButton />
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-8">
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Filtros
            </h2>
            <Filters
              years={years}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              areaOptions={AREA_OPTIONS}
              selectedArea={selectedArea}
              centroOptions={data.centroOptions}
              selectedCentro={selectedCentro}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Ingresos" value={ingresos} tone="positive" />
            <KpiCard label="Gastos" value={gastos} tone="negative" />
            <KpiCard label="Resultado" value={resultado} tone={resultado >= 0 ? "positive" : "negative"} />
            <KpiCard
              label="Margen"
              value={margenPct}
              tone={margenPct >= 0 ? "positive" : "negative"}
              formatAsPercent
            />
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Evolución mensual
            </h2>
            <ToggleFullHistory active={showFullHistory} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <TrendChart data={monthly} />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Margen mensual
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <MargenTrendChart data={monthly} />
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Resultado acumulado
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <CumulativeResultChart data={monthly} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ingresos vs. Gastos por área
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <AreaBarChart data={areaData} />
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Participación de ingresos por área
            </h2>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <IngresosDonutChart data={areaData} />
            </div>
          </div>
        </section>

        {!hasDetailForYear && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
            El detalle de movimientos (tablas de abajo) solo está disponible para {latestYear};
            para años anteriores solo se muestra el resumen agregado de arriba.
          </p>
        )}

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Centros de negocio más activos ({movFiltered.length.toLocaleString("es-CL")}{" "}
            movimientos)
          </h2>
          <TopCentrosTable rows={topCentros} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Movimientos contables
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <RecentMovementsTable rows={movementsPage.rows} />
            <Pagination
              page={movementsPage.page}
              totalPages={movementsPage.totalPages}
              totalCount={movementsPage.totalCount}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
