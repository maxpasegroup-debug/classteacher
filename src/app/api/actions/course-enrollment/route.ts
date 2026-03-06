import { NextResponse } from "next/server";
import { createCourseEnrollment } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`action:course-enrollment:${ip}`, 20, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many enrollment requests. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }
  const token = getBearerToken();
  const body = (await request.json()) as { courseId?: string };
  if (!body.courseId) {
    return NextResponse.json({ ok: false, message: "Course id is required." }, { status: 400 });
  }

  const result = await createCourseEnrollment(token, body.courseId);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
