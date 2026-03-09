"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Target, Zap, BarChart3 } from "lucide-react";

const exams = ["NEET", "JEE", "KEAM", "CUET", "PSC"];

export default function AIExamCoachingLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="mx-auto max-w-2xl px-4 py-12 text-center md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
        >
          <Zap size={14} />
          AI Exam Coaching for Kerala
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl"
        >
          AI Exam Coaching for NEET, JEE, KEAM
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="mt-3 text-slate-600"
        >
          Take a free diagnostic test. Get your SWOT report. Start improving today.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.16 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {exams.map((exam) => (
            <span
              key={exam}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {exam}
            </span>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8"
        >
          <Link
            href="/auth/signup?returnTo=%2Fdashboard%2Fexam-coaching"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700"
          >
            <GraduationCap size={18} />
            Take free diagnostic — Join Classteacher
          </Link>
        </motion.div>
        <p className="mt-3 text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/auth/login?returnTo=%2Fdashboard%2Fexam-coaching" className="font-medium text-emerald-600">
            Log in
          </Link>
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <Target className="text-emerald-600" size={20} />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Free diagnostic</h3>
            <p className="mt-1 text-xs text-slate-600">Baseline test and SWOT report.</p>
          </motion.article>
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <BarChart3 className="text-teal-600" size={20} />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Track progress</h3>
            <p className="mt-1 text-xs text-slate-600">Accuracy, ranks, and weekly reports.</p>
          </motion.article>
          <motion.article
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <Zap className="text-amber-600" size={20} />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">Practice daily</h3>
            <p className="mt-1 text-xs text-slate-600">Streaks, leaderboards, and shareable cards.</p>
          </motion.article>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-16 text-center">
        <p className="text-sm text-slate-500">
          Roots Education Hub — Classteacher. Ideal for Class 11, Class 12 and repeaters.
        </p>
      </section>
    </main>
  );
}
