import { NextResponse } from "next/server";
import { loginUser } from "@/lib/server/mock-db";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { setAuthCookies } from "@/lib/server/http";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`auth:login:${ip}`, 12, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many login attempts. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json({ ok: false, message: "Email and password are required." }, { status: 400 });
  }

  const result = await loginUser({ email: body.email, password: body.password });
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  const response = NextResponse.json(result);
  setAuthCookies(response, result.token);
  return response;
}
