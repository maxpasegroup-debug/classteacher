import { NextResponse } from "next/server";
import { getLeaderboardOptIn, updateLeaderboardOptIn } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const result = await getLeaderboardOptIn(token);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as { leaderboardOptIn?: boolean };
  if (typeof body.leaderboardOptIn !== "boolean") {
    return NextResponse.json({ ok: false, message: "leaderboardOptIn (boolean) required." }, { status: 400 });
  }
  const result = await updateLeaderboardOptIn(token, body.leaderboardOptIn);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}
