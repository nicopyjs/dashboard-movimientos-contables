import { formatCLP } from "@/lib/parseNumber";
import { monthLabel } from "@/lib/monthLabels";
import type { MonthlySummary } from "@/lib/pnl";

type Props = {
  rows: MonthlySummary[];
  metric: "ingresos" | "gastos";
  valueLabel: string;
  accentClass?: string;
};

export function MonthlyAmountTable({ rows, metric, valueLabel, accentClass = "text-slate-900" }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
        Sin datos para este filtro.
      </div>
    );
  }

  const sorted = [...rows].sort((a, b) => b[metric] - a[metric]);
  const total = rows.reduce((sum, r) => sum + r[metric], 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Mes</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">{valueLabel}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((r) => (
            <tr key={r.yearMonth} className="hover:bg-slate-50">
              <td className="px-4 py-2 text-slate-700">
                {monthLabel(r.month)} {r.year}
              </td>
              <td className={`px-4 py-2 text-right tabular-nums font-medium ${accentClass}`}>
                {formatCLP(r[metric])}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
            <td className="px-4 py-2 text-slate-900">Total</td>
            <td className={`px-4 py-2 text-right tabular-nums ${accentClass}`}>{formatCLP(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
