import { Download } from "lucide-react";

export function ExportExcelButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
    >
      <Download className="h-4 w-4" />
      Exportar Excel
    </a>
  );
}
