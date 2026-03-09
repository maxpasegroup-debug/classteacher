import { NextResponse } from "next/server";
import { getSimpleLeaderboard, getLeaderboard } from "@/lib/server/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "state" | "district" | "school" | null;
  const value = searchParams.get("value") ?? "";
  if (type && (type === "state" || type === "district" || type === "school") && value) {
    const result = await getLeaderboard(type, value);
    return NextResponse.json(result);
  }
  const result = await getSimpleLeaderboard();
  return NextResponse.json(result);
}

