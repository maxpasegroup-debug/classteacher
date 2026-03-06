import { NextResponse } from "next/server";
import { createStudyHelpBookingWithSlot } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`action:study-help:${ip}`, 20, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many booking requests. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  const token = getBearerToken();
  const body = (await request.json()) as { planId?: string; slotId?: string };
  if (!body.planId) {
    return NextResponse.json({ ok: false, message: "Plan id is required." }, { status: 400 });
  }

  if (!body.slotId) {
    return NextResponse.json({ ok: false, message: "Slot id is required." }, { status: 400 });
  }

  const result = await createStudyHelpBookingWithSlot(token, body.planId, body.slotId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
