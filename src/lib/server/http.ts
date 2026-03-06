import { randomUUID } from "crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { getSessionActor } from "@/lib/server/mock-db";

export const SESSION_COOKIE = "roots_session";
export const CSRF_COOKIE = "roots_csrf";

export function getBearerToken() {
  const cookieToken = cookies().get(SESSION_COOKIE)?.value;
  if (cookieToken) return cookieToken;

  // Backward-compatibility switch for non-browser automation.
  // Keep disabled in production web environments.
  if (process.env.ALLOW_LEGACY_BEARER === "true") {
    const authHeader = headers().get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.replace("Bearer ", "").trim();
    }
  }

  return null;
}

export function setAuthCookies(response: NextResponse, sessionToken: string) {
  const existingCsrf = cookies().get(CSRF_COOKIE)?.value;
  const csrfToken = existingCsrf || randomUUID();
  const isProd = process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  response.cookies.set(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  response.cookies.set(CSRF_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export function verifyCsrf(request: Request) {
  const hasBearer = Boolean(headers().get("authorization")?.startsWith("Bearer "));
  if (hasBearer) return { ok: true as const };

  const sessionCookie = cookies().get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return { ok: true as const };

  const csrfCookie = cookies().get(CSRF_COOKIE)?.value;
  const csrfHeader = request.headers.get("x-csrf-token");
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return { ok: false as const, response: NextResponse.json({ ok: false, message: "Invalid CSRF token." }, { status: 403 }) };
  }
  return { ok: true as const };
}

export async function requireRole(allowed: Role[]) {
  const token = getBearerToken();
  const actor = await getSessionActor(token);
  if (!actor) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 })
    };
  }
  if (!allowed.includes(actor.role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 })
    };
  }
  return { ok: true as const, actor, token };
}
