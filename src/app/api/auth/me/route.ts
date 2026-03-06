import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, user });
}
