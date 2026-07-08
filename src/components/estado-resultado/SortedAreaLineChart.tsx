"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { formatCompactCLP, formatCLP } from "@/lib/parseNumber";

type Row = { areaLabel: string; value: number };

export function SortedAreaLineChart({ rows, color }: { rows: Row[]; color: string }) {
  if (rows.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
        Sin datos para este filtro.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={rows} margin={{ top: 24, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="areaLabel" tick={{ fontSize: 12 }} />
        <YAxis tickFormatter={(v) => formatCompactCLP(v)} tick={{ fontSize: 11 }} width={70} />
        <Tooltip formatter={(value) => formatCLP(Number(value))} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{ r: 4, fill: color }}>
          <LabelList
            dataKey="value"
            position="top"
            formatter={(v: unknown) => formatCompactCLP(Number(v))}
            style={{ fontSize: 11, fill: "#334155" }}
          />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}
