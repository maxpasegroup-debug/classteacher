"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Share2, Flame } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";

type LeaderboardType = "district" | "state" | "global";

const EXAM_CATEGORIES = ["JEE", "NEET", "KEAM", "CUET"] as const;

export default function LeaderboardPage() {
  const { user, getAuthHeaders } = useAppSession();
  const [type, setType] = useState<LeaderboardType>("global");
  const [examCategory, setExamCategory] = useState<string>("JEE");
  const [entries, setEntries] = useState<Array<{ rank: number; name: string; scorePercent: number }>>([]);
  const [myRanks, setMyRanks] = useState<{ districtRank: number; stateRank: number; globalRank: number } | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [weeklyToppers, setWeeklyToppers] = useState<Array<{ examCategory: string; name: string; scorePercent: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const value = type === "district" ? (user?.district ?? "") : type === "state" ? (user?.state ?? "") : null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ type, examCategory });
        if (type !== "global" && value) params.set("value", value);
        const [entriesRes, toppersRes] = await Promise.all([
          fetch(`/api/leaderboard/entries?${params}`),
          fetch("/api/leaderboard/weekly-toppers")
        ]);
        const entriesData = (await entriesRes.json()) as { ok?: boolean; entries?: Array<{ rank: number; name: string; scorePercent: number }> };
        const toppersData = (await toppersRes.json()) as { ok?: boolean; toppers?: Array<{ examCategory: string; name: string; scorePercent: number }> };
        if (entriesData.ok && entriesData.entries) setEntries(entriesData.entries);
        else setEntries([]);
        if (toppersData.ok && toppersData.toppers) setWeeklyToppers(toppersData.toppers);
        else setWeeklyToppers([]);
      } catch {
        setError("Could not load leaderboard.");
      }
      setLoading(false);
    }
    load();
  }, [type, value, examCategory]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [ranksRes, streakRes] = await Promise.all([
          fetch(`/api/leaderboard/my-ranks?examCategory=${encodeURIComponent(examCategory)}`, { headers: getAuthHeaders() }),
          fetch("/api/exam-coaching/streak", { headers: getAuthHeaders() })
        ]);
        const ranksData = (await ranksRes.json()) as { ok?: boolean; districtRank?: number; stateRank?: number; globalRank?: number };
        const streakData = (await streakRes.json()) as { ok?: boolean; streakCount?: number };
        if (ranksData.ok && typeof ranksData.districtRank === "number")
          setMyRanks({
            districtRank: ranksData.districtRank,
            stateRank: ranksData.stateRank ?? 0,
            globalRank: ranksData.globalRank ?? 0
          });
        else setMyRanks(null);
        if (streakData.ok && typeof streakData.streakCount === "number") setStreak(streakData.streakCount);
      } catch {
        setMyRanks(null);
      }
    })();
  }, [user, examCategory, getAuthHeaders]);

  return (
    <div className="space-y-4">
      {/* Exam category tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-200/80 p-1">
        {EXAM_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setExamCategory(cat)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
              examCategory === cat ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Leaderboard type: District | State | Global */}
      <div className="flex gap-1 rounded-xl bg-slate-200/80 p-1">
        {(["global", "state", "district"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium capitalize transition ${
              type === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {type !== "global" && !value && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Set your location in Profile to see {type} rank and leaderboard.
        </p>
      )}

      {/* Your Rank Card */}
      {user && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-900">Your Rank</h2>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900">{myRanks?.districtRank ?? "—"}</p>
              <p className="text-[10px] uppercase text-slate-500">District</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{myRanks?.stateRank ?? "—"}</p>
              <p className="text-[10px] uppercase text-slate-500">State</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{myRanks?.globalRank ?? "—"}</p>
              <p className="text-[10px] uppercase text-slate-500">Global</p>
            </div>
          </div>
          {streak > 0 && (
            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-100/80 py-1.5 text-amber-800">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-medium">{streak} day practice streak</span>
            </div>
          )}
        </motion.section>
      )}

      {/* Weekly Top Performers */}
      {weeklyToppers.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Weekly Top Performers</h2>
          <ul className="mt-2 space-y-1.5">
            {weeklyToppers.map((t) => (
              <li key={t.examCategory} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-slate-700">{t.examCategory}</span>
                <span className="text-slate-600">{t.name}</span>
                <span className="font-semibold text-emerald-600">{t.scorePercent}%</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Top 10 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Top 10</h2>
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        {loading ? (
          <p className="mt-3 text-sm text-slate-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No entries yet. Complete a mock test to appear here.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {entries.map((e) => (
              <li
                key={`${e.rank}-${e.name}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                  {e.rank}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">{e.name}</span>
                <span className="text-sm font-semibold text-emerald-600">{e.scorePercent}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Share Achievement */}
      {user && (
        <section className="flex justify-center pb-4">
          <Link
            href={`/share/leaderboard?examCategory=${encodeURIComponent(examCategory)}`}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700"
          >
            <Share2 className="h-4 w-4" />
            Share Achievement
          </Link>
        </section>
      )}

      {!user && (
        <p className="text-center text-sm text-slate-500">
          <Link href="/auth/signup?returnTo=%2Fleaderboard" className="font-medium text-emerald-600 underline">
            Sign up
          </Link>{" "}
          to see your rank and share results.
        </p>
      )}
    </div>
  );
}
