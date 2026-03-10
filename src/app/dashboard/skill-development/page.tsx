"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Code2, Languages, Sparkles } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { useCatalog } from "@/hooks/useCatalog";
import { CourseEnrollmentItem } from "@/lib/contracts";

const tracks = [
  { id: "c-public-speaking", title: "Public Speaking", mode: "Live + Recorded", credits: 35 },
  { id: "c-coding-basics", title: "Coding Basics", mode: "Recorded", credits: 25 },
  { id: "c-communication", title: "Communication Skills", mode: "Live", credits: 30 }
];

export default function SkillDevelopmentPage() {
  const { user, getAuthHeaders, refreshUser } = useAppSession();
  const router = useRouter();
  const { catalog } = useCatalog();
  const marketplaceCourses = catalog?.courses ?? tracks;
  const [enrollments, setEnrollments] = useState<CourseEnrollmentItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadEnrollments() {
      if (!user) {
        setEnrollments([]);
        return;
      }
      const response = await fetch("/api/courses/enrollments");
      if (!response.ok) return;
      const data = (await response.json()) as { enrollments: CourseEnrollmentItem[] };
      setEnrollments(data.enrollments ?? []);
    }
    loadEnrollments();
  }, [user, user?.credits]);

  function requireAuth() {
    if (user) return true;
    router.push(`/auth/signup?returnTo=${encodeURIComponent("/dashboard/skill-development")}`);
    return false;
  }

  async function enrollCourse(courseId: string, cost: number) {
    if (!requireAuth()) return;
    const response = await fetch("/api/actions/course-enrollment", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ courseId })
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Enrollment failed.");
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    await refreshUser();
    setMessage(`Enrollment successful. ${cost} credits deducted.`);
    setTimeout(() => setMessage(null), 4000);
  }

  async function addProgress(enrollmentId: string) {
    const response = await fetch("/api/courses/progress", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ enrollmentId, delta: 20 })
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Unable to update progress.");
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    setEnrollments((prev) =>
      prev.map((item) => {
        if (item.id !== enrollmentId) return item;
        const nextProgress = Math.min(100, item.progressPercent + 20);
        return { ...item, progressPercent: nextProgress, status: nextProgress >= 100 ? "completed" : "active" };
      })
    );
  }

  return (
    <main className="space-y-4 px-4 py-5">
      {message && (
        <div
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${
            message.includes("Unable") || message.includes("failed") ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </div>
      )}
      <section className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 p-4 text-white shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <p className="text-sm font-semibold">Skill Development</p>
        </div>
        <h1 className="mt-2 text-lg font-semibold">Build future-ready student skills</h1>
        <p className="mt-1 text-sm text-white/90">Marketplace for recorded and live skill-building courses.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Course Marketplace</h2>
        <ul className="mt-3 space-y-2">
          {marketplaceCourses.map((track) => (
            <li key={track.id} className="rounded-xl bg-slate-50 px-3 py-3 text-sm">
              <p className="font-semibold text-slate-800">{track.title}</p>
              <p className="text-xs text-slate-600">
                {track.mode} • {track.credits} credits
              </p>
              <button
                type="button"
                onClick={() => enrollCourse(track.id, track.credits)}
                className="mt-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                {user ? "Enroll now" : "Create account to enroll"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Admin Hosted Courses</h2>
        <ul className="mt-3 space-y-2 text-xs text-slate-600">
          <li className="rounded-xl bg-slate-50 px-3 py-2">Courses are published from the admin panel.</li>
          <li className="rounded-xl bg-slate-50 px-3 py-2">Students can enroll only using wallet credits.</li>
          <li className="rounded-xl bg-slate-50 px-3 py-2">Live sessions include attendance and completion tracking.</li>
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Code2 size={16} className="text-blue-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Coding Score</p>
          <p className="mt-1 text-xs text-slate-600">Intermediate progress</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Languages size={16} className="text-cyan-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Communication</p>
          <p className="mt-1 text-xs text-slate-600">2 speaking tasks pending</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Course Progress Tracker</h2>
        <div className="mt-3 space-y-2">
          {enrollments.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">No course enrollments yet.</p>
          ) : (
            enrollments.slice(0, 6).map((item) => (
              <article key={item.id} className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">{item.courseTitle}</p>
                  <p className="text-xs text-slate-600">{item.progressPercent}%</p>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
                {item.status !== "completed" ? (
                  <button
                    type="button"
                    onClick={() => addProgress(item.id)}
                    className="mt-2 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Add 20% progress
                  </button>
                ) : (
                  <p className="mt-2 text-xs font-medium text-emerald-700">Completed</p>
                )}
              </article>
            ))
          )}
        </div>
      </section>

      <Link
        href="/dashboard"
        className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back to Classteacher
      </Link>
    </main>
  );
}
