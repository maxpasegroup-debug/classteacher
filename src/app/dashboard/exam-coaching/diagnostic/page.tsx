"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Hourglass, Target, AlertCircle } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";

const categoryExamMap: Record<string, string> = {
  medical: "ex-kerala-eng",
  engineering: "ex-kerala-eng",
  kerala: "ex-kerala-eng",
  national: "ex-all-india-apt",
  international: "ex-lang-memory",
  aptitude: "ex-all-india-apt"
};

export default function DiagnosticPage() {
  const { user, getAuthHeaders, refreshUser } = useAppSession();
  const router = useRouter();
  const [category, setCategory] = useState("engineering");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      alert(result.message || "Unable to start diagnostic.");
      return;
    }
    await refreshUser();
    // In a real system we would navigate into a full exam UI; for now we simulate attempt id as handled on submit.
    alert("Diagnostic started. When you are ready, submit to generate your coaching plan.");
  }

  async function completeDiagnostic() {
    if (submitting) return;
    setSubmitting(true);
    try {
      // For now we simulate: pick the latest attempt as the diagnostic and assign a score.
      const attemptsResponse = await fetch("/api/exam/attempts");
      if (!attemptsResponse.ok) {
        alert("Unable to load attempts.");
        return;
      }
      const data = (await attemptsResponse.json()) as { attempts: Array<{ id: string }> };
      const latest = data.attempts?.[0];
      if (!latest) {
        alert("No diagnostic attempt found. Please start the diagnostic first.");
        return;
      }
      setAttemptId(latest.id);
      const score = Math.floor(55 + Math.random() * 35);
      const response = await fetch("/api/exam/submit", {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ attemptId: latest.id, scorePercent: score })
      });
      const result = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !result.ok) {
        alert(result.message || "Unable to submit diagnostic.");
        return;
      }
      alert(`Diagnostic submitted. Score: ${score}%. Generating analysis and plan.`);
      router.push(`/dashboard/exam-coaching/training-plan?category=${encodeURIComponent(category)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-4 px-4 py-5 md:px-0">
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

