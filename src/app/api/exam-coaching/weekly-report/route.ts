import { NextResponse } from "next/server";
import { getWeeklyReport } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const result = await getWeeklyReport(token);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}
