import { NextResponse } from "next/server";
import { getStudyHelpSlots } from "@/lib/server/mock-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const planId = searchParams.get("planId") || undefined;
  const result = await getStudyHelpSlots(planId);
  return NextResponse.json(result);
}
