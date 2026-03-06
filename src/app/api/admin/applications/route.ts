import { NextResponse } from "next/server";
import { ApplicationStage } from "@prisma/client";
import { createApplication, getApplications, updateApplicationStage } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const result = await getApplications(token);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json({ ok: true, applications: result.applications });
}

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    studentId?: string;
    institutionId?: string;
    targetProgram?: string;
    intakeYear?: number;
    deadlineAt?: string;
  };
  if (!body.studentId || !body.institutionId || !body.targetProgram || !body.intakeYear) {
    return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
  }
  const result = await createApplication(token, {
    studentId: body.studentId,
    institutionId: body.institutionId,
    targetProgram: body.targetProgram,
    intakeYear: body.intakeYear,
    deadlineAt: body.deadlineAt
  });
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    applicationId?: string;
    stage?: ApplicationStage;
    note?: string;
  };
  if (!body.applicationId || !body.stage) {
    return NextResponse.json({ ok: false, message: "applicationId and stage are required." }, { status: 400 });
  }
  const result = await updateApplicationStage(token, {
    applicationId: body.applicationId,
    stage: body.stage,
    note: body.note
  });
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
