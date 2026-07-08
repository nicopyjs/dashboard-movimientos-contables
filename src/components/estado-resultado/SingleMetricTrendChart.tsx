"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { MonthlySummary } from "@/lib/pnl";
import { formatCompactCLP, formatCLP } from "@/lib/parseNumber";

type Props = {
  data: MonthlySummary[];
  metric: "ingresos" | "gastos";
  color: string;
};

export function SingleMetricTrendChart({ data, metric, color }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="yearMonth" tick={{ fontSize: 11 }} interval={0} />
        <YAxis tickFormatter={(v) => formatCompactCLP(v)} tick={{ fontSize: 11 }} width={70} />
        <Tooltip formatter={(value) => formatCLP(Number(value))} labelClassName="text-slate-700" />
        <Bar dataKey={metric} fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
