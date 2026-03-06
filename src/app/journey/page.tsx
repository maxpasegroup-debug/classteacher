"use client";

import { motion } from "framer-motion";
import { Bot, CheckCircle2, Lock, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

const levels = [
  { name: "Foundation", unlocked: true },
  { name: "Practice Mastery", unlocked: true },
  { name: "Skill Growth", unlocked: true, current: true },
  { name: "Career Direction", unlocked: false },
  { name: "College Ready", unlocked: false }
];

const currentLevelTasks = [
  { task: "Finish two coding drills on logic building", done: true },
  { task: "Complete communication mini-project reflection", done: false },
  { task: "Submit weekly goal check-in before Sunday", done: false }
];

export default function JourneyPage() {
  return (
    <>
      <Header title="My Journey" subtitle="Track your learning path level by level" />

      <main className="space-y-4 px-4 py-5">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="rounded-3xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 p-4 text-white shadow-lg shadow-cyan-100"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/15 p-3">
              <p className="text-xs text-cyan-50">Level</p>
              <p className="mt-1 text-sm font-semibold">3 - Skill Growth</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <p className="text-xs text-cyan-50">XP</p>
              <p className="mt-1 text-sm font-semibold">1,420 XP</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3">
              <p className="text-xs text-cyan-50">Weekly Progress</p>
              <p className="mt-1 text-sm font-semibold">72%</p>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "72%" }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
              className="h-full rounded-full bg-white"
            />
          </div>
        </motion.section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Journey Map</h2>
            <span className="text-xs text-slate-500">Vertical level path</span>
          </div>

          <div className="relative space-y-4 pl-8">
            <div className="absolute bottom-0 left-3 top-0 w-0.5 bg-slate-200" />
            {levels.map((level, index) => (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.08, ease: "easeOut" }}
                className="relative"
              >
                <span
                  className={cn(
                    "absolute -left-[1.72rem] top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white",
                    level.unlocked ? "border-teal-500" : "border-slate-300"
                  )}
                >
                  {level.unlocked ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                  ) : (
                    <Lock size={10} className="text-slate-400" />
                  )}
                </span>

                <div
                  className={cn(
                    "rounded-xl border p-3 shadow-sm transition",
                    level.unlocked
                      ? "border-teal-100 bg-gradient-to-r from-cyan-50 to-emerald-50"
                      : "border-slate-200 bg-slate-50 text-slate-500",
                    level.current && "ring-2 ring-teal-200"
                  )}
                >
                  <p className={cn("text-sm font-semibold", level.unlocked ? "text-slate-900" : "text-slate-500")}>
                    {level.name}
                  </p>
                  <p className="mt-1 text-xs">
                    {level.current
                      ? "Current level - keep momentum this week."
                      : level.unlocked
                        ? "Completed and unlocked."
                        : "Locked - complete previous level tasks."}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-slate-900">Current Level Tasks</h2>
          <ul className="mt-3 space-y-2">
            {currentLevelTasks.map((item) => (
              <li
                key={item.task}
                className={cn(
                  "flex items-start gap-2 rounded-xl border p-2.5 text-sm",
                  item.done ? "border-teal-100 bg-teal-50/50 text-slate-700" : "border-slate-200 bg-slate-50"
                )}
              >
                <CheckCircle2
                  size={16}
                  className={cn("mt-0.5 shrink-0", item.done ? "text-teal-600" : "text-slate-400")}
                />
                <span>{item.task}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
          className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 to-emerald-50 p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2 text-teal-600 shadow-sm">
              <Bot size={18} />
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                AI Study Buddy
                <Sparkles size={14} className="text-teal-600" />
              </p>
              <p className="mt-1 text-sm text-slate-600">
                You are doing great. Complete one task today and I will suggest a focused revision plan for tomorrow.
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </>
  );
}
