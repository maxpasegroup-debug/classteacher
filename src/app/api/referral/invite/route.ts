import { NextResponse } from "next/server";
import { getUserInviteCode } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET(request: Request) {
  const token = getBearerToken();
  const result = await getUserInviteCode(token);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  const base = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") ?? "http";
  const inviteLink = result.inviteCode
    ? `${protocol}://${base}/auth/signup?ref=${encodeURIComponent(result.inviteCode)}`
    : null;
  return NextResponse.json({ ok: true as const, inviteCode: result.inviteCode, inviteLink });
}
