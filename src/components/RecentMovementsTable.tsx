import type { MovementRow } from "@/lib/movimientos";
import { formatCLP } from "@/lib/parseNumber";

const NATURE_STYLES: Record<string, string> = {
  Ingreso: "bg-emerald-50 text-emerald-700",
  Gasto: "bg-red-50 text-red-700",
  Activo: "bg-blue-50 text-blue-700",
  Pasivo: "bg-amber-50 text-amber-700",
  Otro: "bg-slate-100 text-slate-600",
};

export function RecentMovementsTable({ rows }: { rows: MovementRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-400">
        Sin movimientos para este filtro.
      </div>
    );
  }

  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_theme(colors.slate.200)]">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Fecha</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Centro de negocio</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Cuenta</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Naturaleza</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Tipo mov.</th>
            <th className="px-4 py-2 text-left font-medium text-slate-500">Glosa</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">Debe</th>
            <th className="px-4 py-2 text-right font-medium text-slate-500">Haber</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr
              key={`${row.voucherNumber}-${i}`}
              className="odd:bg-white even:bg-slate-50/60 hover:bg-blue-50/60"
            >
              <td className="whitespace-nowrap px-4 py-2 text-slate-600">{row.date}</td>
              <td className="px-4 py-2 text-slate-700">{row.centroNombre || "—"}</td>
              <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-slate-500">
                {row.accountCode}
              </td>
              <td className="whitespace-nowrap px-4 py-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${NATURE_STYLES[row.nature]}`}
                >
                  {row.nature}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                {row.voucherType || "—"}
              </td>
              <td className="max-w-xs truncate px-4 py-2 text-slate-600" title={row.comment}>
                {row.comment || "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums text-slate-700">
                {row.debit ? formatCLP(row.debit) : "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums text-slate-700">
                {row.credit ? formatCLP(row.credit) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
