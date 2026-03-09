"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Activity, Target, Clock3 } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";

const examCategories = [
  {
    id: "medical",
    label: "Medical Entrance",
    description: "NEET, AIIMS, JIPMER",
    accent: "from-rose-500 to-pink-500"
  },
  {
    id: "engineering",
    label: "Engineering Entrance",
    description: "JEE Main, JEE Advanced, BITSAT",
    accent: "from-sky-500 to-blue-500"
  },
  {
    id: "kerala",
    label: "Kerala Entrance Exams",
    description: "KEAM, state-level medical and engineering exams",
    accent: "from-emerald-500 to-lime-500"
  },
  {
    id: "national",
    label: "National Entrance Exams",
    description: "CUET, NDA, CLAT and more",
    accent: "from-indigo-500 to-violet-500"
  },
  {
    id: "international",
    label: "International Exams",
    description: "SAT, IELTS, TOEFL",
    accent: "from-amber-500 to-orange-500"
  },
  {
    id: "aptitude",
    label: "Aptitude & Scholarship Exams",
    description: "Olympiads, scholarships, reasoning tests",
    accent: "from-teal-500 to-cyan-500"
  }
];

export default function ExamCoachingHomePage() {
  const { user } = useAppSession();

  return (
    <main className="space-y-4 px-4 py-5 md:px-0">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-4 text-white shadow-md"
      >
        <div className="flex items-center gap-2">
          <GraduationCap size={18} />
          <p className="text-sm font-semibold">AI Exam Coaching</p>
        </div>
        <h1 className="mt-2 text-lg font-semibold">Structured training for entrance exams</h1>
        <p className="mt-1 text-sm text-emerald-50">
          Start with a diagnostic test, get a SWOT profile and follow a weekly AI-guided training plan.
        </p>
        <p className="mt-2 text-xs font-medium text-emerald-50/90">Ideal for Class 11, Class 12 and repeaters.</p>
      </motion.section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {examCategories.map((category, index) => (
          <motion.article
            key={category.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.04, ease: "easeOut" }}
            className={`group rounded-2xl bg-gradient-to-br ${category.accent} p-3 text-white shadow-md`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">{category.label}</p>
            <p className="mt-1 text-[11px] text-white/90">{category.description}</p>
            <Link
              href={`/dashboard/exam-coaching/${category.id}`}
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm group-hover:bg-white"
            >
              Choose &amp; start →
            </Link>
          </motion.article>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Target size={16} className="text-emerald-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Diagnostic Testing</p>
          <p className="mt-1 text-xs text-slate-600">30–40 mixed questions to find your baseline.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Activity size={16} className="text-cyan-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">SWOT + Training Plan</p>
          <p className="mt-1 text-xs text-slate-600">Strengths, weaknesses and a weekly study map.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Clock3 size={16} className="text-indigo-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Continuous Practice Loop</p>
          <p className="mt-1 text-xs text-slate-600">Practice → Test → Analysis → Improved Practice.</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Your exam training dashboard</h2>
            <p className="mt-1 text-xs text-slate-600">
              Track diagnostics, weekly plans and progress for every entrance exam you pick.
            </p>
          </div>
          <Link
            href="/dashboard/exam-coaching/training-plan"
            className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Open Training Dashboard
          </Link>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {user ? "Coaching is tied to your student profile and credits." : "Login or create an account to save your coaching plans."}
        </p>
      </section>
    </main>
  );
}

