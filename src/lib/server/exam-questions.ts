export type QuestionDifficulty = "easy" | "medium" | "hard";

export type ExamQuestion = {
  id: string;
  examType: string;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  timeEstimate: number; // seconds
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  tip: string;
};

export const examQuestions: ExamQuestion[] = [
  {
    id: "q-neet-bio-genetics-1",
    examType: "NEET",
    subject: "Biology",
    topic: "Genetics",
    difficulty: "medium",
    timeEstimate: 60,
    questionText: "In a monohybrid cross, the F2 phenotypic ratio is:",
    options: ["1:2:1", "3:1", "9:3:3:1", "1:1"],
    correctAnswer: "3:1",
    explanation: "A monohybrid cross between two heterozygotes gives a 3:1 dominant to recessive phenotypic ratio.",
    tip: "Remember: mono = one trait, di = two traits."
  },
  {
    id: "q-neet-phy-mech-1",
    examType: "NEET",
    subject: "Physics",
    topic: "Mechanics",
    difficulty: "easy",
    timeEstimate: 75,
    questionText: "The SI unit of force is:",
    options: ["Joule", "Newton", "Pascal", "Watt"],
    correctAnswer: "Newton",
    explanation: "Force is measured in Newtons (N) in the SI system.",
    tip: "Relate F = m × a to units: kg × m/s² = N."
  },
  {
    id: "q-jee-math-algebra-1",
    examType: "JEE_MAIN",
    subject: "Mathematics",
    topic: "Algebra",
    difficulty: "medium",
    timeEstimate: 90,
    questionText: "If a + b = 10 and ab = 21, then a² + b² equals:",
    options: ["58", "16", "79", "100"],
    correctAnswer: "58",
    explanation: "a² + b² = (a + b)² - 2ab = 10² - 2×21 = 100 - 42 = 58.",
    tip: "Use identities to avoid solving for a and b directly."
  },
  {
    id: "q-jee-phy-electricity-1",
    examType: "JEE_MAIN",
    subject: "Physics",
    topic: "Electricity",
    difficulty: "hard",
    timeEstimate: 120,
    questionText: "The equivalent resistance of two equal resistors R in parallel is:",
    options: ["R/2", "2R", "R", "R/4"],
    correctAnswer: "R/2",
    explanation: "For equal resistors in parallel: Req = R/2.",
    tip: "Parallel reduces resistance; series adds it."
  },
  {
    id: "q-keam-math-trig-1",
    examType: "KEAM",
    subject: "Mathematics",
    topic: "Trigonometry",
    difficulty: "easy",
    timeEstimate: 60,
    questionText: "sin²θ + cos²θ is equal to:",
    options: ["0", "1", "sin 2θ", "cos 2θ"],
    correctAnswer: "1",
    explanation: "Fundamental trigonometric identity: sin²θ + cos²θ = 1.",
    tip: "This identity holds for all θ."
  },
  {
    id: "q-cuet-aptitude-1",
    examType: "CUET",
    subject: "Aptitude",
    topic: "Reasoning",
    difficulty: "medium",
    timeEstimate: 75,
    questionText: "If all squares are rectangles, which of the following is always true?",
    options: [
      "All rectangles are squares",
      "No rectangle is a square",
      "Some rectangles may be squares",
      "Squares and rectangles are unrelated"
    ],
    correctAnswer: "Some rectangles may be squares",
    explanation: "Every square is a rectangle, so some rectangles (the squares) are squares.",
    tip: "Visualise sets: square ⊂ rectangle."
  }
];

export function pickQuestionForCategory(
  examCategory: string,
  difficulty: QuestionDifficulty
): ExamQuestion | null {
  const preferredExamTypes =
    examCategory === "Medical Entrance"
      ? ["NEET"]
      : examCategory === "Engineering Entrance"
        ? ["JEE_MAIN", "JEE_ADVANCED", "BITSAT"]
        : examCategory === "Kerala Entrance Exams"
          ? ["KEAM"]
          : examCategory === "National Entrance Exams"
            ? ["CUET", "NDA"]
            : examCategory === "International Exams"
              ? ["SAT", "IELTS"]
              : ["NEET", "JEE_MAIN", "KEAM"];

  const candidates = examQuestions.filter(
    (q) => preferredExamTypes.includes(q.examType) && q.difficulty === difficulty
  );
  if (candidates.length === 0) return null;
  // Simple rotation: pick first for now.
  return candidates[0];
}

