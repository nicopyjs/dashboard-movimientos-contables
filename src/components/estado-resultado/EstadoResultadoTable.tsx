import type { AreaSummary } from "@/lib/pnl";
import { formatCLP } from "@/lib/parseNumber";

type Totals = { ingresos: number; gastos: number; resultado: number; margenPct: number };

export function EstadoResultadoTable({ rows, total }: { rows: AreaSummary[]; total: Totals }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
        Sin datos para este filtro.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Área</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">Ingresos</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">Gastos</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">Resultado</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">Margen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.area} className="hover:bg-slate-50">
              <td className="px-4 py-2 text-slate-700">{r.areaLabel}</td>
              <td className="px-4 py-2 text-right tabular-nums text-emerald-700">{formatCLP(r.ingresos)}</td>
              <td className="px-4 py-2 text-right tabular-nums text-red-700">{formatCLP(r.gastos)}</td>
              <td
                className={`px-4 py-2 text-right tabular-nums font-medium ${
                  r.resultado >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {formatCLP(r.resultado)}
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-slate-600">{r.margenPct.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
            <td className="px-4 py-2 text-slate-900">Empresa (total)</td>
            <td className="px-4 py-2 text-right tabular-nums text-emerald-700">{formatCLP(total.ingresos)}</td>
            <td className="px-4 py-2 text-right tabular-nums text-red-700">{formatCLP(total.gastos)}</td>
            <td
              className={`px-4 py-2 text-right tabular-nums ${
                total.resultado >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {formatCLP(total.resultado)}
            </td>
            <td className="px-4 py-2 text-right tabular-nums text-slate-600">{total.margenPct.toFixed(1)}%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
