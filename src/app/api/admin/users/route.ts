import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { adminUpdateUser, getAdminUsers } from "@/lib/server/mock-db";
import { getBearerToken, verifyCsrf } from "@/lib/server/http";

export async function GET(request: Request) {
  const token = getBearerToken();
  const url = new URL(request.url);
  const roleParam = url.searchParams.get("role");
  const role = roleParam && ["STUDENT", "TEACHER", "COUNSELOR", "ADMIN"].includes(roleParam) ? (roleParam as Role) : undefined;
  const result = await getAdminUsers(token, role);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json({ ok: true, users: result.users });
}

export async function PATCH(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    userId?: string;
    role?: Role;
    institutionId?: string | null;
    creditsDelta?: number;
  };
  if (!body.userId) return NextResponse.json({ ok: false, message: "userId is required." }, { status: 400 });
  const result = await adminUpdateUser(token, {
    userId: body.userId,
    role: body.role,
    institutionId: body.institutionId,
    creditsDelta: body.creditsDelta
  });
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
