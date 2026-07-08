import { MultiSelectDropdown } from "@/components/MultiSelectDropdown";
import { MONTH_LABELS } from "@/lib/monthLabels";

type Props = {
  years: number[];
  selectedYears: number[];
  selectedMonths: number[]; // [] = todos
  areaOptions: { id: string; label: string }[];
  selectedAreas: string[]; // [] = todas
};

export function Filters({ years, selectedYears, selectedMonths, areaOptions, selectedAreas }: Props) {
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
    </div>
  );
}
