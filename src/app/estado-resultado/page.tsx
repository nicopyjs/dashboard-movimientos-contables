import Link from "next/link";
import { getDashboardData } from "@/lib/getDashboardData";
import { filterPnlRows, summarizeByArea, summarizeByMonth } from "@/lib/pnl";
import {
  filterMovimientos,
  sortMovementsDesc,
  paginateMovements,
  summarizeMovementsByArea,
  summarizeMovementsByMonth,
  AREA_OPTIONS,
} from "@/lib/movimientos";
import { KpiCard } from "@/components/KpiCard";
import { AreaBarChart } from "@/components/AreaBarChart";
import { RefreshButton } from "@/components/RefreshButton";
import { RecentMovementsTable } from "@/components/RecentMovementsTable";
import { Pagination } from "@/components/Pagination";
import { ExportExcelButton } from "@/components/ExportExcelButton";
import { Tabs, type EstadoResultadoTab, ESTADO_RESULTADO_TABS } from "@/components/estado-resultado/Tabs";
import { Filters } from "@/components/estado-resultado/Filters";
import { SingleMetricTrendChart } from "@/components/estado-resultado/SingleMetricTrendChart";
import { AreaShareDonutChart } from "@/components/estado-resultado/AreaShareDonutChart";
import { SortedAreaLineChart } from "@/components/estado-resultado/SortedAreaLineChart";
import { RankedAreaTable } from "@/components/estado-resultado/RankedAreaTable";
import { MonthlyAmountTable } from "@/components/estado-resultado/MonthlyAmountTable";
import { EstadoResultadoTable } from "@/components/estado-resultado/EstadoResultadoTable";

export const dynamic = "force-dynamic";

type SearchParams = {
  year?: string;
  month?: string;
  area?: string;
  centro?: string;
  tab?: string;
  page?: string;
};

