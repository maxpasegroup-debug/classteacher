"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Hourglass, Target, AlertCircle, Share2, Trophy } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";

const categoryExamMap: Record<string, string> = {
  medical: "ex-kerala-eng",
  engineering: "ex-kerala-eng",
  kerala: "ex-kerala-eng",
  keam: "ex-kerala-eng",
  national: "ex-all-india-apt",
  international: "ex-lang-memory",
  aptitude: "ex-all-india-apt"
};

const categoryToLb: Record<string, string> = {
  medical: "NEET",
  engineering: "JEE",
  kerala: "KEAM",
  keam: "KEAM",
  national: "JEE",
  international: "CUET",
  aptitude: "JEE"
};

export default function DiagnosticPage() {
  const { user, getAuthHeaders, refreshUser } = useAppSession();
  const router = useRouter();
  const [category, setCategory] = useState("engineering");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{
    scorePercent: number;
    districtRank?: number;
    stateRank?: number;
    globalRank?: number;
    improvementFromLastAttempt?: number;
    improvementAwardCreated?: boolean;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("category");
    if (fromUrl) setCategory(fromUrl);
  }, []);

  async function startDiagnostic() {
    if (!user) {
      router.push(`/auth/signup?returnTo=${encodeURIComponent(`/dashboard/exam-coaching/diagnostic?category=${category}`)}`);
      return;
    }
    const examId = categoryExamMap[category] ?? "ex-kerala-eng";
    const response = await fetch("/api/actions/exam-attempt", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ examId })
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      setMessage(result.message || "Unable to start diagnostic.");
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    await refreshUser();
    setMessage("Diagnostic started. When you are ready, click Submit Diagnostic to generate your coaching plan.");
    setTimeout(() => setMessage(null), 5000);
  }

  async function completeDiagnostic() {
    if (submitting) return;
    setSubmitting(true);
    try {
      // For now we simulate: pick the latest attempt as the diagnostic and assign a score.
      const attemptsResponse = await fetch("/api/exam/attempts");
      if (!attemptsResponse.ok) {
        setMessage("Unable to load attempts.");
        setTimeout(() => setMessage(null), 4000);
        return;
      }
      const data = (await attemptsResponse.json()) as { attempts: Array<{ id: string }> };
      const latest = data.attempts?.[0];
      if (!latest) {
        setMessage("No diagnostic attempt found. Please start the diagnostic first.");
        setTimeout(() => setMessage(null), 4000);
        return;
      }
      setAttemptId(latest.id);
      const score = Math.floor(55 + Math.random() * 35);
      const response = await fetch("/api/exam/submit", {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ attemptId: latest.id, scorePercent: score })
      });
      const submitResult = (await response.json()) as {
        ok: boolean;
        message?: string;
        scorePercent?: number;
        districtRank?: number;
        stateRank?: number;
        globalRank?: number;
        improvementFromLastAttempt?: number;
        improvementAwardCreated?: boolean;
      };
      if (!response.ok || !submitResult.ok) {
        setMessage(submitResult.message || "Unable to submit diagnostic.");
        setTimeout(() => setMessage(null), 4000);
        return;
      }
      setResult({
        scorePercent: submitResult.scorePercent ?? score,
        districtRank: submitResult.districtRank,
        stateRank: submitResult.stateRank,
        globalRank: submitResult.globalRank,
        improvementFromLastAttempt: submitResult.improvementFromLastAttempt,
        improvementAwardCreated: submitResult.improvementAwardCreated
      });
      setMessage("Diagnostic submitted. See your ranks below.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-4 px-4 py-5 md:px-0">
      {message && (
        <div
          className={`rounded-xl border px-4 py-2 text-sm font-medium ${
            message.includes("Unable") || message.includes("No diagnostic")
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message}
        </div>
      )}

      {result && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-900">Your result</h2>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">Score: {result.scorePercent}%</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            {result.districtRank != null && (
              <>
                <div>
                  <p className="font-bold text-slate-900">{result.districtRank}</p>
                  <p className="text-xs text-slate-500">District</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">{result.stateRank ?? "—"}</p>
                  <p className="text-xs text-slate-500">State</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900">{result.globalRank ?? "—"}</p>
                  <p className="text-xs text-slate-500">Global</p>
                </div>
              </>
            )}
          </div>
          {result.improvementFromLastAttempt != null && result.improvementFromLastAttempt !== 0 && (
            <p className="mt-2 text-sm text-emerald-700">
              {result.improvementFromLastAttempt > 0 ? "↑" : "↓"} {Math.abs(result.improvementFromLastAttempt)}% vs last attempt
            </p>
          )}
          {result.improvementAwardCreated && (
            <p className="mt-1 text-xs font-semibold text-amber-700">🏆 Most Improved Student badge earned!</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/share/leaderboard?examCategory=${encodeURIComponent(categoryToLb[category] ?? "JEE")}`}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <Share2 size={14} />
              Share result
            </Link>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/exam-coaching/training-plan?category=${encodeURIComponent(category)}`)}
              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700"
            >
              Continue to plan
            </button>
          </div>
        </motion.section>
      )}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-4 text-white shadow-md"
      >
        <div className="flex items-center gap-2">
          <Target size={18} />
          <p className="text-sm font-semibold">Diagnostic Test</p>
        </div>
        <h1 className="mt-2 text-lg font-semibold">Find your starting point</h1>
        <p className="mt-1 text-sm text-emerald-50">
          Answer 30–40 mixed questions for your chosen exam category. We will use this to build your SWOT and training plan.
        </p>
      </motion.section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">How this works</h2>
        <ul className="mt-2 space-y-1 text-xs text-slate-600">
          <li>1. Start the diagnostic to lock in credits for this attempt.</li>
          <li>2. Complete the test in the classroom or on paper for now.</li>
          <li>3. Submit your diagnostic to see AI-style analysis and plan.</li>
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startDiagnostic}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            <Hourglass size={14} />
            Start Diagnostic
          </button>
          <button
            type="button"
            onClick={completeDiagnostic}
            disabled={submitting}
            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            <AlertCircle size={14} />
            {submitting ? "Submitting..." : "Submit Diagnostic"}
          </button>
        </div>
      </section>
    </main>
  );
}

