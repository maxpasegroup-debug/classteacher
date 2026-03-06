import { NextResponse } from "next/server";
import { changeCredits } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`wallet:add:${ip}`, 20, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many wallet requests. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  const token = getBearerToken();
  const body = (await request.json()) as { amount?: number };
  if (!body.amount || body.amount <= 0) {
    return NextResponse.json({ ok: false, message: "Invalid amount." }, { status: 400 });
  }
  const result = await changeCredits(token, Math.abs(body.amount));
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json({ ok: true, user: result.user, message: "Credits added successfully." });
}
