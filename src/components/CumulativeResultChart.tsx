"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MonthlySummary } from "@/lib/pnl";
import { formatCompactCLP, formatCLP } from "@/lib/parseNumber";

function toCumulative(data: MonthlySummary[]) {
  const result: { yearMonth: string; acumulado: number }[] = [];
  let running = 0;
  for (const m of data) {
    running += m.resultado;
    result.push({ yearMonth: m.yearMonth, acumulado: running });
  }
  return result;
}

export function CumulativeResultChart({ data }: { data: MonthlySummary[] }) {
  const chartData = toCumulative(data);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="acumuladoFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="yearMonth"
          tick={{ fontSize: 11 }}
          interval={Math.max(0, Math.floor(chartData.length / 8))}
        />
        <YAxis tickFormatter={(v) => formatCompactCLP(v)} tick={{ fontSize: 11 }} width={70} />
        <Tooltip formatter={(value) => formatCLP(Number(value))} />
        <Area
          type="monotone"
          dataKey="acumulado"
          name="Resultado acumulado"
          stroke="#2563eb"
          strokeWidth={2}
          fill="url(#acumuladoFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
