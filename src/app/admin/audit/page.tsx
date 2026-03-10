"use client";

import { useCallback, useEffect, useState } from "react";
import { AuditLogItem } from "@/lib/contracts";
import { useAppSession } from "@/components/providers/AppSessionProvider";

export default function AdminAuditPage() {
  const { user, getAuthHeaders } = useAppSession();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [retentionDays, setRetentionDays] = useState("90");
  const [message, setMessage] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    const response = await fetch("/api/admin/audit-logs?take=150");
    if (!response.ok) return;
    const data = (await response.json()) as { logs: AuditLogItem[] };
    setLogs(data.logs ?? []);
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadLogs();
    }
  }, [loadLogs, user?.role]);

  async function pruneLogs() {
    const response = await fetch("/api/admin/audit-logs/prune", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ olderThanDays: Number(retentionDays) || 90 })
    });
    if (!response.ok) {
      setMessage("Unable to prune audit logs.");
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    await loadLogs();
    setMessage("Audit log retention prune completed.");
    setTimeout(() => setMessage(null), 3000);
  }

  if (!user || user.role !== "ADMIN") {
    return <main className="px-4 py-5 text-sm text-slate-700">Admin access only.</main>;
  }

  return (
    <main className="space-y-4 px-4 py-5">
      {message && (
        <div className={`rounded-xl border px-4 py-2 text-sm font-medium ${message.includes("Unable") ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {message}
        </div>
      )}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Audit Logs</h1>
            <p className="text-xs text-slate-600">Track who changed what across admin and platform operations.</p>
          </div>
          <a
            href="/api/admin/audit-logs?format=csv&take=1000"
            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Export CSV
          </a>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={retentionDays}
            onChange={(event) => setRetentionDays(event.target.value)}
            className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-xs"
            placeholder="Days"
          />
          <button
            type="button"
            onClick={pruneLogs}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            Prune old logs
          </button>
        </div>
      </section>

      <section className="space-y-2">
        {logs.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {item.action} - {item.entityType}
            </p>
            <p className="text-xs text-slate-600">
              {item.actorName} ({item.actorEmail}) | {item.entityId}
            </p>
          </article>
        ))}
        {logs.length === 0 ? <p className="text-sm text-slate-600">No logs available.</p> : null}
      </section>
    </main>
  );
}
