"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { CentroOption } from "@/lib/movimientos";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

type Props = {
  years: number[];
  selectedYear: number;
  selectedMonth: number; // 0 = todos
  areaOptions: { id: string; label: string }[];
  selectedArea: string; // "" = todas
  centroOptions: CentroOption[];
  selectedCentro: string; // "" = todos
};

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm";

export function Filters({
  years,
  selectedYear,
  selectedMonth,
  areaOptions,
  selectedArea,
  centroOptions,
  selectedCentro,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Año"
        value={selectedYear}
        onChange={(e) => setParam("year", e.target.value)}
        className={selectClass}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <select
        aria-label="Mes"
        value={selectedMonth}
        onChange={(e) => setParam("month", e.target.value)}
        className={selectClass}
      >
        <option value={0}>Todos los meses</option>
        {MONTHS.map((label, i) => (
          <option key={label} value={i + 1}>
            {label}
          </option>
        ))}
      </select>

      <select
        aria-label="Área"
        value={selectedArea}
        onChange={(e) => setParam("area", e.target.value)}
        className={selectClass}
      >
        <option value="">Todas las áreas</option>
        {areaOptions.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Centro de negocio"
        value={selectedCentro}
        onChange={(e) => setParam("centro", e.target.value)}
        className={`${selectClass} max-w-[220px]`}
      >
        <option value="">Todos los centros</option>
        {centroOptions.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
