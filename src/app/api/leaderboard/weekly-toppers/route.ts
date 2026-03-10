import { NextResponse } from "next/server";
import { getWeeklyToppers } from "@/lib/server/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examCategory = searchParams.get("examCategory") ?? undefined;
  const result = await getWeeklyToppers(examCategory);
  return NextResponse.json(result);
}
