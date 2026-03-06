import { NextResponse } from "next/server";
import { createIntervention, getTeacherDashboard, updateInterventionStatus } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const result = await getTeacherDashboard(token);
  if (!result.ok) {
    return NextResponse.json(result, { status: 403 });
  }
  return NextResponse.json({ ok: true, tasks: result.dashboard.atRiskStudents });
}

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    studentId?: string;
    reasonCode?: string;
    summary?: string;
    dueAt?: string;
  };

  if (!body.studentId || !body.reasonCode || !body.summary) {
    return NextResponse.json({ ok: false, message: "Invalid intervention payload." }, { status: 400 });
  }

  const result = await createIntervention(token, {
    studentId: body.studentId,
    reasonCode: body.reasonCode,
    summary: body.summary,
    dueAt: body.dueAt
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 403 });
  }
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    taskId?: string;
    status?: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  };
  if (!body.taskId || !body.status) {
    return NextResponse.json({ ok: false, message: "taskId and status are required." }, { status: 400 });
  }
  const result = await updateInterventionStatus(token, {
    taskId: body.taskId,
    status: body.status
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 403 });
  }
  return NextResponse.json(result);
}
