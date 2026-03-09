"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, ArrowRightCircle, Bot, CalendarDays, Clock3, TrendingUp } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { ExamAttemptItem, TrainingPlanItem } from "@/lib/contracts";
import { buildCoachingSummary, buildSwotProfile, buildWeeklyTrainingPlan } from "@/lib/ai/exam-coach";

export default function TrainingPlanPage() {
  const { getAuthHeaders } = useAppSession();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "engineering";

  const [attempts, setAttempts] = useState<ExamAttemptItem[]>([]);
  const [plan, setPlan] = useState<TrainingPlanItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [attemptsResponse, planResponse] = await Promise.all([
          fetch("/api/exam/attempts"),
          fetch(`/api/exam-coaching/plan?category=${encodeURIComponent(category)}`)
        ]);
        if (attemptsResponse.ok) {
          const attemptsData = (await attemptsResponse.json()) as { attempts: ExamAttemptItem[] };
          setAttempts(attemptsData.attempts ?? []);
        }
        if (planResponse.ok) {
          const planData = (await planResponse.json()) as { ok: boolean; plan?: TrainingPlanItem | null };
          setPlan(planData.plan ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [category]);

  const summary = useMemo(() => buildCoachingSummary(attempts), [attempts]);
  const swot = useMemo(() => buildSwotProfile(summary, toCategoryLabel(category)), [summary, category]);
  const generatedWeeklyPlan = useMemo(
    () => buildWeeklyTrainingPlan(summary, toCategoryLabel(category)),
    [summary, category]
  );

  async function persistPlan() {
    const response = await fetch("/api/exam-coaching/plan", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        examCategory: toCategoryLabel(category),
        planData: generatedWeeklyPlan
      })
    });
    const data = (await response.json()) as { ok: boolean; plan?: TrainingPlanItem; message?: string };
    if (!response.ok || !data.ok) {
      alert(data.message || "Unable to save training plan.");
      return;
    }
    if (data.plan) setPlan(data.plan);
    alert("Training plan saved to your profile.");
  }

  const effectivePlan = plan?.planData || generatedWeeklyPlan;

  return (
    <main className="space-y-4 px-4 py-5 md:px-0">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-4 text-white shadow-md"
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={18} />
          <p className="text-sm font-semibold">Training Dashboard</p>
        </div>
        <h1 className="mt-2 text-lg font-semibold">
          Weekly plan for {toCategoryLabel(category)}
        </h1>
        <p className="mt-1 text-sm text-emerald-50">
          Today&apos;s tasks, practice recommendations and the next mock test based on your diagnostic performance.
        </p>
      </motion.section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <TrendingUp size={16} className="text-emerald-700" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Accuracy</p>
          <p className="text-lg font-semibold text-slate-900">{summary.accuracy || 0}%</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Clock3 size={16} className="text-cyan-700" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Completed mocks</p>
          <p className="text-lg font-semibold text-slate-900">{summary.completedAttempts}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Activity size={16} className="text-indigo-700" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Average score</p>
          <p className="text-lg font-semibold text-slate-900">{summary.averageScore || 0}%</p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">SWOT Profile</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-700">
            <div>
              <p className="font-semibold text-emerald-700">Strengths</p>
              <ul className="mt-1 space-y-1">
                {swot.strengths.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-rose-700">Weaknesses</p>
              <ul className="mt-1 space-y-1">
                {swot.weaknesses.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mt-2 font-semibold text-cyan-700">Opportunities</p>
              <ul className="mt-1 space-y-1">
                {swot.opportunities.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mt-2 font-semibold text-amber-700">Threats</p>
              <ul className="mt-1 space-y-1">
                {swot.threats.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">AI Exam Coaching Assistant</h2>
          <p className="mt-2 text-xs text-slate-600">
            This assistant reads your diagnostic and mock history to recommend focus areas. For now, recommendations are rule-based
            and can later be upgraded with OpenAI.
          </p>
          <div className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
            <div className="rounded-lg bg-emerald-100 p-1.5 text-emerald-700">
              <Bot size={16} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Today&apos;s coaching hint</p>
              <p className="mt-1">
                Focus on one weak topic block, run a 30-minute timed practice, and end your session with a short mixed quiz. Repeat
                this loop 3× per week.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Weekly training structure</h2>
          <button
            type="button"
            onClick={persistPlan}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white"
          >
            <ArrowRightCircle size={14} />
            Save to profile
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {(effectivePlan as any).weeks?.map((week: any) => (
            <article key={week.label} className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">{week.label}</p>
              <ul className="mt-1 space-y-1">
                {week.focusAreas.map((item: string) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <p className="mt-2 text-[11px] text-slate-500">Mock tests this week: {week.mockTests}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function toCategoryLabel(category: string): string {
  switch (category) {
    case "medical":
      return "Medical Entrance";
    case "kerala":
      return "Kerala Entrance Exams";
    case "national":
      return "National Entrance Exams";
    case "international":
      return "International Exams";
    case "aptitude":
      return "Aptitude & Scholarship Exams";
    case "engineering":
    default:
      return "Engineering Entrance";
  }
}

