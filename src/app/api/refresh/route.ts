import { NextResponse } from "next/server";
import { invalidateDashboardData } from "@/lib/getDashboardData";

export async function POST() {
  invalidateDashboardData();
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
