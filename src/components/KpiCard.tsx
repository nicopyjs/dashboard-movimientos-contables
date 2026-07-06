import { formatCompactCLP } from "@/lib/parseNumber";

type Props = {
  label: string;
  value: number;
  tone?: "neutral" | "positive" | "negative";
  formatAsPercent?: boolean;
};

export function KpiCard({ label, value, tone = "neutral", formatAsPercent }: Props) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600"
      : tone === "negative"
      ? "text-red-600"
      : "text-slate-900";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tabular-nums ${toneClass}`}>
        {formatAsPercent ? `${value.toFixed(1)}%` : formatCompactCLP(value)}
      </p>
    </div>
  );
}
