import { NextResponse } from "next/server";
import { getCourseEnrollments } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET() {
  const token = getBearerToken();
  const result = await getCourseEnrollments(token);
  if (!result.ok) {
    return NextResponse.json(result, { status: 401 });
  }
  return NextResponse.json(result);
}
