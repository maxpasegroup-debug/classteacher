import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { CSRF_COOKIE } from "@/lib/server/http";
import { cookies } from "next/headers";

export async function GET() {
  const existing = cookies().get(CSRF_COOKIE)?.value;
  const token = existing || randomUUID();
  const response = NextResponse.json({ ok: true, csrfToken: token });
  if (!existing) {
    response.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  }
  return response;
}
