"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function ToggleFullHistory({ active }: { active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <button
      onClick={() => {
        const params = new URLSearchParams(searchParams.toString());
        if (active) {
          params.delete("full");
        } else {
          params.set("full", "1");
        }
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="text-xs font-medium text-blue-600 hover:text-blue-800"
    >
      {active ? "Ver solo el año seleccionado" : "Ver todo el histórico (2021—2026)"}
    </button>
  );
}
