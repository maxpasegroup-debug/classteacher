import { NextResponse } from "next/server";
import { scheduleLiveSession } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    programId?: string;
    title?: string;
    startsAt?: string;
    endsAt?: string;
    capacity?: number;
    replayUrl?: string;
  };
  if (!body.programId || !body.title || !body.startsAt || !body.endsAt || !body.capacity) {
    return NextResponse.json({ ok: false, message: "Missing required fields." }, { status: 400 });
  }
  const result = await scheduleLiveSession(token, {
    programId: body.programId,
    title: body.title,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    capacity: body.capacity,
    replayUrl: body.replayUrl
  });
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
