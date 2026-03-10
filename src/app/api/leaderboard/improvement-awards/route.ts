import { NextResponse } from "next/server";
import { getImprovementAwards } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET(request: Request) {
  const token = getBearerToken();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 5, 20);
  const result = await getImprovementAwards(token, limit);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}
