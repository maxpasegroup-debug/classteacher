import { NextResponse } from "next/server";
import { updateCourseProgress } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as { enrollmentId?: string; delta?: number };
  if (!body.enrollmentId || typeof body.delta !== "number") {
    return NextResponse.json({ ok: false, message: "Enrollment id and delta are required." }, { status: 400 });
  }

  const result = await updateCourseProgress(token, body.enrollmentId, body.delta);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
