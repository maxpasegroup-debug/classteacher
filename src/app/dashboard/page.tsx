"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  MessageCircleQuestion,
  Search,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Volume2
} from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";

const modules = [
  {
    title: "Study Help",
    description: "Ask doubts and connect with tutors",
    href: "/dashboard/study-help",
    icon: MessageCircleQuestion,
    gradient: "from-sky-500 to-cyan-500"
  },
  {
    title: "Exam Practice",
    description: "AI powered test preparation",
    href: "/dashboard/exam-practice",
    icon: Target,
    gradient: "from-emerald-500 to-lime-500"
  },
  {
    title: "Skill Development",
    description: "Communication and coding growth",
    href: "/dashboard/skill-development",
    icon: Sparkles,
    gradient: "from-cyan-500 to-blue-500"
  },
  {
    title: "Career Gene",
    description: "Career path intelligence and admissions support",
    href: "/dashboard/career-gene",
    icon: BriefcaseBusiness,
    gradient: "from-teal-500 to-emerald-500"
  }
];

const inProgressTests = [
  { name: "Algebra Test", progress: 70, completed: "7/10 completed" },
  { name: "Physics Quiz", progress: 45, completed: "Continue where you left off" }
];

const leaderboard = [
  { rank: 1, name: "Rahul", score: "98%" },
  { rank: 2, name: "Anjali", score: "95%" },
  { rank: 3, name: "Faiz", score: "92%" }
];

const skillSpotlight = [
  { title: "Public Speaking", icon: Volume2 },
  { title: "Coding Basics", icon: Code2 },
  { title: "Communication Skills", icon: BookOpen }
];

export default function DashboardPage() {
  const { user, isReady } = useAppSession();
  const router = useRouter();

  function authHref(path: string) {
    return `/auth/signup?returnTo=${encodeURIComponent(path)}`;
  }

  function handleProtectedAction(path: string) {
    if (!user) {
      router.push(authHref(path));
      return;
    }
    router.push(path);
  }

  return (
    <main className="space-y-4 bg-slate-50 px-4 py-5">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-lg font-bold text-white">
              R
            </div>
            <div>
              <p className="text-xl font-semibold leading-none text-slate-900">Roots</p>
              <p className="text-[11px] text-slate-500">Education Hub</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600"
            >
              <Bell size={16} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </button>
            <button type="button" aria-label="Student profile" className="rounded-full border border-slate-200 bg-white p-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-sm font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || "R"}
              </div>
            </button>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-base font-semibold text-slate-900">Hello {user?.name || "Student"}</p>
          <p className="text-sm text-slate-600">
            {user?.className || "Class 10 | CBSE"} | Goal: {user?.goal || "Master algebra this week"}
          </p>
          <p className="mt-1 text-xs font-medium text-teal-700">
            {isReady && user ? `Wallet: ${user.credits} credits` : "Guest mode - sign up to unlock all features"}
          </p>
        </div>
      </motion.section>

      {!user ? (
        <section className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-3 text-sm">
          <p className="text-cyan-900">Create your account to start tests, bookings, and enrollments.</p>
          <Link
            href={authHref("/dashboard")}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <UserPlus size={14} />
            Sign up
          </Link>
        </section>
      ) : null}

      {user?.role === "TEACHER" ? (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-3 text-sm">
          <p className="font-medium text-indigo-900">Teacher account detected</p>
          <p className="text-indigo-800">Open Teacher Hub for class analytics, interventions, and evaluation workflows.</p>
          <Link href="/teacher" className="mt-2 inline-flex rounded-full bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white">
            Go to Teacher Hub
          </Link>
        </section>
      ) : null}

      {user?.role === "ADMIN" ? (
        <section className="rounded-2xl border border-slate-300 bg-slate-100 p-3 text-sm">
          <p className="font-medium text-slate-900">Admin account detected</p>
          <p className="text-slate-700">Open Admin Console to manage users, analytics, applications, and programs.</p>
          <Link href="/admin" className="mt-2 inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
            Open Admin Console
          </Link>
        </section>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.03, ease: "easeOut" }}
        className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
      >
        <label htmlFor="search" className="sr-only">
          Search questions, topics, exams
        </label>
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5">
          <Search size={18} className="text-slate-500" />
          <input
            id="search"
            type="search"
            placeholder="Search questions, topics, exams"
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
      </motion.section>

      <section className="grid grid-cols-2 gap-3">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <motion.article
              key={module.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.06, ease: "easeOut" }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl bg-gradient-to-br p-3 text-white shadow-md ${module.gradient}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">{module.title}</h2>
                  <p className="mt-1 text-xs text-white/90">{module.description}</p>
                </div>
                <span className="rounded-lg bg-white/20 p-1.5">
                  <Icon size={16} />
                </span>
              </div>
              <Link href={module.href} className="mt-3 inline-block text-xs font-semibold text-white/95 underline-offset-2 hover:underline">
                Explore
              </Link>
            </motion.article>
          );
        })}
      </section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.14, ease: "easeOut" }}
        className="rounded-3xl border border-cyan-100 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 p-4 text-white shadow-md"
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-cyan-50">Daily Challenge</p>
            <p className="mt-1 text-sm font-semibold">Test your knowledge and compete with others</p>
          </div>
          <Trophy size={20} className="shrink-0" />
        </div>
        <button
          type="button"
          onClick={() => handleProtectedAction("/dashboard/exam-practice")}
          className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-teal-700 shadow-sm"
        >
          {user ? "Start Test" : "Create account to start"}
        </button>
      </motion.section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Continue Practice</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {inProgressTests.map((test, index) => (
            <motion.article
              key={test.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 + index * 0.06, ease: "easeOut" }}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">{test.name}</p>
              <p className="mt-1 text-xs text-slate-500">{test.completed}</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                  style={{ width: `${test.progress}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleProtectedAction("/dashboard/exam-practice")}
                className="mt-3 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                {user ? "Resume" : "Unlock"}
              </button>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Leaderboard</h3>
          <button type="button" className="text-xs font-medium text-teal-700">
            View all
          </button>
        </div>
        <ul className="space-y-2">
          {leaderboard.map((item) => (
            <li key={item.rank} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 text-xs font-semibold text-teal-700">
                  {item.rank}
                </span>
                <span className="text-sm font-medium text-slate-800">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{item.score}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h3 className="text-base font-semibold text-slate-900">Skill Spotlight</h3>
        <div className="grid grid-cols-2 gap-3">
          {skillSpotlight.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <motion.article
                key={skill.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.28 + index * 0.05, ease: "easeOut" }}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <span className="inline-flex rounded-lg bg-cyan-50 p-2 text-cyan-700">
                  <Icon size={16} />
                </span>
                <p className="mt-2 text-sm font-semibold text-slate-900">{skill.title}</p>
                <button
                  type="button"
                  onClick={() => handleProtectedAction("/dashboard/skill-development")}
                  className="mt-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white"
                >
                  {user ? "Start" : "Unlock"}
                </button>
              </motion.article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
