import Link from "next/link";
import { getDashboardData } from "@/lib/getDashboardData";
import { filterPnlRows, summarizeByArea, summarizeByMonth } from "@/lib/pnl";
import { AREA_OPTIONS } from "@/lib/movimientos";
import { KpiCard } from "@/components/KpiCard";
import { AreaBarChart } from "@/components/AreaBarChart";
import { RefreshButton } from "@/components/RefreshButton";
import { Tabs, type EstadoResultadoTab, ESTADO_RESULTADO_TABS } from "@/components/estado-resultado/Tabs";
import { AreaYearFilters } from "@/components/estado-resultado/AreaYearFilters";
import { SingleMetricTrendChart } from "@/components/estado-resultado/SingleMetricTrendChart";
import { AreaShareDonutChart } from "@/components/estado-resultado/AreaShareDonutChart";
import { RankedAreaTable } from "@/components/estado-resultado/RankedAreaTable";
import { EstadoResultadoTable } from "@/components/estado-resultado/EstadoResultadoTable";

export const dynamic = "force-dynamic";

type SearchParams = {
  year?: string;
  area?: string;
  tab?: string;
};

export default async function EstadoResultadoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const data = await getDashboardData();
  const { year, area, tab } = await searchParams;

  const years = [...new Set(data.pnlRows.map((r) => r.year))].sort((a, b) => a - b);
  const latestYear = years[years.length - 1] ?? new Date().getFullYear();
  const selectedYear = Number(year) || latestYear;
  const selectedArea = area ?? "";
  const activeTab: EstadoResultadoTab = ESTADO_RESULTADO_TABS.some((t) => t.id === tab)
    ? (tab as EstadoResultadoTab)
    : "ingresos";

  const pnlForYear = filterPnlRows(data.pnlRows, {
    year: selectedYear,
    area: selectedArea || undefined,
  });
  const monthly = summarizeByMonth(pnlForYear);
  const areaData = summarizeByArea(pnlForYear);

  const ingresos = pnlForYear.reduce((sum, r) => sum + r.ingresos, 0);
  const gastos = pnlForYear.reduce((sum, r) => sum + r.gastos, 0);
  const resultado = pnlForYear.reduce((sum, r) => sum + r.resultado, 0);
  const margenPct = ingresos !== 0 ? (resultado / ingresos) * 100 : 0;

  const ingresosPorArea = [...areaData]
    .filter((a) => a.ingresos > 0)
    .sort((a, b) => b.ingresos - a.ingresos)
    .map((a) => ({ areaLabel: a.areaLabel, value: a.ingresos }));

  const gastosPorArea = [...areaData]
    .filter((a) => a.gastos > 0)
    .sort((a, b) => b.gastos - a.gastos)
    .map((a) => ({ areaLabel: a.areaLabel, value: a.gastos }));

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
          <Tabs active={activeTab} year={selectedYear} area={selectedArea} />
          <AreaYearFilters
            years={years}
            selectedYear={selectedYear}
            areaOptions={AREA_OPTIONS}
            selectedArea={selectedArea}
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
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ingresos acumulados según área
            </h2>
            <RankedAreaTable rows={ingresosPorArea} valueLabel="Ingresos" accentClass="text-emerald-700" />
          </div>
        )}

        {activeTab === "detalle-egresos" && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Egresos acumulados según área
            </h2>
            <RankedAreaTable rows={gastosPorArea} valueLabel="Gastos" accentClass="text-red-700" />
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
