import { ExamAttemptItem } from "@/lib/contracts";

export type CoachingSummary = {
  accuracy: number;
  completedAttempts: number;
  averageScore: number;
};

export type SwotProfile = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

export type WeeklyTrainingPlan = {
  weeks: Array<{
    label: string;
    focusAreas: string[];
    mockTests: number;
  }>;
};

export function buildCoachingSummary(attempts: ExamAttemptItem[]): CoachingSummary {
  const completed = attempts.filter((item) => item.scorePercent != null);
  if (completed.length === 0) {
    return { accuracy: 0, completedAttempts: 0, averageScore: 0 };
  }
  const totalScore = completed.reduce((sum, item) => sum + (item.scorePercent || 0), 0);
  const averageScore = Math.round(totalScore / completed.length);
  return {
    accuracy: averageScore,
    completedAttempts: completed.length,
    averageScore
  };
}

export function buildSwotProfile(summary: CoachingSummary, examCategory: string): SwotProfile {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  if (summary.accuracy >= 80) {
    strengths.push("Strong conceptual understanding across most tested topics.");
  } else if (summary.accuracy >= 60) {
    strengths.push("Good baseline understanding with room to sharpen problem-solving speed.");
    opportunities.push("Convert partial familiarity into exam-ready mastery with focused drills.");
  } else {
    weaknesses.push("Core concepts need strengthening before attempting full-length mocks.");
    threats.push("Low confidence under timed conditions can impact entrance performance.");
  }

  if (["Medical Entrance", "Engineering Entrance", "Kerala Entrance Exams"].includes(examCategory)) {
    opportunities.push("Prioritize previous year entrance-style questions for this category.");
  }

  if (summary.completedAttempts < 3) {
    opportunities.push("Increase mock test frequency to stabilise performance trends.");
  } else {
    strengths.push("You have started to build a consistent mock-test habit.");
  }

  if (summary.accuracy < 70) {
    threats.push("Without a structured weekly plan, score improvement may plateau.");
  }

  if (opportunities.length === 0) {
    opportunities.push("Maintain current pace and gradually add mixed difficulty questions.");
  }

  if (strengths.length === 0) {
    strengths.push("You are taking the right first step by running diagnostics early.");
  }

  return { strengths, weaknesses, opportunities, threats };
}

export function buildWeeklyTrainingPlan(summary: CoachingSummary, examCategory: string): WeeklyTrainingPlan {
  const focusLabel =
    examCategory === "Medical Entrance"
      ? "Biology + Chemistry"
      : examCategory === "Engineering Entrance"
        ? "Physics + Algebra"
        : "Mixed reasoning and core subjects";

  const baseMocks = summary.completedAttempts >= 3 ? 2 : 1;

  return {
    weeks: [
      {
        label: "Week 1",
        focusAreas: [`Diagnostic review`, `${focusLabel} fundamentals`, "Timed practice blocks (30–40 min)"],
        mockTests: baseMocks
      },
      {
        label: "Week 2",
        focusAreas: [`Targeted drills on weak topics`, "Mixed-topic section tests", "Speed-building exercises"],
        mockTests: baseMocks + 1
      },
      {
        label: "Week 3",
        focusAreas: ["Full-length mock tests", "Error log review", "Revision of high-yield concepts"],
        mockTests: baseMocks + 1
      },
      {
        label: "Week 4",
        focusAreas: ["Exam-style simulations", "Time management strategies", "Light-weight revision before mocks"],
        mockTests: baseMocks + 2
      }
    ]
  };
}

