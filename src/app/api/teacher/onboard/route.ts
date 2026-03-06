import { NextResponse } from "next/server";
import { onboardTeacher } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    subjects?: string[];
    classLevels?: string[];
    bio?: string;
    classes?: Array<{ className: string; section?: string; subject: string }>;
  };

  if (!body.subjects?.length || !body.classLevels?.length || !body.classes) {
    return NextResponse.json({ ok: false, message: "Invalid onboarding payload." }, { status: 400 });
  }

  const result = await onboardTeacher(token, {
    subjects: body.subjects,
    classLevels: body.classLevels,
    bio: body.bio,
    classes: body.classes
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 403 });
  }
  return NextResponse.json(result);
}
