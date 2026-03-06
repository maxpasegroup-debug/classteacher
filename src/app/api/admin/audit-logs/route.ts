import { NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/server/mock-db";
import { getBearerToken } from "@/lib/server/http";

export async function GET(request: Request) {
  const token = getBearerToken();
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const takeRaw = Number(url.searchParams.get("take") || "200");
  const result = await getAuditLogs(token, Number.isFinite(takeRaw) ? takeRaw : 200);

  if (!result.ok) {
    return NextResponse.json(result, { status: 403 });
  }

  if (format === "csv") {
    const header = "timestamp,actorName,actorEmail,action,entityType,entityId,payload";
    const rows = result.logs.map((item) =>
      [
        item.createdAt,
        item.actorName,
        item.actorEmail,
        item.action,
        item.entityType,
        item.entityId,
        (item.payload || "").replaceAll('"', '""')
      ]
        .map((value) => `"${value}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="audit-logs.csv"`
      }
    });
  }

  return NextResponse.json({ ok: true, logs: result.logs });
}
