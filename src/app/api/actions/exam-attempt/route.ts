import { NextResponse } from "next/server";
import { createExamAttempt } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`action:exam-attempt:${ip}`, 30, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many action requests. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  const token = getBearerToken();
  const body = (await request.json()) as { examId?: string };
  if (!body.examId) {
    return NextResponse.json({ ok: false, message: "Exam id is required." }, { status: 400 });
  }

  const result = await createExamAttempt(token, body.examId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
