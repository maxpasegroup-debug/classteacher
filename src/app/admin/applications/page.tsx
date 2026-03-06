"use client";

import { useCallback, useEffect, useState } from "react";
import { AdmissionApplicationItem } from "@/lib/contracts";
import { useAppSession } from "@/components/providers/AppSessionProvider";

const stages = [
  "LEAD",
  "INQUIRY",
  "APPLICATION_STARTED",
  "DOCS_PENDING",
  "SUBMITTED",
  "SHORTLISTED",
  "ADMITTED",
  "ENROLLED"
] as const;

export default function AdminApplicationsPage() {
  const { user, getAuthHeaders } = useAppSession();
  const [items, setItems] = useState<AdmissionApplicationItem[]>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string; className: string }>>([]);
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string }>>([]);
  const [studentId, setStudentId] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [targetProgram, setTargetProgram] = useState("BSc Nursing");

  const loadData = useCallback(async () => {
    const [applicationsResponse, studentsResponse, institutionsResponse] = await Promise.all([
      fetch("/api/admin/applications"),
      fetch("/api/directory/students"),
      fetch("/api/admin/institutions")
    ]);
    if (applicationsResponse.ok) {
      const data = (await applicationsResponse.json()) as { applications: AdmissionApplicationItem[] };
      setItems(data.applications ?? []);
    }
    if (studentsResponse.ok) {
      const data = (await studentsResponse.json()) as {
        students: Array<{ id: string; name: string; className: string }>;
      };
      setStudents(data.students ?? []);
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

  async function createNewApplication() {
    if (!studentId || !institutionId) return;
    const response = await fetch("/api/admin/applications", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        studentId,
        institutionId,
        targetProgram,
        intakeYear: new Date().getFullYear()
      })
    });
    if (!response.ok) {
      alert("Unable to create application.");
      return;
    }
    await loadData();
  }

  async function moveStage(applicationId: string, stage: (typeof stages)[number]) {
    await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        applicationId,
        stage,
        note: `Stage moved to ${stage}`
      })
    });
    setItems((prev) => prev.map((item) => (item.id === applicationId ? { ...item, stage } : item)));
  }

  if (!user || user.role !== "ADMIN") {
    return <main className="px-4 py-5 text-sm text-slate-700">Admin access only.</main>;
  }

  return (
    <main className="space-y-4 px-4 py-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-slate-900">Applications Management</h1>
        <div className="mt-3 space-y-2">
          <select value={studentId} onChange={(event) => setStudentId(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select student</option>
            {students.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.className}
              </option>
            ))}
          </select>
          <select value={institutionId} onChange={(event) => setInstitutionId(event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            <option value="">Select institution</option>
            {institutions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input
            value={targetProgram}
            onChange={(event) => setTargetProgram(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Target program"
          />
          <button type="button" onClick={createNewApplication} className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
            Create application
          </button>
        </div>
      </section>

      <section className="space-y-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{item.studentName}</p>
            <p className="text-xs text-slate-600">
              {item.institutionName} | {item.targetProgram} | {item.stage}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {stages.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => moveStage(item.id, stage)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
                >
                  {stage}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
