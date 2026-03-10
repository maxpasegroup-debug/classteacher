/**
 * Credit costs for AI Exam Coaching and related actions.
 * All exam and coaching endpoints should reference this config.
 */
export const CREDITS = {
  /** One practice question (adaptive) */
  PRACTICE_QUESTION: 1,
  /** Short quiz / mini test */
  MINI_TEST: 20,
  /** Full diagnostic / mock test */
  FULL_MOCK_TEST: 50,
  /** AI analysis (e.g. after diagnostic) */
  AI_ANALYSIS: 30,
  /** Save/view generated training plan */
  TRAINING_PLAN: 40,
} as const;

export const FREE_DAILY_PRACTICE_LIMIT = 5;

export const LOW_CREDIT_WARNING_THRESHOLD = 100;

export type CreditCostKey = keyof typeof CREDITS;
