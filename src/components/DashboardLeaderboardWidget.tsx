"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";

type Props = {
  onViewLeaderboard: () => void;
};

export default function DashboardLeaderboardWidget({ onViewLeaderboard }: Props) {
  const { getAuthHeaders } = useAppSession();
  const [ranks, setRanks] = useState<{ districtRank?: number; stateRank?: number; globalRank?: number } | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [weeklyTop, setWeeklyTop] = useState<{ examCategory: string; name: string; scorePercent: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [ranksRes, streakRes, toppersRes] = await Promise.all([
          fetch("/api/leaderboard/my-ranks?examCategory=JEE", { headers: getAuthHeaders() }),
          fetch("/api/exam-coaching/streak", { headers: getAuthHeaders() }),
          fetch("/api/leaderboard/weekly-toppers")
        ]);
        const ranksJson = (await ranksRes.json()) as {
          ok?: boolean;
          districtRank?: number;
          stateRank?: number;
          globalRank?: number;
        };
        const streakJson = (await streakRes.json()) as { ok?: boolean; streakCount?: number };
        const toppersJson = (await toppersRes.json()) as {
          ok?: boolean;
          toppers?: Array<{ examCategory: string; name: string; scorePercent: number }>;
        };
        if (ranksJson.ok) {
          setRanks({
            districtRank: ranksJson.districtRank,
            stateRank: ranksJson.stateRank,
            globalRank: ranksJson.globalRank
          });
        }
        if (streakJson.ok && typeof streakJson.streakCount === "number") {
          setStreak(streakJson.streakCount);
        }
        if (toppersJson.toppers && toppersJson.toppers.length > 0) {
          setWeeklyTop(toppersJson.toppers[0]);
        }
      } catch {
        // ignore errors, keep widget minimal
      }
    })();
  }, [getAuthHeaders]);

  return (
    <section className="space-y-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Your Rank &amp; Streak</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">Stay ahead every week</p>
        </div>
        <button
          type="button"
          onClick={onViewLeaderboard}
          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
        >
          View Leaderboard
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="text-xs text-slate-500">District</p>
          <p className="text-lg font-bold text-slate-900">{ranks?.districtRank ?? "—"}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="text-xs text-slate-500">State</p>
          <p className="text-lg font-bold text-slate-900">{ranks?.stateRank ?? "—"}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-2">
          <p className="text-xs text-slate-500">Global</p>
          <p className="text-lg font-bold text-slate-900">{ranks?.globalRank ?? "—"}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-amber-700">
          <Flame className="h-4 w-4" />
          <span>{streak > 0 ? `${streak} day practice streak` : "Start your streak today"}</span>
        </div>
        {weeklyTop && (
          <div className="flex items-center gap-1 text-slate-700">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span className="truncate text-xs">
              Weekly Top: <span className="font-semibold">{weeklyTop.examCategory}</span>
            </span>
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-slate-500">
        Only students who enable leaderboard visibility appear in public rankings.
      </p>
    </section>
  );
}
