"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MonthlySummary } from "@/lib/pnl";
import { formatCompactCLP, formatCLP } from "@/lib/parseNumber";

type CumulativePoint = {
  yearMonth: string;
  ingresos: number;
  gastos: number;
  resultado: number;
};

function toCumulative(data: MonthlySummary[]): CumulativePoint[] {
  const result: CumulativePoint[] = [];
  let ingresosRunning = 0;
  let gastosRunning = 0;
  let resultadoRunning = 0;
  for (const m of data) {
    ingresosRunning += m.ingresos;
    gastosRunning += m.gastos;
    resultadoRunning += m.resultado;
    result.push({
      yearMonth: m.yearMonth,
      ingresos: ingresosRunning,
      gastos: gastosRunning,
      resultado: resultadoRunning,
    });
  }
  return result;
}

function xAxisInterval(length: number) {
  return Math.max(0, Math.floor(length / 8));
}

export function CumulativeIncomeChart({ data }: { data: MonthlySummary[] }) {
  const chartData = toCumulative(data);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ingresosAcumFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="yearMonth"
          tick={{ fontSize: 11 }}
          interval={xAxisInterval(chartData.length)}
        />
        <YAxis tickFormatter={(v) => formatCompactCLP(v)} tick={{ fontSize: 11 }} width={70} />
        <Tooltip formatter={(value) => formatCLP(Number(value))} />
        <Area
          type="monotone"
          dataKey="ingresos"
          name="Ingresos acumulados"
          stroke="#16a34a"
          strokeWidth={2}
          fill="url(#ingresosAcumFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CumulativeExpenseChart({ data }: { data: MonthlySummary[] }) {
  const chartData = toCumulative(data);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gastosAcumFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="yearMonth"
          tick={{ fontSize: 11 }}
          interval={xAxisInterval(chartData.length)}
        />
        <YAxis tickFormatter={(v) => formatCompactCLP(v)} tick={{ fontSize: 11 }} width={70} />
        <Tooltip formatter={(value) => formatCLP(Number(value))} />
        <Area
          type="monotone"
          dataKey="gastos"
          name="Gastos acumulados"
          stroke="#dc2626"
          strokeWidth={2}
          fill="url(#gastosAcumFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CumulativeCombinedChart({ data }: { data: MonthlySummary[] }) {
  const chartData = toCumulative(data);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="yearMonth"
          tick={{ fontSize: 11 }}
          interval={xAxisInterval(chartData.length)}
        />
        <YAxis tickFormatter={(v) => formatCompactCLP(v)} tick={{ fontSize: 11 }} width={70} />
        <Tooltip formatter={(value) => formatCLP(Number(value))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="ingresos"
          name="Ingresos acumulados"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="gastos"
          name="Gastos acumulados"
          stroke="#dc2626"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="resultado"
          name="Resultado acumulado"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
