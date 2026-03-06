import { NextResponse } from "next/server";
import { createCareerAssessment } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`action:career-assessment:${ip}`, 20, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many assessment requests. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  const token = getBearerToken();
  const body = (await request.json()) as { pathwayId?: string };
  if (!body.pathwayId) {
    return NextResponse.json({ ok: false, message: "Pathway id is required." }, { status: 400 });
  }

  const result = await createCareerAssessment(token, body.pathwayId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
