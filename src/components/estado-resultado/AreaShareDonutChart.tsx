"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { AreaSummary } from "@/lib/pnl";
import { formatCLP } from "@/lib/parseNumber";

const PALETTES = {
  ingresos: ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899", "#14b8a6"],
  gastos: ["#f87171", "#fb923c", "#f59e0b", "#a855f7", "#64748b", "#0ea5e9"],
} as const;

type Metric = "ingresos" | "gastos";

export function AreaShareDonutChart({ data, metric }: { data: AreaSummary[]; metric: Metric }) {
  const chartData = data.filter((d) => d[metric] > 0);
  const colors = PALETTES[metric];

  if (chartData.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
        Sin datos registrados en este período
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey={metric}
          nameKey="areaLabel"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {chartData.map((entry, i) => (
            <Cell key={entry.area} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCLP(Number(value))} />
        <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
