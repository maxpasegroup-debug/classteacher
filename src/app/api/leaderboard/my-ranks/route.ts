import { NextResponse } from "next/server";
import { getMyRanks } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET(request: Request) {
  const token = getBearerToken();
  const { searchParams } = new URL(request.url);
  const examCategory = searchParams.get("examCategory") ?? "JEE";
  const result = await getMyRanks(token, examCategory);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}
