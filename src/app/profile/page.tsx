"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { ActivityItem, CourseEnrollmentItem, CreditTransactionItem, ExamAttemptItem } from "@/lib/contracts";

export default function ProfilePage() {
  const { user, logout, addCredits, getAuthHeaders, refreshUser } = useAppSession();
  const [history, setHistory] = useState<CreditTransactionItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [attempts, setAttempts] = useState<ExamAttemptItem[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollmentItem[]>([]);
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [school, setSchool] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    async function loadHistory() {
      const [attemptsResponse, enrollmentsResponse, walletResponse, activityResponse] = await Promise.all([
        fetch("/api/exam/attempts"),
        fetch("/api/courses/enrollments"),
        fetch("/api/wallet/history"),
        fetch("/api/profile/activity")
      ]);
      if (attemptsResponse.ok) {
        const data = (await attemptsResponse.json()) as { attempts: ExamAttemptItem[] };
        setAttempts(data.attempts ?? []);
      }
      if (enrollmentsResponse.ok) {
        const data = (await enrollmentsResponse.json()) as { enrollments: CourseEnrollmentItem[] };
        setEnrollments(data.enrollments ?? []);
      }
      if (walletResponse.ok) {
        const data = (await walletResponse.json()) as { transactions: CreditTransactionItem[] };
        setHistory(data.transactions ?? []);
      }
      if (activityResponse.ok) {
        const data = (await activityResponse.json()) as { activity: ActivityItem[] };
        setActivity(data.activity ?? []);
      }
    }

    loadHistory();
  }, [getAuthHeaders, user?.credits]);

  useEffect(() => {
    if (user) {
      setDistrict(user.district ?? "");
      setState(user.state ?? "");
      setSchool(user.school ?? "");
    }
  }, [user?.district, user?.state, user?.school]);

  if (!user) {
    return (
      <>
        <Header title="Profile" subtitle="Student details and account settings" />
        <main className="space-y-4 px-4 py-5">
          <section className="rounded-3xl border border-cyan-100 bg-cyan-50 p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">Create account to access profile</h2>
            <p className="mt-1 text-sm text-slate-700">
              Progress reports, profiling insights, billing wallet, and history are available after signup.
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                href="/auth/signup?returnTo=%2Fprofile"
                className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-medium text-white"
              >
                Create account
              </Link>
              <Link
                href="/auth/login?returnTo=%2Fprofile"
                className="rounded-full border border-cyan-700 px-4 py-2 text-sm font-medium text-cyan-700"
              >
                Login
              </Link>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Profile" subtitle="Student details and account settings" />
      <main className="space-y-4 px-4 py-5 md:px-0">
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Student Profile Card</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">{user.name}</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-800">Class:</span> {user.className}
            </p>
            <p>
              <span className="font-medium text-slate-800">Goal:</span> {user.goal}
            </p>
            <p>
              <span className="font-medium text-slate-800">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium text-slate-800">Wallet:</span> {user.credits} credits
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Location (for leaderboards)</h2>
          <p className="mt-1 text-xs text-slate-600">Optional. Used for school, district and state leaderboards.</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State (e.g. Kerala)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="District (e.g. Thrissur)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="School name"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
          </div>
          <button
            type="button"
            disabled={profileSaving}
            onClick={async () => {
              setProfileSaving(true);
              try {
                const res = await fetch("/api/profile/me", {
                  method: "PATCH",
                  headers: getAuthHeaders(true),
                  body: JSON.stringify({ state: state || null, district: district || null, school: school || null })
                });
                const data = (await res.json()) as { ok: boolean; message?: string };
                if (data.ok) {
                  await refreshUser();
                  alert("Location saved.");
                } else alert(data.message || "Failed to save.");
              } finally {
                setProfileSaving(false);
              }
            }}
            className="mt-2 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {profileSaving ? "Saving…" : "Save location"}
          </button>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Progress Reports</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-3">
            <article className="rounded-2xl bg-slate-50 p-3 text-center">
              <p className="text-lg font-semibold text-slate-900">{attempts.length}</p>
              <p className="text-xs text-slate-500">Tests Completed</p>
            </article>
            <article className="rounded-2xl bg-slate-50 p-3 text-center">
              <p className="text-lg font-semibold text-slate-900">
                {attempts.filter((item) => item.scorePercent != null).length
                  ? `${Math.round(
                      attempts
                        .filter((item) => item.scorePercent != null)
                        .reduce((sum, item) => sum + (item.scorePercent || 0), 0) /
                        attempts.filter((item) => item.scorePercent != null).length
                    )}%`
                  : "0%"}
              </p>
              <p className="text-xs text-slate-500">Accuracy</p>
            </article>
            <article className="rounded-2xl bg-slate-50 p-3 text-center">
              <p className="text-lg font-semibold text-slate-900">
                {enrollments.length ? `${Math.round(enrollments.reduce((sum, item) => sum + item.progressPercent, 0) / enrollments.length)}%` : "0%"}
              </p>
              <p className="text-xs text-slate-500">Course Progress</p>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Profiling</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="rounded-xl bg-slate-50 px-3 py-2">Strength profile: Quantitative + logical reasoning</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">Learning style: Visual + practice-heavy tasks</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">Recommended path: Engineering + Allied Health exploration</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Billing and Credit History</h2>
          <button
            type="button"
            onClick={async () => {
              const result = await addCredits(100);
              if (!result.ok) {
                alert(result.message);
                return;
              }
              alert("Top-up successful. 100 credits added.");
            }}
            className="mt-3 rounded-full bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Add 100 credits
          </button>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {history.length === 0 ? (
              <li className="rounded-xl bg-slate-50 px-3 py-2">No credit transactions yet.</li>
            ) : (
              history.slice(0, 6).map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span>{item.reason}</span>
                  <span>{item.delta > 0 ? `+${item.delta}` : item.delta}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Activity History</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {activity.length === 0 ? (
              <li className="rounded-xl bg-slate-50 px-3 py-2">No activity yet.</li>
            ) : (
              activity.slice(0, 6).map((item) => (
                <li key={item.id} className="rounded-xl bg-slate-50 px-3 py-2">
                  {item.title} - {item.details} ({item.creditsUsed} credits)
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Settings</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
              Notification Preferences
            </button>
            <button type="button" className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
              Learning Reminders
            </button>
            <button type="button" className="rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
              Account Privacy
            </button>
            <button
              type="button"
              onClick={logout}
              className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700"
            >
              Logout
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
