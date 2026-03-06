import { NextResponse } from "next/server";
import { logoutSession } from "@/lib/server/mock-db";
import { clearAuthCookies, getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  await logoutSession(token);
  const response = NextResponse.json({ ok: true, message: "Logged out." });
  clearAuthCookies(response);
  return response;
}
