import Link from "next/link";

const TAB_DEFS = [
  { id: "ingresos", label: "Ingresos" },
  { id: "egresos", label: "Egresos" },
  { id: "detalle-ingresos", label: "Detalle Ingresos" },
  { id: "detalle-egresos", label: "Detalle Egresos" },
  { id: "resultado", label: "Estado de Resultado" },
  { id: "indicadores", label: "Indicadores" },
] as const;

export const ESTADO_RESULTADO_TABS = TAB_DEFS;
export type EstadoResultadoTab = (typeof TAB_DEFS)[number]["id"];

type Props = {
  active: EstadoResultadoTab;
  year: number;
  area: string;
};

export function Tabs({ active, year, area }: Props) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200">
      {TAB_DEFS.map((t) => {
        const params = new URLSearchParams();
        params.set("year", String(year));
        if (area) params.set("area", area);
        params.set("tab", t.id);
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={`/estado-resultado?${params.toString()}`}
            className={`rounded-t-lg border border-b-0 px-3 py-2 text-sm font-medium ${
              isActive
                ? "border-slate-200 bg-white text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
