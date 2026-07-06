"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { MonthlySummary } from "@/lib/pnl";

export function MargenTrendChart({ data }: { data: MonthlySummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="yearMonth" tick={{ fontSize: 11 }} interval={Math.max(0, Math.floor(data.length / 8))} />
        <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} width={50} />
        <ReferenceLine y={0} stroke="#94a3b8" />
        <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
        <Line
          type="monotone"
          dataKey="margenPct"
          name="Margen"
          stroke="#a855f7"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
