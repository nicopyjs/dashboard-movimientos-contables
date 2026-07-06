import { NextResponse } from "next/server";
import { checkPassword, createSessionValue, sessionCookieOptions, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/");

  if (!checkPassword(password)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "1");
    url.searchParams.set("from", from);
    return NextResponse.redirect(url, 303);
  }

  const response = NextResponse.redirect(new URL(from || "/", request.url), 303);
  response.cookies.set(SESSION_COOKIE, createSessionValue(), sessionCookieOptions);
  return response;
}
