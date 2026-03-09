import { NextResponse } from "next/server";
import { signupUser } from "@/lib/server/mock-db";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { setAuthCookies } from "@/lib/server/http";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`auth:signup:${ip}`, 6, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many signup attempts. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    className?: string;
    goal?: string;
    password?: string;
    inviteCode?: string;
  };

  if (!body.name || !body.email || !body.className || !body.goal || !body.password) {
    return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
  }

  const result = await signupUser({
    name: body.name,
    email: body.email,
    className: body.className,
    goal: body.goal,
    password: body.password,
    inviteCode: body.inviteCode
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  const response = NextResponse.json(result);
  setAuthCookies(response, result.token);
  return response;
}
