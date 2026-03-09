export type AppUser = {
  id: string;
  name: string;
  email: string;
  className: string;
  goal: string;
  credits: number;
  role: "STUDENT" | "TEACHER" | "COUNSELOR" | "ADMIN";
  institutionId?: string | null;
  institutionName?: string | null;
};

export type AuthSuccessResponse = {
  ok: true;
  token: string;
  user: AppUser;
};

export type AuthErrorResponse = {
  ok: false;
  message: string;
};

export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

export type WalletResponse =
  | {
      ok: true;
      user: AppUser;
      message?: string;
    }
  | {
      ok: false;
      message: string;
    };

export type CreditTransactionItem = {
  id: string;
  delta: number;
  reason: string;
  balanceAfter: number;
  createdAt: string;
};

export type ActivityItem = {
  id: string;
  type: "study_help_booking" | "exam_attempt" | "course_enrollment" | "career_assessment";
  title: string;
  details: string;
  creditsUsed: number;
  createdAt: string;
};

export type ExamAttemptItem = {
  id: string;
  examName: string;
  status: string;
  creditsUsed: number;
  scorePercent?: number | null;
  createdAt: string;
  completedAt?: string | null;
};

export type CourseEnrollmentItem = {
  id: string;
  courseTitle: string;
  status: string;
  creditsUsed: number;
  progressPercent: number;
  createdAt: string;
  completedAt?: string | null;
};

export type CareerReport = {
  id: string;
  pathwayTitle: string;
  matchScore: number;
  reportSummary: string;
  recommendedCourses: string[];
  createdAt: string;
};

export type StudyHelpPlan = {
  id: string;
  label: string;
  details: string;
  cost: number;
};

export type StudyHelpSlot = {
  id: string;
  planId: string;
  tutorName: string;
  startAt: string;
  endAt: string;
  isBooked: boolean;
};

export type ExamItem = {
  id: string;
  name: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  cost: number;
};

export type CourseItem = {
  id: string;
  title: string;
  mode: string;
  credits: number;
};

export type CareerPathway = {
  id: string;
  title: string;
  nextStep: string;
  cost: number;
};

export type CatalogResponse = {
  studyHelpPlans: StudyHelpPlan[];
  examCategories: string[];
  exams: ExamItem[];
  courses: CourseItem[];
  careerPathways: CareerPathway[];
};

export type TeacherDashboardData = {
  teacher: {
    id: string;
    name: string;
    institutionName: string | null;
    subjects: string[];
    classLevels: string[];
    verified: boolean;
  };
  classLoad: Array<{
    id: string;
    className: string;
    section: string | null;
    subject: string;
    studentCount: number;
  }>;
  atRiskStudents: Array<{
    studentId: string;
    studentName: string;
    reasonCode: string;
    status: string;
    dueAt?: string | null;
  }>;
  pendingEvaluations: number;
  openInterventions: number;
};

export type AdminUserItem = {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "COUNSELOR" | "ADMIN";
  className: string;
  credits: number;
  institutionName?: string | null;
  isActive: boolean;
  createdAt: string;
};

export type AnalyticsReport = {
  totals: {
    students: number;
    teachers: number;
    institutions: number;
    activeApplications: number;
  };
  microCategories: Array<{
    category: string;
    label: string;
    value: number;
    deltaLabel: string;
  }>;
  topCohorts: Array<{
    cohort: string;
    avgScore: number;
    avgCourseProgress: number;
    challengeParticipation: number;
  }>;
};

export type AdmissionApplicationItem = {
  id: string;
  institutionName: string;
  studentName: string;
  ownerName: string | null;
  stage: string;
  targetProgram: string;
  intakeYear: number;
  deadlineAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SkillProgramItem = {
  id: string;
  title: string;
  description: string;
  mode: "LIVE" | "RECORDED" | "HYBRID";
  creditsCost: number;
  isPublished: boolean;
  institutionName: string;
  moduleCount: number;
  liveSessionCount: number;
};

export type CareerGuidancePlan = {
  profile: {
    interests: string[];
    strengths: string[];
    preferredStates: string[];
    budgetBand: string;
    targetExamTimeline: string;
    psychometricSummary: string;
  } | null;
  recommendations: Array<{
    title: string;
    rationale: string;
    nextAction: string;
    successProbability: number;
  }>;
  admissionsChecklist: string[];
};

export type AuditLogItem = {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  payload: string | null;
  createdAt: string;
};

export type TrainingPlanItem = {
  id: string;
  examCategory: string;
  planData: unknown;
  createdAt: string;
  updatedAt: string;
};
