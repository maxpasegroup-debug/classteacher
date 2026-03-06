import { NextResponse } from "next/server";
import { getAdminInstitutions } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const result = await getAdminInstitutions(token);
  if (!result.ok) return NextResponse.json(result, { status: 403 });
  return NextResponse.json(result);
}
