import { NextResponse } from "next/server";
import { evaluatePracticeAnswer, nextPracticeQuestion } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;

  const token = getBearerToken();
  const body = (await request.json()) as
    | { examCategory?: string; mode: "next" }
    | { examCategory?: string; questionId: string; selectedOption: string; timeSeconds: number };

  const examCategory = body.examCategory || "Engineering Entrance";
  if (!examCategory) {
    return NextResponse.json({ ok: false, message: "examCategory is required." }, { status: 400 });
  }

  if ("mode" in body && body.mode === "next") {
    const result = await nextPracticeQuestion(token, examCategory);
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }

  if ("questionId" in body && "selectedOption" in body && "timeSeconds" in body) {
    const result = await evaluatePracticeAnswer(token, {
      examCategory,
      questionId: body.questionId,
      selectedOption: body.selectedOption,
      timeSeconds: body.timeSeconds
    });
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
}

