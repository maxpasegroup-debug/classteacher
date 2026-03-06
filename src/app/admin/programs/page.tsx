"use client";

import { useCallback, useEffect, useState } from "react";
import { SkillProgramItem } from "@/lib/contracts";
import { useAppSession } from "@/components/providers/AppSessionProvider";

export default function AdminProgramsPage() {
  const { user, getAuthHeaders } = useAppSession();
  const [programs, setPrograms] = useState<SkillProgramItem[]>([]);
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string }>>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [title, setTitle] = useState("Spoken English Foundation");
  const [mode, setMode] = useState<"LIVE" | "RECORDED" | "HYBRID">("HYBRID");

  const loadData = useCallback(async () => {
    const [programsResponse, institutionsResponse] = await Promise.all([
      fetch("/api/admin/programs"),
      fetch("/api/admin/institutions")
    ]);
    if (programsResponse.ok) {
      const data = (await programsResponse.json()) as { programs: SkillProgramItem[] };
      setPrograms(data.programs ?? []);
    }
    if (institutionsResponse.ok) {
      const data = (await institutionsResponse.json()) as { institutions: Array<{ id: string; name: string }> };
      setInstitutions(data.institutions ?? []);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    loadData();
  }, [loadData, user]);

  async function createProgram() {
    if (!institutionId || !title.trim()) return;
    const response = await fetch("/api/admin/programs", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        institutionId,
        title: title.trim(),
        description: "Admin-hosted skill development program",
        mode,
        creditsCost: 40,
        modules: [{ title: "Orientation module", durationMin: 30 }]
      })
    });
    if (!response.ok) {
      alert("Unable to create program.");
      return;
    }
    await loadData();
  }

  async function addLiveSession(programId: string) {
    const start = new Date();
    start.setDate(start.getDate() + 2);
    start.setHours(18, 0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    await fetch("/api/admin/programs/sessions", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        programId,
        title: "Live mentoring session",
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        capacity: 100
      })
    });
    await loadData();
  }

  if (!user || user.role !== "ADMIN") {
    return <main className="px-4 py-5 text-sm text-slate-700">Admin access only.</main>;
  }

  return (
    <main className="space-y-4 px-4 py-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-slate-900">Live + Recorded Program Operations</h1>
        <div className="mt-3 space-y-2">
          <select value={institutionId} onChange={(event) => setInstitutionId(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select institution</option>
            {institutions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Program title"
          />
          <select value={mode} onChange={(event) => setMode(event.target.value as "LIVE" | "RECORDED" | "HYBRID")} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="LIVE">LIVE</option>
            <option value="RECORDED">RECORDED</option>
            <option value="HYBRID">HYBRID</option>
          </select>
          <button type="button" onClick={createProgram} className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
            Create program
          </button>
        </div>
      </section>

      <section className="space-y-2">
        {programs.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-600">
              {item.institutionName} | {item.mode} | {item.creditsCost} credits
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Modules: {item.moduleCount} | Live sessions: {item.liveSessionCount}
            </p>
            <button
              type="button"
              onClick={() => addLiveSession(item.id)}
              className="mt-2 rounded-full bg-cyan-700 px-3 py-1.5 text-xs text-white"
            >
              Schedule live session
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
