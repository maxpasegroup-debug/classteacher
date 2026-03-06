import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/server/mock-db";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`auth:reset-password:${ip}`, 6, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many reset attempts. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const body = (await request.json()) as {
    email?: string;
    token?: string;
    newPassword?: string;
  };

  if (!body.email || !body.token || !body.newPassword) {
    return NextResponse.json({ ok: false, message: "Email, token, and new password are required." }, { status: 400 });
  }
  if (body.newPassword.length < 8) {
    return NextResponse.json({ ok: false, message: "Password must be at least 8 characters." }, { status: 400 });
  }

  const result = await resetPasswordWithToken({
    email: body.email,
    token: body.token,
    newPassword: body.newPassword
  });
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  return NextResponse.json(result);
}
