import { NextResponse } from "next/server";
import { submitExamResult } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as { attemptId?: string; scorePercent?: number };
  if (!body.attemptId || typeof body.scorePercent !== "number") {
    return NextResponse.json({ ok: false, message: "Attempt id and score are required." }, { status: 400 });
  }

  const result = await submitExamResult(token, body.attemptId, body.scorePercent);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
