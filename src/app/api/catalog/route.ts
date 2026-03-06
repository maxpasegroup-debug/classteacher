import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/server/mock-db";

export async function GET() {
  return NextResponse.json(getCatalog());
}
