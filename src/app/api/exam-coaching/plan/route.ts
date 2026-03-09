import { NextResponse } from "next/server";
import { getTrainingPlan, saveTrainingPlan } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || "Engineering Entrance";
  const token = getBearerToken();
  const result = await getTrainingPlan(token, category);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as { examCategory?: string; planData?: unknown };
  if (!body.examCategory || !body.planData) {
    return NextResponse.json({ ok: false, message: "examCategory and planData are required." }, { status: 400 });
  }
  const result = await saveTrainingPlan(token, body.examCategory, body.planData);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}

