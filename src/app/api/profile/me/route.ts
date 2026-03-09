import { NextResponse } from "next/server";
import { updateMyProfile } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";
import { verifyCsrf } from "@/lib/server/http";

export async function PATCH(request: Request) {
  const csrf = verifyCsrf(request);
  if (!csrf.ok) return csrf.response;
  const token = getBearerToken();
  const body = (await request.json()) as {
    district?: string | null;
    state?: string | null;
    school?: string | null;
  };
  const result = await updateMyProfile(token, body);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}
