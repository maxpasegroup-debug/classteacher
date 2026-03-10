"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Activity, ArrowRightCircle, Bot, CalendarDays, Clock3, Copy, Share2, TrendingUp } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { ExamAttemptItem, TrainingPlanItem } from "@/lib/contracts";
import { buildCoachingSummary, buildSwotProfile, buildWeeklyTrainingPlan } from "@/lib/ai/exam-coach";

export default function TrainingPlanPage() {
  const { getAuthHeaders } = useAppSession();
  const [category, setCategory] = useState("engineering");
  const [attempts, setAttempts] = useState<ExamAttemptItem[]>([]);
  const [plan, setPlan] = useState<TrainingPlanItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<number>(0);
  const [weeklyReport, setWeeklyReport] = useState<{
    practiceTests: number;
    accuracy: number;
    strongSubject: string;
    weakSubject: string;
  } | null>(null);
  const [shareCard, setShareCard] = useState<{
    name: string;
    examCategory: string;
    initialAccuracy: number;
    currentAccuracy: number;
    improvement: number;
    rank: number;
  } | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    accuracy: number;
    averageTime: number;
    strongTopics: string[];
    weakTopics: string[];
  } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<{
    id: string;
    subject: string;
    topic: string;
    questionText: string;
    options: string[];
  } | null>(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    correctAnswer: string;
    explanation: string;
    tip: string;
  } | null>(null);
  const questionStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("category");
    if (fromUrl) setCategory(fromUrl);
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [
          attemptsResponse,
          planResponse,
          analyticsResponse,
          streakResponse,
          weeklyResponse,
          shareResponse,
          inviteResponse
        ] = await Promise.all([
          fetch("/api/exam/attempts"),
          fetch(`/api/exam-coaching/plan?category=${encodeURIComponent(category)}`),
          fetch("/api/exam-coaching/analytics"),
          fetch("/api/exam-coaching/streak"),
          fetch("/api/exam-coaching/weekly-report"),
          fetch(`/api/exam-coaching/share-card?category=${encodeURIComponent(toCategoryLabel(category))}`),
          fetch("/api/referral/invite")
        ]);
        if (attemptsResponse.ok) {
          const attemptsData = (await attemptsResponse.json()) as { attempts: ExamAttemptItem[] };
          setAttempts(attemptsData.attempts ?? []);
        }
        if (planResponse.ok) {
          const planData = (await planResponse.json()) as { ok: boolean; plan?: TrainingPlanItem | null };
          setPlan(planData.plan ?? null);
        }
        if (analyticsResponse.ok) {
          const analyticsData = (await analyticsResponse.json()) as {
            ok: boolean;
            accuracy: number;
            averageTime: number;
            strongTopics: string[];
            weakTopics: string[];
          };
          if (analyticsData.ok) {
            setAnalytics({
              accuracy: analyticsData.accuracy,
              averageTime: analyticsData.averageTime,
              strongTopics: analyticsData.strongTopics,
              weakTopics: analyticsData.weakTopics
            });
          }
        }
        if (streakResponse.ok) {
          const d = (await streakResponse.json()) as { ok: boolean; streakCount?: number };
          if (d.ok) setStreak(d.streakCount ?? 0);
        }
        if (weeklyResponse.ok) {
          const d = (await weeklyResponse.json()) as {
            ok: boolean;
            practiceTests?: number;
            accuracy?: number;
            strongSubject?: string;
            weakSubject?: string;
          };
          if (d.ok)
            setWeeklyReport({
              practiceTests: d.practiceTests ?? 0,
              accuracy: d.accuracy ?? 0,
              strongSubject: d.strongSubject ?? "—",
              weakSubject: d.weakSubject ?? "—"
            });
        }
        if (shareResponse.ok) {
          const d = (await shareResponse.json()) as {
            ok: boolean;
            name?: string;
            examCategory?: string;
            initialAccuracy?: number;
            currentAccuracy?: number;
            improvement?: number;
            rank?: number;
          };
          if (d.ok && d.name != null)
            setShareCard({
              name: d.name,
              examCategory: d.examCategory ?? toCategoryLabel(category),
              initialAccuracy: d.initialAccuracy ?? 0,
              currentAccuracy: d.currentAccuracy ?? 0,
              improvement: d.improvement ?? 0,
              rank: d.rank ?? 0
            });
        }
        if (inviteResponse.ok) {
          const d = (await inviteResponse.json()) as { ok: boolean; inviteLink?: string | null };
          if (d.ok && d.inviteLink) setInviteLink(d.inviteLink);
        }
      } finally {
        setLoading(false);
      }
    }
    if (!category) return;
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
      setToastMessage(data.message || "Unable to save training plan.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    if (data.plan) setPlan(data.plan);
    setToastMessage("Training plan saved to your profile.");
    setTimeout(() => setToastMessage(null), 3000);
  }

  const effectivePlan = plan?.planData || generatedWeeklyPlan;

  async function startPractice() {
    setFeedback(null);
    setSelectedOption("");
    const response = await fetch("/api/exam-coaching/practice", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ examCategory: toCategoryLabel(category), mode: "next" })
    });
    const data = (await response.json()) as {
      ok: boolean;
      question?: { id: string; subject: string; topic: string; questionText: string; options: string[] };
      message?: string;
    };
    if (!response.ok || !data.ok || !data.question) {
      setToastMessage(data.message || "Unable to load practice question.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setCurrentQuestion(data.question);
    questionStartRef.current = Date.now();
  }

  async function submitAnswer() {
    if (!currentQuestion || !selectedOption) return;
    const startedAt = questionStartRef.current ?? Date.now();
    const timeSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const response = await fetch("/api/exam-coaching/practice", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        examCategory: toCategoryLabel(category),
        questionId: currentQuestion.id,
        selectedOption,
        timeSeconds
      })
    });
    const data = (await response.json()) as {
      ok: boolean;
      correct: boolean;
      correctAnswer: string;
      explanation: string;
      tip: string;
      nextQuestion?: { id: string; subject: string; topic: string; questionText: string; options: string[] };
    };
    if (!response.ok || !data.ok) {
      setToastMessage(data.explanation || "Unable to evaluate answer.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }
    setFeedback({
      correct: data.correct,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      tip: data.tip
    });
    if (data.nextQuestion) {
      setCurrentQuestion(data.nextQuestion);
      setSelectedOption("");
      questionStartRef.current = Date.now();
    }
  }

  return (
    <main className="space-y-4 px-4 py-5 md:px-0">
      {toastMessage && (
        <div
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${
            toastMessage.includes("Unable") || toastMessage.includes("Failed")
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {toastMessage}
        </div>
      )}
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
        {streak > 0 && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
            🔥 {streak} Day Practice Streak
          </p>
        )}
      </motion.section>

      {shareCard && (shareCard.initialAccuracy > 0 || shareCard.currentAccuracy > 0) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Rank progress</h2>
          <p className="mt-1 text-xs text-slate-600">
            {shareCard.examCategory} — Initial {shareCard.initialAccuracy}% → Current {shareCard.currentAccuracy}%
            {shareCard.improvement !== 0 && (
              <span className={shareCard.improvement > 0 ? "text-emerald-600" : "text-slate-500"}>
                {" "}
                ({shareCard.improvement > 0 ? "+" : ""}
                {shareCard.improvement}%)
              </span>
            )}
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
              style={{ width: `${Math.min(100, Math.max(0, shareCard.currentAccuracy))}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-600">Rank in Classteacher: {shareCard.rank}</p>
          <button
            type="button"
            onClick={() => {
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const shareUrl = `${origin}/share/coaching?name=${encodeURIComponent(shareCard!.name)}&initial=${shareCard!.initialAccuracy}&current=${shareCard!.currentAccuracy}&rank=${shareCard!.rank}&exam=${encodeURIComponent(shareCard!.examCategory)}`;
              const text = `${shareCard!.name} improved from ${shareCard!.initialAccuracy}% → ${shareCard!.currentAccuracy}%. ${shareCard!.examCategory} Practice Rank ${shareCard!.rank}. Join Classteacher`;
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator.share({ title: "Classteacher progress", text, url: shareUrl }).catch(() => navigator.clipboard?.writeText(shareUrl));
              } else {
                navigator.clipboard?.writeText(shareUrl).then(() => {
                  setToastMessage("Link copied. Share on WhatsApp or elsewhere!");
                  setTimeout(() => setToastMessage(null), 3000);
                });
              }
            }}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Share2 size={14} />
            Share my progress
          </button>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <TrendingUp size={16} className="text-emerald-700" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Accuracy</p>
          <p className="text-lg font-semibold text-slate-900">
            {analytics?.accuracy ?? summary.accuracy ?? 0}%
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Clock3 size={16} className="text-cyan-700" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Avg. time</p>
          <p className="text-lg font-semibold text-slate-900">
            {(analytics?.averageTime ?? 0) || 0}s
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Activity size={16} className="text-emerald-700" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Strong topics</p>
          <p className="text-xs text-slate-700">
            {(analytics?.strongTopics ?? []).slice(0, 2).join(", ") || "TBD after practice"}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Activity size={16} className="text-rose-700" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Weak topics</p>
          <p className="text-xs text-slate-700">
            {(analytics?.weakTopics ?? []).slice(0, 2).join(", ") || "TBD after practice"}
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Today&apos;s practice</h2>
          <ul className="mt-3 space-y-2 text-xs text-slate-700">
            <li>• Physics MCQ practice</li>
            <li>• Algebra speed drill</li>
            <li>• Biology quick test</li>
          </ul>
          <button
            type="button"
            onClick={startPractice}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Start practice
          </button>
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
                {analytics?.weakTopics?.length
                  ? "Focus one short session on your weakest topic, then run a timed mixed quiz."
                  : "Run a timed practice session and we will highlight your strong and weak topics."}
              </p>
            </div>
          </div>
        </article>
      </section>

      {weeklyReport && (weeklyReport.practiceTests > 0 || weeklyReport.accuracy > 0) && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Weekly training report</h2>
          <p className="mt-1 text-xs text-slate-600">
            Practice tests: {weeklyReport.practiceTests} · Accuracy: {weeklyReport.accuracy}%
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Strong subject: {weeklyReport.strongSubject} · Weak subject: {weeklyReport.weakSubject}
          </p>
          <button
            type="button"
            onClick={() => {
              const text = `My Classteacher weekly report: ${weeklyReport!.practiceTests} practice tests, ${weeklyReport!.accuracy}% accuracy. Strong: ${weeklyReport!.strongSubject}, Weak: ${weeklyReport!.weakSubject}. Join: ${typeof window !== "undefined" ? window.location.origin : ""}/ai-exam-coaching`;
              if (typeof navigator !== "undefined" && navigator.share) {
                navigator.share({ title: "Weekly Training Report", text }).catch(() => navigator.clipboard?.writeText(text));
              } else {
                navigator.clipboard?.writeText(text).then(() => {
                  setToastMessage("Report text copied. Share with friends!");
                  setTimeout(() => setToastMessage(null), 3000);
                });
              }
            }}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Share2 size={14} />
            Share my report
          </button>
        </section>
      )}

      {inviteLink && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Invite a friend</h2>
          <p className="mt-1 text-xs text-slate-600">Earn 50 practice credits when your friend joins.</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={inviteLink}
              className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(inviteLink);
                setToastMessage("Invite link copied!");
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Copy size={14} />
              Copy link
            </button>
          </div>
        </section>
      )}

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

      {currentQuestion ? (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Quick practice question</h2>
          <p className="text-xs text-slate-600">
            {currentQuestion.subject} • {currentQuestion.topic}
          </p>
          <p className="mt-2 text-sm text-slate-900">{currentQuestion.questionText}</p>
          <div className="mt-2 space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedOption(option)}
                className={`block w-full rounded-full border px-3 py-2 text-left text-xs ${
                  selectedOption === option
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={submitAnswer}
            disabled={!selectedOption}
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            Submit answer
          </button>

          {feedback && (
            <div className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
              <p className="font-semibold">
                {feedback.correct ? "Correct!" : "Not quite. Here is the correct answer:"}
              </p>
              {!feedback.correct && (
                <p>
                  <span className="font-semibold">Correct answer:</span> {feedback.correctAnswer}
                </p>
              )}
              <p>
                <span className="font-semibold">Explanation:</span> {feedback.explanation}
              </p>
              <p>
                <span className="font-semibold">Tip:</span> {feedback.tip}
              </p>
            </div>
          )}
        </section>
      ) : null}
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