export default async function EstadoResultadoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const data = await getDashboardData();
  const { year, month, area, centro, tab, page } = await searchParams;

  const years = [...new Set(data.pnlRows.map((r) => r.year))].sort((a, b) => a - b);
  const latestYear = years[years.length - 1] ?? new Date().getFullYear();
  // `year` absent = filter never touched yet, default to the latest year.
  // `year` present but empty = user explicitly cleared it, meaning "todos".
  const selectedYears =
    year === undefined
      ? [latestYear]
      : year
          .split(",")
          .map(Number)
          .filter((n) => Number.isFinite(n) && n > 0);
  const selectedMonths = month
    ? month
        .split(",")
        .map(Number)
        .filter((n) => Number.isFinite(n) && n > 0)
    : [];
  const selectedAreas = area ? area.split(",").filter(Boolean) : [];
  const selectedCentros = centro ? centro.split(",").filter(Boolean) : [];
  const activeTab: EstadoResultadoTab = ESTADO_RESULTADO_TABS.some((t) => t.id === tab)
    ? (tab as EstadoResultadoTab)
    : "ingresos";

  const pnlForPeriod = filterPnlRows(data.pnlRows, {
    years: selectedYears,
    months: selectedMonths,
    areas: selectedAreas,
  });
  const monthly = summarizeByMonth(pnlForPeriod);
  const areaData = summarizeByArea(pnlForPeriod);

  const ingresos = pnlForPeriod.reduce((sum, r) => sum + r.ingresos, 0);
  const gastos = pnlForPeriod.reduce((sum, r) => sum + r.gastos, 0);
  const resultado = pnlForPeriod.reduce((sum, r) => sum + r.resultado, 0);
  const margenPct = ingresos !== 0 ? (resultado / ingresos) * 100 : 0;

  const ingresosPorArea = [...areaData]
    .filter((a) => a.ingresos > 0)
    .sort((a, b) => b.ingresos - a.ingresos)
    .map((a) => ({ areaLabel: a.areaLabel, value: a.ingresos }));

  const movFiltered = filterMovimientos(data.movimientos, {
    years: selectedYears,
    months: selectedMonths,
    areas: selectedAreas,
    businessCenterIds: selectedCentros,
  });

  const ingresoMovements = sortMovementsDesc(movFiltered.filter((m) => m.nature === "Ingreso"));
  const ingresoMovementsPage = paginateMovements(ingresoMovements, Number(page) || 1);

  const gastoMovements = sortMovementsDesc(movFiltered.filter((m) => m.nature === "Gasto"));
  const gastoMovementsPage = paginateMovements(gastoMovements, Number(page) || 1);

  const allMovements = sortMovementsDesc(movFiltered);
  const allMovementsPage = paginateMovements(allMovements, Number(page) || 1);

  // The pnl_data sheet behind areaData/monthly has no centro column, so it
  // can't respond to the centro filter. "Detalle Ingresos"/"Detalle Egresos"
  // need to stay consistent with the movement list shown alongside them
  // (which does have centro), so their area/month breakdowns are computed
  // from movFiltered instead — this is also why their totals can differ
  // slightly from the "Ingresos"/"Egresos"/"Estado de Resultado" tabs, which
  // stay anchored to the official pnl_data aggregate.
  const movAreaSummary = summarizeMovementsByArea(movFiltered);
  const movMonthlySummary = summarizeMovementsByMonth(movFiltered);

  const ingresosPorAreaDetalle = [...movAreaSummary]
    .filter((a) => a.ingresos > 0)
    .sort((a, b) => b.ingresos - a.ingresos)
    .map((a) => ({ areaLabel: a.areaLabel, value: a.ingresos }));

  const gastosPorAreaDetalle = [...movAreaSummary]
    .filter((a) => a.gastos > 0)
    .sort((a, b) => b.gastos - a.gastos)
    .map((a) => ({ areaLabel: a.areaLabel, value: a.gastos }));

  function exportHref(nature: "Ingreso" | "Gasto", filenamePrefix: string) {
    const params = new URLSearchParams();
    if (selectedYears.length) params.set("year", selectedYears.join(","));
    if (selectedMonths.length) params.set("month", selectedMonths.join(","));
    if (selectedAreas.length) params.set("area", selectedAreas.join(","));
    if (selectedCentros.length) params.set("centro", selectedCentros.join(","));
    params.set("nature", nature);
    params.set("filename", `${filenamePrefix}_${selectedYears.join("-") || "todos"}`);
    return `/api/export/movimientos?${params.toString()}`;
  }

  return (
    <div className="min-h-full flex-1 bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Estado de Resultado — Neb Chile</h1>
            <p className="text-sm text-slate-500">
              Datos reales por área de negocio (sin comparación contra presupuesto por ahora)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              ← Volver al dashboard
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

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <Tabs active={activeTab} preserve={{ year, month, area, centro }} />
          <Filters
            years={years}
            selectedYears={selectedYears}
            selectedMonths={selectedMonths}
            areaOptions={AREA_OPTIONS}
            selectedAreas={selectedAreas}
            centroOptions={data.centroOptions}
            selectedCentros={selectedCentros}
          />
        </section>

        {activeTab === "ingresos" && (
          <div className="space-y-6">
            <KpiCard label="Ingresos reales" value={ingresos} tone="positive" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Evolución de ingresos
                </h2>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <SingleMetricTrendChart data={monthly} metric="ingresos" color="#22c55e" />
                </div>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Participación de ingresos por área
                </h2>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <AreaShareDonutChart data={areaData} metric="ingresos" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Ingresos por área de negocio
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <SortedAreaLineChart rows={ingresosPorArea} color="#eab308" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "egresos" && (
          <div className="space-y-6">
            <KpiCard label="Gastos reales" value={gastos} tone="negative" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Evolución de gastos
                </h2>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <SingleMetricTrendChart data={monthly} metric="gastos" color="#f87171" />
                </div>
              </div>
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Participación de gastos por área
                </h2>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <AreaShareDonutChart data={areaData} metric="gastos" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "detalle-ingresos" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Ingresos acumulados según área
                </h2>
                <RankedAreaTable
                  rows={ingresosPorAreaDetalle}
                  valueLabel="Ingresos"
                  accentClass="text-emerald-700"
                />
              </div>
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Detalle ingresos por mes
                </h2>
                <MonthlyAmountTable
                  rows={movMonthlySummary}
                  metric="ingresos"
                  valueLabel="Ingresos"
                  accentClass="text-emerald-700"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Movimientos contables ({ingresoMovements.length.toLocaleString("es-CL")})
                </h2>
                <ExportExcelButton href={exportHref("Ingreso", "ingresos")} />
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <RecentMovementsTable rows={ingresoMovementsPage.rows} />
                <Pagination
                  page={ingresoMovementsPage.page}
                  totalPages={ingresoMovementsPage.totalPages}
                  totalCount={ingresoMovementsPage.totalCount}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "detalle-egresos" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Egresos acumulados según área
              </h2>
              <RankedAreaTable rows={gastosPorAreaDetalle} valueLabel="Gastos" accentClass="text-red-700" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Movimientos contables ({gastoMovements.length.toLocaleString("es-CL")})
                </h2>
                <ExportExcelButton href={exportHref("Gasto", "egresos")} />
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <RecentMovementsTable rows={gastoMovementsPage.rows} />
                <Pagination
                  page={gastoMovementsPage.page}
                  totalPages={gastoMovementsPage.totalPages}
                  totalCount={gastoMovementsPage.totalCount}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "resultado" && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Estado de resultado por área
              </h2>
              <EstadoResultadoTable rows={areaData} total={{ ingresos, gastos, resultado, margenPct }} />
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Ingresos vs. Gastos por área
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <AreaBarChart data={areaData} />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Movimientos contables ({allMovements.length.toLocaleString("es-CL")})
              </h2>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <RecentMovementsTable rows={allMovementsPage.rows} />
                <Pagination
                  page={allMovementsPage.page}
                  totalPages={allMovementsPage.totalPages}
                  totalCount={allMovementsPage.totalCount}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "indicadores" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Venta real empresa" value={ingresos} tone="positive" />
              <KpiCard label="Gasto real empresa" value={gastos} tone="negative" />
              <KpiCard
                label="Resultado real empresa"
                value={resultado}
                tone={resultado >= 0 ? "positive" : "negative"}
              />
              <KpiCard
                label="Margen"
                value={margenPct}
                tone={margenPct >= 0 ? "positive" : "negative"}
                formatAsPercent
              />
            </div>
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Ingresos vs. Gastos por área
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <AreaBarChart data={areaData} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
