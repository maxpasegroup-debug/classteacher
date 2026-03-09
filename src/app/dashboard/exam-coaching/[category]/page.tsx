"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Target, CalendarDays, BarChart3 } from "lucide-react";

const categoryMeta: Record<
  string,
  {
    title: string;
    subtitle: string;
    exams: string;
  }
> = {
  medical: {
    title: "Medical Entrance Coaching",
    subtitle: "NEET, AIIMS, JIPMER and related exams",
    exams: "NEET • AIIMS • JIPMER"
  },
  engineering: {
    title: "Engineering Entrance Coaching",
    subtitle: "JEE Main, JEE Advanced, BITSAT and more",
    exams: "JEE Main • JEE Advanced • BITSAT"
  },
  kerala: {
    title: "Kerala Entrance Coaching",
    subtitle: "KEAM and other Kerala-focused exams",
    exams: "KEAM • Kerala state-level exams"
  },
  national: {
    title: "National Exams Coaching",
    subtitle: "CUET, NDA, CLAT and allied tests",
    exams: "CUET • NDA • CLAT"
  },
  international: {
    title: "International Exams Coaching",
    subtitle: "SAT, IELTS, TOEFL and similar tests",
    exams: "SAT • IELTS • TOEFL"
  },
  aptitude: {
    title: "Aptitude & Scholarship Coaching",
    subtitle: "Reasoning, scholarships and olympiads",
    exams: "Aptitude • Scholarships • Olympiads"
  }
};

export default function ExamCoachingCategoryPage() {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const categoryKey = params.category || "engineering";
  const meta = categoryMeta[categoryKey] ?? categoryMeta.engineering;

  return (
    <main className="space-y-4 px-4 py-5 md:px-0">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600"
      >
        <ChevronLeft size={14} />
        Back
      </button>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-4 text-white shadow-md"
      >
        <div className="flex items-center gap-2">
          <Target size={18} />
          <p className="text-sm font-semibold">{meta.title}</p>
        </div>
        <p className="mt-2 text-sm text-emerald-50">{meta.subtitle}</p>
        <p className="mt-1 text-xs font-medium text-emerald-50/90">{meta.exams}</p>
      </motion.section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Step 1 · Run a diagnostic test</h2>
          <p className="mt-1 text-xs text-slate-600">
            Start with a 30–40 question mixed-topic diagnostic. Your score and pattern will be used to generate a SWOT profile and
            weekly plan.
          </p>
          <Link
            href={`/dashboard/exam-coaching/diagnostic?category=${encodeURIComponent(String(categoryKey))}`}
            className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Start Diagnostic →
          </Link>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Step 2 · Review SWOT profile</h2>
          <p className="mt-1 text-xs text-slate-600">
            See where you are strong, where you are slow and where time management can become a threat.
          </p>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <CalendarDays size={16} className="text-emerald-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Weekly training plan</p>
          <p className="mt-1 text-xs text-slate-600">Physics, Chemistry, Math or Biology slots mapped week by week.</p>
          <Link
            href={`/dashboard/exam-coaching/training-plan?category=${encodeURIComponent(String(categoryKey))}`}
            className="mt-3 inline-flex rounded-full bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white"
          >
            View Plan
          </Link>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <BarChart3 size={16} className="text-cyan-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Continuous practice loop</p>
          <p className="mt-1 text-xs text-slate-600">Use mocks and section tests to keep Practice → Test → Analysis running.</p>
        </article>
      </section>
    </main>
  );
}

