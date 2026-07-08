import { formatCLP } from "@/lib/parseNumber";

type Row = { areaLabel: string; value: number };

type Props = {
  rows: Row[];
  valueLabel: string;
  accentClass?: string;
};

export function RankedAreaTable({ rows, valueLabel, accentClass = "text-slate-900" }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
        Sin datos para este filtro.
      </div>
    );
  }

  const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Área</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">{valueLabel}</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">% del total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.areaLabel} className="hover:bg-slate-50">
              <td className="px-4 py-2 text-slate-700">{r.areaLabel}</td>
              <td className={`px-4 py-2 text-right tabular-nums font-medium ${accentClass}`}>
                {formatCLP(r.value)}
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-slate-500">
                {total !== 0 ? `${((r.value / total) * 100).toFixed(1)}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
