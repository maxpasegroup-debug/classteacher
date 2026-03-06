import { NextResponse } from "next/server";
import { getCareerGuidancePlan, upsertCareerProfile } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const result = await getCareerGuidancePlan(token);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json({ ok: true, profile: result.plan.profile });
}

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    interests?: string[];
    strengths?: string[];
    preferredStates?: string[];
    budgetBand?: string;
    targetExamTimeline?: string;
    psychometricSummary?: string;
  };
  if (
    !body.interests?.length ||
    !body.strengths?.length ||
    !body.preferredStates?.length ||
    !body.budgetBand ||
    !body.targetExamTimeline ||
    !body.psychometricSummary
  ) {
    return NextResponse.json({ ok: false, message: "Missing required profile fields." }, { status: 400 });
  }
  const result = await upsertCareerProfile(token, {
    interests: body.interests,
    strengths: body.strengths,
    preferredStates: body.preferredStates,
    budgetBand: body.budgetBand,
    targetExamTimeline: body.targetExamTimeline,
    psychometricSummary: body.psychometricSummary
  });
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
