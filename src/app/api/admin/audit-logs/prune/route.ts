import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { pruneAuditLogs } from "@/lib/server/mock-db";
import { requireRole, verifyCsrf } from "@/lib/server/http";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";

export async function POST(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const ip = getRequestIp(request);
  const gate = await checkRateLimit(`admin:audit-prune:${ip}`, 10, 60_000);
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, message: `Too many requests. Retry in ${gate.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const auth = await requireRole([Role.ADMIN]);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as { olderThanDays?: number };
  const days = body.olderThanDays && body.olderThanDays > 0 ? Math.floor(body.olderThanDays) : 90;
  const result = await pruneAuditLogs(days);
  return NextResponse.json(result);
}
