import { CareerPathway, CourseItem, ExamItem, StudyHelpPlan } from "@/lib/contracts";

export const studyHelpPlans: StudyHelpPlan[] = [
  { id: "sh-hourly", label: "Hourly booking", details: "One-off live tuition support", cost: 20 },
  { id: "sh-weekly", label: "Weekly plan", details: "3 live sessions per week", cost: 60 },
  { id: "sh-monthly", label: "Monthly plan", details: "12 sessions + mentor review", cost: 220 }
];

export const examCategories = [
  "All India Entrance",
  "Kerala Entrance",
  "Government Exams",
  "Aptitude",
  "IQ/EQ/CQ Tests",
  "Memory Tests",
  "Language Tests"
];

export const exams: ExamItem[] = [
  {
    id: "ex-kerala-eng",
    name: "Kerala Engineering Entrance Drill",
    duration: "30 min",
    difficulty: "Medium",
    cost: 12
  },
  {
    id: "ex-all-india-apt",
    name: "All India Aptitude Sprint",
    duration: "20 min",
    difficulty: "Hard",
    cost: 15
  },
  {
    id: "ex-lang-memory",
    name: "Language + Memory Combo",
    duration: "25 min",
    difficulty: "Medium",
    cost: 10
  }
];

export const courses: CourseItem[] = [
  { id: "c-public-speaking", title: "Public Speaking", mode: "Live + Recorded", credits: 35 },
  { id: "c-coding-basics", title: "Coding Basics", mode: "Recorded", credits: 25 },
  { id: "c-communication", title: "Communication Skills", mode: "Live", credits: 30 }
];

export const careerPathways: CareerPathway[] = [
  { id: "p-eng", title: "Engineering Foundations", nextStep: "Complete aptitude challenge", cost: 18 },
  {
    id: "p-health",
    title: "Allied Health Introduction",
    nextStep: "Explore paramedical programs",
    cost: 20
  },
  { id: "p-creative", title: "Creative Careers", nextStep: "Build mini portfolio activity", cost: 15 }
];
