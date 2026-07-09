import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import { MONTH_LABELS } from "@/lib/monthLabels";
import type { CentroOption } from "@/lib/movimientos";

type Props = {
  years: number[];
  selectedYears: number[];
  selectedMonths: number[]; // [] = todos
  areaOptions: { id: string; label: string }[];
  selectedAreas: string[]; // [] = todas
  centroOptions: CentroOption[];
  selectedCentros: string[]; // [] = todos
};

export function Filters({
  years,
  selectedYears,
  selectedMonths,
  areaOptions,
  selectedAreas,
  centroOptions,
  selectedCentros,
}: Props) {
  // With an área active, only offer that área's centros (no need to type
  // "rct" to find them), and treat the picker as an exclusion list on top of
  // "todos los centros de esta área" instead of a from-scratch inclusion list.
  const scopedCentroOptions =
    selectedAreas.length > 0
      ? centroOptions.filter((c) => selectedAreas.includes(c.area))
      : centroOptions;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <MultiSelectDropdown
        paramKey="year"
        label="Año"
        allLabel="Todos los años"
        options={years.map((y) => ({ id: String(y), label: String(y) }))}
        selected={selectedYears.map(String)}
      />

      <MultiSelectDropdown
        paramKey="month"
        label="Mes"
        allLabel="Todos los meses"
        options={MONTH_LABELS.map((label, i) => ({ id: String(i + 1), label }))}
        selected={selectedMonths.map(String)}
      />

      <MultiSelectDropdown
        paramKey="area"
        label="Área"
        allLabel="Todas las áreas"
        options={areaOptions}
        selected={selectedAreas}
      />

      <MultiSelectDropdown
        paramKey={selectedAreas.length > 0 ? "excluirCentro" : "centro"}
        mode={selectedAreas.length > 0 ? "exclude" : "include"}
        label="Centro de negocio"
        allLabel="Todos los centros"
        options={scopedCentroOptions}
        selected={selectedCentros}
        searchable
      />
    </div>
  );
}
