"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Brain, Clock3, Coins, Target } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { useCatalog } from "@/hooks/useCatalog";
import { ExamAttemptItem } from "@/lib/contracts";

const tests = [
  { id: "ex-kerala-eng", name: "Kerala Engineering Entrance Drill", duration: "30 min", difficulty: "Medium", cost: 12 },
  { id: "ex-all-india-apt", name: "All India Aptitude Sprint", duration: "20 min", difficulty: "Hard", cost: 15 },
  { id: "ex-lang-memory", name: "Language + Memory Combo", duration: "25 min", difficulty: "Medium", cost: 10 }
];

const categories = [
  "All India Entrance",
  "Kerala Entrance",
  "Government Exams",
  "Aptitude",
  "IQ/EQ/CQ Tests",
  "Memory Tests",
  "Language Tests"
];

export default function ExamPracticePage() {
  const { user, getAuthHeaders, refreshUser } = useAppSession();
  const router = useRouter();
  const { catalog } = useCatalog();
  const recommendedExams = catalog?.exams ?? tests;
  const availableCategories = catalog?.examCategories ?? categories;
  const [attempts, setAttempts] = useState<ExamAttemptItem[]>([]);

  useEffect(() => {
    async function loadAttempts() {
      if (!user) {
        setAttempts([]);
        return;
      }
      const response = await fetch("/api/exam/attempts");
      if (!response.ok) return;
      const data = (await response.json()) as { attempts: ExamAttemptItem[] };
      setAttempts(data.attempts ?? []);
    }
    loadAttempts();
  }, [user, user?.credits]);

  function requireAuth() {
    if (user) return true;
    router.push(`/auth/signup?returnTo=${encodeURIComponent("/dashboard/exam-practice")}`);
    return false;
  }

  async function startTest(examId: string, cost: number) {
    if (!requireAuth()) return;
    const response = await fetch("/api/actions/exam-attempt", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ examId })
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      alert(result.message || "Unable to start exam.");
      return;
    }
    await refreshUser();
    alert(`Test started. ${cost} credits deducted.`);
  }

  async function completeAttempt(attemptId: string) {
    const score = Math.floor(60 + Math.random() * 40);
    const response = await fetch("/api/exam/submit", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ attemptId, scorePercent: score })
    });
    const data = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !data.ok) {
      alert(data.message || "Unable to submit result.");
      return;
    }
    setAttempts((prev) =>
      prev.map((item) =>
        item.id === attemptId ? { ...item, status: "completed", scorePercent: score, completedAt: new Date().toISOString() } : item
      )
    );
    alert(`Result submitted: ${score}%`);
  }

  return (
    <main className="space-y-4 px-4 py-5">
      <section className="rounded-3xl bg-gradient-to-br from-emerald-500 to-lime-500 p-4 text-white shadow-md">
        <div className="flex items-center gap-2">
          <Target size={18} />
          <p className="text-sm font-semibold">Exam Practice</p>
        </div>
        <h1 className="mt-2 text-lg font-semibold">AI-powered test preparation</h1>
        <p className="mt-1 text-sm text-white/90">
          Kerala-first competitive practice with all major exam categories.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recommended Tests</h2>
          <p className="text-xs font-medium text-emerald-700">
            {user ? `${user.credits} credits available` : "Login to use credits"}
          </p>
        </div>
        {recommendedExams.map((test) => (
          <article key={test.id} className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{test.name}</p>
            <p className="mt-1 text-xs text-slate-600">
              {test.duration} • {test.difficulty} • {test.cost} credits
            </p>
            <button
              type="button"
              onClick={() => startTest(test.id, test.cost)}
              className="mt-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              {user ? "Start now" : "Create account to start"}
            </button>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Exam Categories</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {availableCategories.map((category) => (
            <p key={category} className="rounded-xl bg-slate-50 px-2.5 py-2 text-xs text-slate-700">
              {category}
            </p>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Brain size={16} className="text-emerald-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Weak Areas</p>
          <p className="mt-1 text-xs text-slate-600">Geometry, Chemistry</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Coins size={16} className="text-cyan-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Credit Economy</p>
          <p className="mt-1 text-xs text-slate-600">Joining bonus + top-ups</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Clock3 size={16} className="text-cyan-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Practice Time</p>
          <p className="mt-1 text-xs text-slate-600">4h 20m this week</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Exam Score History</h2>
        <div className="mt-3 space-y-2">
          {attempts.length === 0 ? (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">No attempts yet.</p>
          ) : (
            attempts.slice(0, 6).map((attempt) => (
              <article key={attempt.id} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{attempt.examName}</p>
                <p className="mt-1 text-xs text-slate-600">
                  Status: {attempt.status}
                  {attempt.scorePercent != null ? ` • Score: ${attempt.scorePercent}%` : ""}
                </p>
                {attempt.status !== "completed" ? (
                  <button
                    type="button"
                    onClick={() => completeAttempt(attempt.id)}
                    className="mt-2 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Submit Result
                  </button>
                ) : null}
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
