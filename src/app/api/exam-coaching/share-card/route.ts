import { NextResponse } from "next/server";
import { getShareCardData } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET(request: Request) {
  const token = getBearerToken();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? undefined;
  const result = await getShareCardData(token, category);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}
