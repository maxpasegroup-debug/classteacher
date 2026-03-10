import { NextResponse } from "next/server";
import { getLeaderboardEntries } from "@/lib/server/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "district" | "state" | "global" | null;
  const value = searchParams.get("value") ?? null;
  const examCategory = searchParams.get("examCategory") ?? "JEE";
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  const t = type && ["district", "state", "global"].includes(type) ? type : "global";
  const result = await getLeaderboardEntries(t, value, examCategory, limit);
  return NextResponse.json(result);
}
