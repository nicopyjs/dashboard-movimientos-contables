"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { AreaSummary } from "@/lib/pnl";
import { formatCompactCLP, formatCLP } from "@/lib/parseNumber";

export function AreaBarChart({ data }: { data: AreaSummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 56)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => formatCompactCLP(v)} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="areaLabel" width={130} tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => formatCLP(Number(value))} />
        <Legend />
        <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" radius={[0, 4, 4, 0]} />
        <Bar dataKey="gastos" name="Gastos" fill="#f87171" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
