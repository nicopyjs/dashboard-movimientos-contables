import type { CentroActivity } from "@/lib/movimientos";
import { formatCLP } from "@/lib/parseNumber";

export function TopCentrosTable({ rows }: { rows: CentroActivity[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
        Sin movimientos para este filtro.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Centro de negocio</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">Movimientos</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">Monto total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.businessCenterId} className="hover:bg-slate-50">
              <td className="px-4 py-2 text-slate-700">{row.centroNombre}</td>
              <td className="px-4 py-2 text-right tabular-nums text-slate-600">
                {row.movimientos}
              </td>
              <td className="px-4 py-2 text-right tabular-nums text-slate-700">
                {formatCLP(row.montoTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
