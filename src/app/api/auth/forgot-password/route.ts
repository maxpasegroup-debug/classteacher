import { NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/server/mock-db";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`auth:forgot-password:${ip}`, 5, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many reset requests. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  const body = (await request.json()) as { email?: string };
  if (!body.email) {
    return NextResponse.json({ ok: false, message: "Email is required." }, { status: 400 });
  }
  const result = await createPasswordResetToken(body.email);
  return NextResponse.json(result);
}
