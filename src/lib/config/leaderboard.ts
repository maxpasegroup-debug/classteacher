/**
 * Leaderboard and achievement config: exam mapping, anti-cheat, improvement threshold.
 */

import { exams } from "@/lib/server/catalog";

export const LEADERBOARD_CATEGORIES = ["NEET", "JEE", "KEAM", "CUET"] as const;
export type LeaderboardCategory = (typeof LEADERBOARD_CATEGORIES)[number];

/** Map examId to leaderboard category and expected duration in minutes */
export const EXAM_TO_LEADERBOARD: Record<
  string,
  { category: LeaderboardCategory; durationMinutes: number }
> = {
  "ex-kerala-eng": { category: "KEAM", durationMinutes: 30 },
  "ex-all-india-apt": { category: "JEE", durationMinutes: 20 },
  "ex-lang-memory": { category: "CUET", durationMinutes: 25 },
};

/** Minimum fraction of expected duration to accept attempt (anti-cheat) */
export const MIN_DURATION_FRACTION = 0.25;

/** Minimum minutes between two leaderboard entries for same user+category (anti-cheat) */
export const MIN_MINUTES_BETWEEN_ENTRIES = 10;

/** Improvement percent (newScore - oldScore) to grant "Most Improved" award */
export const IMPROVEMENT_AWARD_THRESHOLD_PERCENT = 15;

export function getLeaderboardCategoryAndDuration(examId: string): {
  category: LeaderboardCategory;
  durationMinutes: number;
} | null {
  const mapped = EXAM_TO_LEADERBOARD[examId];
  if (mapped) return mapped;
  const exam = exams.find((e) => e.id === examId);
  if (!exam) return null;
  const match = exam.duration.match(/(\d+)\s*min/);
  const durationMinutes = match ? parseInt(match[1], 10) : 20;
  return {
    category: "JEE",
    durationMinutes,
  };
}
