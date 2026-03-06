import { NextResponse } from "next/server";
import { ProgramMode } from "@prisma/client";
import { createProgram, getPrograms } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const result = await getPrograms(token);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json({ ok: true, programs: result.programs });
}

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    institutionId?: string;
    title?: string;
    description?: string;
    mode?: ProgramMode;
    creditsCost?: number;
    modules?: Array<{ title: string; assetUrl?: string; durationMin?: number }>;
  };
  if (!body.institutionId || !body.title || !body.description || !body.mode || !body.creditsCost) {
    return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
  }
  const result = await createProgram(token, {
    institutionId: body.institutionId,
    title: body.title,
    description: body.description,
    mode: body.mode,
    creditsCost: body.creditsCost,
    modules: body.modules
  });
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
