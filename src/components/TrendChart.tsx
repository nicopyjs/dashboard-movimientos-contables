"use client";

import {
  ComposedChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MonthlySummary } from "@/lib/pnl";
import { formatCompactCLP, formatCLP } from "@/lib/parseNumber";

export function TrendChart({ data }: { data: MonthlySummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="yearMonth" tick={{ fontSize: 11 }} interval={2} />
        <YAxis tickFormatter={(v) => formatCompactCLP(v)} tick={{ fontSize: 11 }} width={70} />
        <Tooltip
          formatter={(value) => formatCLP(Number(value))}
          labelClassName="text-slate-700"
        />
        <Legend />
        <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[3, 3, 0, 0]} />
        <Bar dataKey="gastos" name="Gastos" fill="#f87171" radius={[3, 3, 0, 0]} />
        <Bar dataKey="resultado" name="Resultado" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.yearMonth} fill={entry.resultado >= 0 ? "#2563eb" : "#f59e0b"} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
