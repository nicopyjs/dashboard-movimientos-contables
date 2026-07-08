import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getDashboardData } from "@/lib/getDashboardData";
import { filterMovimientos, sortMovementsDesc } from "@/lib/movimientos";

function parseList(value: string | null): string[] {
  return value ? value.split(",").filter(Boolean) : [];
}

function parseNumberList(value: string | null): number[] {
  return parseList(value)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const years = parseNumberList(searchParams.get("year"));
  const months = parseNumberList(searchParams.get("month"));
  const areas = parseList(searchParams.get("area"));
  const centros = parseList(searchParams.get("centro"));
  const nature = searchParams.get("nature");
  const rawFilename = searchParams.get("filename") || "movimientos";
  const filename = rawFilename.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80) || "movimientos";

  const data = await getDashboardData();
  let rows = filterMovimientos(data.movimientos, {
    years,
    months,
    areas,
    businessCenterIds: centros,
  });
  if (nature === "Ingreso" || nature === "Gasto") {
    rows = rows.filter((r) => r.nature === nature);
  }
  const sorted = sortMovementsDesc(rows);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Movimientos");
  sheet.columns = [
    { header: "Fecha", key: "date", width: 12 },
    { header: "Área", key: "area", width: 10 },
    { header: "Centro de negocio", key: "centroNombre", width: 34 },
    { header: "Cuenta", key: "accountCode", width: 14 },
    { header: "Naturaleza", key: "nature", width: 12 },
    { header: "Tipo mov.", key: "voucherType", width: 16 },
    { header: "N° Comprobante", key: "voucherNumber", width: 16 },
    { header: "Glosa", key: "comment", width: 55 },
    { header: "Debe", key: "debit", width: 16 },
    { header: "Haber", key: "credit", width: 16 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getColumn("debit").numFmt = "#,##0";
  sheet.getColumn("credit").numFmt = "#,##0";

  for (const r of sorted) {
    sheet.addRow({
      date: r.date,
      area: r.area,
      centroNombre: r.centroNombre,
      accountCode: r.accountCode,
      nature: r.nature,
      voucherType: r.voucherType,
      voucherNumber: r.voucherNumber,
      comment: r.comment,
      debit: r.debit,
      credit: r.credit,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
    },
  });
}
