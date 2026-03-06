import { NextResponse } from "next/server";
import { getAdminAnalytics } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const result = await getAdminAnalytics(token);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json({ ok: true, report: result.report });
}
