"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

type Option = { id: string; label: string };

type Props = {
  paramKey: string;
  label: string;
  allLabel: string;
  options: Option[];
  selected: string[];
  resetPageParam?: boolean;
};

export function MultiSelectDropdown({
  paramKey,
  label,
  allLabel,
  options,
  selected,
  resetPageParam = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function commit(next: string[]) {
    const params = new URLSearchParams(searchParams.toString());
    // Always set (even to "") once the user interacts, so an explicit "clear
    // everything" is distinguishable from the param never having been touched.
    params.set(paramKey, next.join(","));
    if (resetPageParam) params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id];
    commit(next);
  }

  const summary =
    selected.length === 0
      ? allLabel
      : selected.length === 1
      ? options.find((o) => o.id === selected[0])?.label ?? selected[0]
      : `${selected.length} seleccionados`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm"
      >
        {summary}
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-56 overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase text-slate-400">{label}</span>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => commit([])}
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Limpiar
              </button>
            )}
          </div>
          {options.map((o) => (
            <label
              key={o.id}
              className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(o.id)}
                onChange={() => toggle(o.id)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
