"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { TeacherDashboardData } from "@/lib/contracts";

export default function TeacherHubPage() {
  const { user, getAuthHeaders } = useAppSession();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<TeacherDashboardData | null>(null);
  const [students, setStudents] = useState<Array<{ id: string; name: string; className: string }>>([]);
  const [studentId, setStudentId] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login?returnTo=/teacher");
      return;
    }
    if (user.role !== "TEACHER") return;

    async function load() {
      const [dashboardResponse, studentsResponse] = await Promise.all([
        fetch("/api/teacher/dashboard"),
        fetch("/api/directory/students")
      ]);
      if (dashboardResponse.ok) {
        const data = (await dashboardResponse.json()) as { dashboard: TeacherDashboardData };
        setDashboard(data.dashboard);
      }
      if (studentsResponse.ok) {
        const data = (await studentsResponse.json()) as {
          students: Array<{ id: string; name: string; className: string }>;
        };
        setStudents(data.students ?? []);
      }
    }
    load();
  }, [router, user]);

  async function createTask() {
    if (!studentId || !summary.trim()) return;
    const response = await fetch("/api/teacher/interventions", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        studentId,
        reasonCode: "low_accuracy",
        summary: summary.trim()
      })
    });
    if (!response.ok) {
      alert("Unable to create intervention.");
      return;
    }
    setSummary("");
    const dashboardResponse = await fetch("/api/teacher/dashboard");
    if (dashboardResponse.ok) {
      const data = (await dashboardResponse.json()) as { dashboard: TeacherDashboardData };
      setDashboard(data.dashboard);
    }
  }

  if (!user) return null;
  if (user.role !== "TEACHER") {
    return (
      <main className="space-y-3 px-4 py-5">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h1 className="text-base font-semibold text-amber-900">Teacher Hub Access</h1>
          <p className="mt-1 text-sm text-amber-800">
            This page is available only for teacher accounts. Ask admin to assign your role.
          </p>
          <Link href="/dashboard" className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-4 px-4 py-5">
      <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-cyan-600 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Teacher Hub</p>
        <h1 className="mt-1 text-lg font-semibold">{dashboard?.teacher.name || user.name}</h1>
        <p className="text-sm text-white/90">{dashboard?.teacher.institutionName || "Institution not linked"}</p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Open interventions</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{dashboard?.openInterventions ?? 0}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">Pending evaluations</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{dashboard?.pendingEvaluations ?? 0}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Class load</h2>
        <div className="mt-2 space-y-2">
          {dashboard?.classLoad.length ? (
            dashboard.classLoad.map((item) => (
              <article key={item.id} className="rounded-xl bg-slate-50 p-3 text-sm">
                <p className="font-medium text-slate-800">
                  {item.className}
                  {item.section ? ` - ${item.section}` : ""} ({item.subject})
                </p>
                <p className="text-xs text-slate-600">{item.studentCount} students mapped</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-600">No classes mapped yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Create intervention</h2>
        <div className="mt-2 space-y-2">
          <select
            value={studentId}
            onChange={(event) => setStudentId(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Select student</option>
            {students.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - {item.className}
              </option>
            ))}
          </select>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Intervention summary"
            className="h-20 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <button type="button" onClick={createTask} className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
            Create task
          </button>
        </div>
      </section>
    </main>
  );
}
