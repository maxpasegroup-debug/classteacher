import { randomUUID } from "crypto";
import { compare, hash } from "bcryptjs";
import {
  ActivityItem,
  AdminUserItem,
  AdmissionApplicationItem,
  AnalyticsReport,
  AuditLogItem,
  AppUser,
  CareerGuidancePlan,
  CareerReport,
  CourseEnrollmentItem,
  ExamAttemptItem,
  SkillProgramItem,
  StudyHelpSlot,
  TeacherDashboardData,
  TrainingPlanItem
} from "@/lib/contracts";
import { careerPathways, courses, examCategories, exams, studyHelpPlans } from "@/lib/server/catalog";
import { prisma } from "@/lib/server/db";
import { ApplicationStage, InterventionStatus, Prisma, ProgramMode, Role } from "@prisma/client";
import { ExamQuestion, QuestionDifficulty, examQuestions, pickQuestionForCategory } from "@/lib/server/exam-questions";
import { CREDITS, FREE_DAILY_PRACTICE_LIMIT } from "@/lib/config/credits";
import {
  getLeaderboardCategoryAndDuration,
  IMPROVEMENT_AWARD_THRESHOLD_PERCENT,
  MIN_DURATION_FRACTION,
  MIN_MINUTES_BETWEEN_ENTRIES
} from "@/lib/config/leaderboard";

const JOINING_BONUS_CREDITS = 1000;
const REFERRAL_CREDITS = 50;
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  className: string;
  goal: string;
  credits: number;
  role?: Role;
  institutionId?: string | null;
  institution?: { name: string } | null;
  inviteCode?: string | null;
  district?: string | null;
  state?: string | null;
  school?: string | null;
  leaderboardOptIn?: boolean;
}): AppUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    className: user.className,
    goal: user.goal,
    credits: user.credits,
    role: user.role ?? "STUDENT",
    institutionId: user.institutionId ?? null,
    institutionName: user.institution?.name ?? null,
    inviteCode: user.inviteCode ?? null,
    district: user.district ?? null,
    state: user.state ?? null,
    school: user.school ?? null,
    leaderboardOptIn: user.leaderboardOptIn ?? true
  };
}

export function signupUser(payload: {
  name: string;
  email: string;
  className: string;
  goal: string;
  password: string;
  inviteCode?: string;
}) {
  return signupUserAsync(payload);
}

export async function signupUserAsync(payload: {
  name: string;
  email: string;
  className: string;
  goal: string;
  password: string;
  inviteCode?: string;
}) {
  const email = payload.email.trim().toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false as const, message: "Email already exists. Please login." };

  let inviteCode = generateInviteCode();
  while (await prisma.user.findUnique({ where: { inviteCode } })) {
    inviteCode = generateInviteCode();
  }

  const passwordHash = await hash(payload.password, 10);
  const newUser = await prisma.user.create({
    data: {
      name: payload.name.trim(),
      email,
      className: payload.className.trim(),
      goal: payload.goal.trim(),
      passwordHash,
      credits: JOINING_BONUS_CREDITS,
      role: "STUDENT",
      inviteCode
    }
  });

  const token = randomUUID();
  await prisma.session.create({
    data: {
      token,
      userId: newUser.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS)
    }
  });
  await prisma.creditTransaction.create({
    data: {
      userId: newUser.id,
      delta: JOINING_BONUS_CREDITS,
      reason: "Joining bonus credits",
      balanceAfter: newUser.credits
    }
  });

  if (payload.inviteCode?.trim()) {
    const referrer = await prisma.user.findFirst({ where: { inviteCode: payload.inviteCode.trim().toUpperCase() } });
    if (referrer && referrer.id !== newUser.id) {
      const existing = await prisma.referral.findUnique({ where: { referredUserId: newUser.id } });
      if (!existing) {
        await prisma.$transaction([
          prisma.referral.create({
            data: { referrerId: referrer.id, referredUserId: newUser.id, creditsAwarded: REFERRAL_CREDITS }
          }),
          prisma.user.update({
            where: { id: referrer.id },
            data: { credits: referrer.credits + REFERRAL_CREDITS }
          }),
          prisma.creditTransaction.create({
            data: {
              userId: referrer.id,
              delta: REFERRAL_CREDITS,
              reason: "Referral: friend joined",
              balanceAfter: referrer.credits + REFERRAL_CREDITS
            }
          })
        ]);
      }
    }
  }

  return { ok: true as const, token, user: toPublicUser(newUser) };
}

export function loginUser(payload: { email: string; password: string }) {
  return loginUserAsync(payload);
}

export async function loginUserAsync(payload: { email: string; password: string }) {
  const email = payload.email.trim().toLowerCase();
  const found = await prisma.user.findUnique({ where: { email }, include: { institution: true } });
  if (!found) return { ok: false as const, message: "Invalid credentials." };
  const matches = await compare(payload.password, found.passwordHash);
  if (!matches) return { ok: false as const, message: "Invalid credentials." };
  const token = randomUUID();
  await prisma.session.create({
    data: {
      token,
      userId: found.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS)
    }
  });
  return { ok: true as const, token, user: toPublicUser(found) };
}

export async function logoutSession(token: string | null) {
  if (!token) return { ok: true as const };
  await prisma.session.deleteMany({ where: { token } });
  return { ok: true as const };
}

export async function createPasswordResetToken(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      ok: true as const,
      message: "If this email exists, reset instructions have been sent."
    };
  }

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      usedAt: null
    }
  });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt
    }
  });

  return {
    ok: true as const,
    message: "If this email exists, reset instructions have been sent.",
    resetTokenPreview: process.env.NODE_ENV !== "production" ? token : undefined
  };
}

export async function resetPasswordWithToken(payload: {
  email: string;
  token: string;
  newPassword: string;
}) {
  const email = payload.email.trim().toLowerCase();
  const resetToken = payload.token.trim();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { ok: false as const, message: "Invalid token or email." };

  const found = await prisma.passwordResetToken.findUnique({
    where: { token: resetToken }
  });
  if (!found || found.userId !== user.id || found.usedAt || found.expiresAt < new Date()) {
    return { ok: false as const, message: "Invalid or expired reset token." };
  }

  const passwordHash = await hash(payload.newPassword, 10);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
    await tx.passwordResetToken.update({
      where: { id: found.id },
      data: { usedAt: new Date() }
    });
    await tx.session.deleteMany({
      where: { userId: user.id }
    });
  });

  return { ok: true as const, message: "Password reset successful. Please login again." };
}

export function getSessionUser(token: string | null) {
  return getSessionUserAsync(token);
}

export async function getSessionUserAsync(token: string | null) {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { institution: true } } }
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } });
    return null;
  }
  return toPublicUser(session.user);
}

export async function updateMyProfile(
  token: string | null,
  payload: { district?: string | null; state?: string | null; school?: string | null }
) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(payload.district !== undefined && { district: payload.district?.trim() || null }),
      ...(payload.state !== undefined && { state: payload.state?.trim() || null }),
      ...(payload.school !== undefined && { school: payload.school?.trim() || null })
    }
  });
  return { ok: true as const, user: toPublicUser(updated) };
}

export function changeCredits(token: string | null, delta: number) {
  return changeCreditsAsync(token, delta);
}

export async function changeCreditsAsync(token: string | null, delta: number) {
  if (!token) return { ok: false as const, message: "Unauthorized." };
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return { ok: false as const, message: "Unauthorized." };
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } });
    return { ok: false as const, message: "Unauthorized." };
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { ok: false as const, message: "Unauthorized." };

  const nextCredits = user.credits + delta;
  if (nextCredits < 0) return { ok: false as const, message: "Not enough credits. Please top up to continue." };

  const updated = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { credits: nextCredits }
    });
    await tx.creditTransaction.create({
      data: {
        userId: user.id,
        delta,
        reason: delta > 0 ? "Credits purchased" : "Credits spent",
        balanceAfter: nextCredits
      }
    });
    return updatedUser;
  });

  return { ok: true as const, user: toPublicUser(updated) };
}

async function getAuthorizedUser(token: string | null) {
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } });
    return null;
  }
  return prisma.user.findUnique({ where: { id: session.userId } });
}

async function deductCreditsWithReason(userId: string, creditsUsed: number, reason: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const nextCredits = user.credits - creditsUsed;
  if (nextCredits < 0) return { ok: false as const, message: "Not enough credits. Please top up to continue." };

  const updated = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: { credits: nextCredits }
    });
    await tx.creditTransaction.create({
      data: {
        userId: user.id,
        delta: -creditsUsed,
        reason,
        balanceAfter: nextCredits
      }
    });
    return updatedUser;
  });
  return { ok: true as const, user: updated };
}

export async function createStudyHelpBooking(token: string | null, planId: string) {
  return createStudyHelpBookingWithSlot(token, planId, null);
}

export async function createStudyHelpBookingWithSlot(
  token: string | null,
  planId: string,
  slotId: string | null
) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const plan = studyHelpPlans.find((item) => item.id === planId);
  if (!plan) return { ok: false as const, message: "Plan not found." };

  let slot = null as {
    id: string;
    tutorName: string;
    startAt: Date;
    endAt: Date;
    isBooked: boolean;
    planId: string;
  } | null;

  if (slotId) {
    slot = await prisma.tutorSlot.findUnique({ where: { id: slotId } });
    if (!slot || slot.planId !== plan.id) {
      return { ok: false as const, message: "Selected slot is not valid for this plan." };
    }
    if (slot.isBooked) {
      return { ok: false as const, message: "Selected slot is already booked." };
    }
  }

  const charged = await deductCreditsWithReason(
    user.id,
    plan.cost,
    `Study Help booking: ${plan.label}${slot ? ` (${slot.tutorName})` : ""}`
  );
  if (!charged.ok) return charged;

  await prisma.$transaction(async (tx) => {
    await tx.studyHelpBooking.create({
      data: {
        userId: user.id,
        planId: plan.id,
        planLabel: plan.label,
        creditsUsed: plan.cost,
        slotId: slot?.id || null,
        tutorName: slot?.tutorName || null,
        slotStartAt: slot?.startAt || null,
        slotEndAt: slot?.endAt || null
      }
    });
    if (slot) {
      await tx.tutorSlot.update({
        where: { id: slot.id },
        data: { isBooked: true }
      });
    }
  });
  return { ok: true as const, user: toPublicUser(charged.user), message: "Booking confirmed." };
}

export async function getStudyHelpSlots(planId?: string) {
  await ensureTutorSlots();
  const where = planId ? { planId } : undefined;
  const slots = await prisma.tutorSlot.findMany({
    where,
    orderBy: { startAt: "asc" },
    take: 20
  });

  const mapped: StudyHelpSlot[] = slots.map((slot) => ({
    id: slot.id,
    planId: slot.planId,
    tutorName: slot.tutorName,
    startAt: slot.startAt.toISOString(),
    endAt: slot.endAt.toISOString(),
    isBooked: slot.isBooked
  }));
  return { ok: true as const, slots: mapped };
}

async function ensureTutorSlots() {
  const count = await prisma.tutorSlot.count();
  if (count > 0) return;

  const tutors = ["Asha Menon", "Rahul Das", "Meera Nair"];
  const planIds = ["sh-hourly", "sh-weekly", "sh-monthly"];
  const base = new Date();
  base.setMinutes(0, 0, 0);

  const slots = [] as Array<{
    planId: string;
    tutorName: string;
    startAt: Date;
    endAt: Date;
  }>;

  for (let day = 0; day < 5; day += 1) {
    for (let index = 0; index < planIds.length; index += 1) {
      const start = new Date(base);
      start.setDate(base.getDate() + day);
      start.setHours(16 + index, 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1);
      slots.push({
        planId: planIds[index],
        tutorName: tutors[(day + index) % tutors.length],
        startAt: start,
        endAt: end
      });
    }
  }

  await prisma.tutorSlot.createMany({ data: slots });
}

export async function createExamAttempt(token: string | null, examId: string) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const exam = exams.find((item) => item.id === examId);
  if (!exam) return { ok: false as const, message: "Exam not found." };

  const creditsCost = CREDITS.FULL_MOCK_TEST;
  const charged = await deductCreditsWithReason(user.id, creditsCost, `Full mock test: ${exam.name}`);
  if (!charged.ok) return charged;

  await prisma.examAttempt.create({
    data: {
      userId: user.id,
      examId: exam.id,
      examName: exam.name,
      creditsUsed: creditsCost,
      status: "started"
    }
  });
  return { ok: true as const, user: toPublicUser(charged.user), message: "Exam started." };
}

export async function createCourseEnrollment(token: string | null, courseId: string) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const course = courses.find((item) => item.id === courseId);
  if (!course) return { ok: false as const, message: "Course not found." };

  const charged = await deductCreditsWithReason(user.id, course.credits, `Course enrolled: ${course.title}`);
  if (!charged.ok) return charged;

  await prisma.courseEnrollment.create({
    data: {
      userId: user.id,
      courseId: course.id,
      courseTitle: course.title,
      creditsUsed: course.credits,
      progressPercent: 0,
      status: "active"
    }
  });
  return { ok: true as const, user: toPublicUser(charged.user), message: "Enrollment successful." };
}

export async function createCareerAssessment(token: string | null, pathwayId: string) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const pathway = careerPathways.find((item) => item.id === pathwayId);
  if (!pathway) return { ok: false as const, message: "Pathway not found." };

  const charged = await deductCreditsWithReason(
    user.id,
    pathway.cost,
    `Career Gene assessment: ${pathway.title}`
  );
  if (!charged.ok) return charged;

  const matchScore = pathway.id === "p-health" ? 82 : pathway.id === "p-eng" ? 79 : 74;
  const recommendedCoursesByPath = {
    "p-health": "Biology Problem Solving,Clinical Communication Basics,Paramedical Aptitude Prep",
    "p-eng": "Advanced Algebra Toolkit,Coding Logic Sprint,Physics Numericals Mastery",
    "p-creative": "Creative Writing Fundamentals,Public Speaking,Digital Design Basics"
  } as Record<string, string>;

  const reportSummaryByPath = {
    "p-health":
      "You show strong observation and care-oriented decision making. Allied Health pathways can fit your aptitude.",
    "p-eng":
      "You show consistent analytical reasoning and persistence in quantitative challenges. Engineering track is recommended.",
    "p-creative":
      "You demonstrate expressive communication and idea generation. Creative and communication-led careers are promising."
  } as Record<string, string>;

  await prisma.careerAssessment.create({
    data: {
      userId: user.id,
      pathwayId: pathway.id,
      pathwayTitle: pathway.title,
      creditsUsed: pathway.cost,
      status: "completed",
      matchScore,
      reportSummary: reportSummaryByPath[pathway.id] || "Career profile generated.",
      recommendedCourses: recommendedCoursesByPath[pathway.id] || ""
    }
  });
  return { ok: true as const, user: toPublicUser(charged.user), message: "Assessment started." };
}

export async function getExamAttempts(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });
  const mapped: ExamAttemptItem[] = attempts.map((item) => ({
    id: item.id,
    examName: item.examName,
    status: item.status,
    creditsUsed: item.creditsUsed,
    scorePercent: item.scorePercent,
    createdAt: item.createdAt.toISOString(),
    completedAt: item.completedAt?.toISOString() || null
  }));
  return { ok: true as const, attempts: mapped };
}

export async function submitExamResult(token: string | null, attemptId: string, scorePercent: number) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== user.id) return { ok: false as const, message: "Attempt not found." };
  if (attempt.status === "completed") return { ok: false as const, message: "Attempt already completed." };

  const charged = await deductCreditsWithReason(user.id, CREDITS.AI_ANALYSIS, "AI Analysis");
  if (!charged.ok) return charged;

  const completedAt = new Date();
  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: "completed",
      scorePercent,
      completedAt
    }
  });
  await updatePracticeStreak(token);

  const lbConfig = getLeaderboardCategoryAndDuration(attempt.examId);
  const durationMs = completedAt.getTime() - attempt.createdAt.getTime();
  const minDurationMs = lbConfig
    ? MIN_DURATION_FRACTION * lbConfig.durationMinutes * 60 * 1000
    : 0;
  const validDuration = durationMs >= minDurationMs;
  const examCategory = lbConfig?.category ?? "JEE";

  let districtRank: number | null = null;
  let stateRank: number | null = null;
  let globalRank: number | null = null;
  let improvementFromLastAttempt: number | null = null;
  let improvementAwardCreated = false;

  if (validDuration && user.leaderboardOptIn !== false) {
    const cutoff = new Date(completedAt.getTime() - MIN_MINUTES_BETWEEN_ENTRIES * 60 * 1000);
    const recent = await prisma.leaderboardEntry.findFirst({
      where: {
        userId: user.id,
        examCategory,
        createdAt: { gte: cutoff }
      }
    });
    if (!recent) {
      await prisma.leaderboardEntry.create({
        data: {
          userId: user.id,
          examCategory,
          scorePercent,
          attemptId,
          district: user.district ?? undefined,
          state: user.state ?? undefined
        }
      });

      const prevBest = await prisma.leaderboardEntry.findFirst({
        where: { userId: user.id, examCategory },
        orderBy: { scorePercent: "desc" },
        skip: 1
      });
      if (prevBest && scorePercent - prevBest.scorePercent >= IMPROVEMENT_AWARD_THRESHOLD_PERCENT) {
        await prisma.improvementAward.create({
          data: {
            userId: user.id,
            examCategory,
            oldScore: prevBest.scorePercent,
            newScore: scorePercent,
            improvementPercent: scorePercent - prevBest.scorePercent
          }
        });
        improvementAwardCreated = true;
      }

      const prevEntry = await prisma.leaderboardEntry.findMany({
        where: { userId: user.id, examCategory },
        orderBy: { createdAt: "desc" },
        skip: 1,
        take: 1
      });
      if (prevEntry[0]) improvementFromLastAttempt = scorePercent - prevEntry[0].scorePercent;

      const ranks = await computeRanksForUser(user.id, examCategory, user.district ?? null, user.state ?? null);
      districtRank = ranks.districtRank;
      stateRank = ranks.stateRank;
      globalRank = ranks.globalRank;
    }
  }

  return {
    ok: true as const,
    message: "Exam result submitted.",
    scorePercent,
    districtRank: districtRank ?? undefined,
    stateRank: stateRank ?? undefined,
    globalRank: globalRank ?? undefined,
    improvementFromLastAttempt: improvementFromLastAttempt ?? undefined,
    improvementAwardCreated
  };
}

async function computeRanksForUser(
  userId: string,
  examCategory: string,
  district: string | null,
  state: string | null
): Promise<{ districtRank: number; stateRank: number; globalRank: number }> {
  const optInUserIds = await prisma.user.findMany({
    where: { leaderboardOptIn: true },
    select: { id: true }
  }).then((list) => new Set(list.map((u) => u.id)));

  const allEntries = await prisma.leaderboardEntry.findMany({
    where: { examCategory, userId: { in: Array.from(optInUserIds) } },
    orderBy: { scorePercent: "desc" },
    include: { user: { select: { id: true } } }
  });

  const bestByUser = new Map<string, number>();
  for (const e of allEntries) {
    const cur = bestByUser.get(e.userId);
    if (cur === undefined || e.scorePercent > cur) bestByUser.set(e.userId, e.scorePercent);
  }
  const globalSorted = [...bestByUser.entries()].sort((a, b) => b[1] - a[1]);
  const globalRank = (globalSorted.findIndex(([id]) => id === userId) + 1) || globalSorted.length + 1;

  const districtEntries = district
    ? allEntries.filter((e) => e.district === district)
    : allEntries;
  const districtByUser = new Map<string, number>();
  for (const e of districtEntries) {
    const cur = districtByUser.get(e.userId);
    if (cur === undefined || e.scorePercent > cur) districtByUser.set(e.userId, e.scorePercent);
  }
  const districtSorted = [...districtByUser.entries()].sort((a, b) => b[1] - a[1]);
  const districtRank = (districtSorted.findIndex(([id]) => id === userId) + 1) || districtSorted.length + 1;

  const stateEntries = state ? allEntries.filter((e) => e.state === state) : allEntries;
  const stateByUser = new Map<string, number>();
  for (const e of stateEntries) {
    const cur = stateByUser.get(e.userId);
    if (cur === undefined || e.scorePercent > cur) stateByUser.set(e.userId, e.scorePercent);
  }
  const stateSorted = [...stateByUser.entries()].sort((a, b) => b[1] - a[1]);
  const stateRank = (stateSorted.findIndex(([id]) => id === userId) + 1) || stateSorted.length + 1;

  return { districtRank, stateRank, globalRank };
}

export async function getLeaderboardEntries(
  type: "district" | "state" | "global",
  value: string | null,
  examCategory: string,
  limit = 10
) {
  const optInIds = await prisma.user.findMany({
    where: { leaderboardOptIn: true },
    select: { id: true }
  }).then((list) => new Set(list.map((u) => u.id)));

  const baseWhere: { examCategory: string; userId: { in: string[] }; district?: string; state?: string } = {
    examCategory,
    userId: { in: Array.from(optInIds) }
  };
  if (type === "district" && value) baseWhere.district = value;
  if (type === "state" && value) baseWhere.state = value;

  const entries = await prisma.leaderboardEntry.findMany({
    where: baseWhere,
    orderBy: { scorePercent: "desc" },
    take: limit * 3,
    include: { user: { select: { id: true, name: true } } }
  });

  const bestByUser = new Map<string, { scorePercent: number; name: string }>();
  for (const e of entries) {
    const cur = bestByUser.get(e.userId);
    if (!cur || e.scorePercent > cur.scorePercent) {
      bestByUser.set(e.userId, { scorePercent: e.scorePercent, name: e.user.name });
    }
  }
  const sorted = [...bestByUser.entries()]
    .sort((a, b) => b[1].scorePercent - a[1].scorePercent)
    .slice(0, limit)
    .map(([userId, v], i) => ({ rank: i + 1, userId, name: v.name, scorePercent: v.scorePercent }));

  return { ok: true as const, entries: sorted };
}

export async function getMyRanks(token: string | null, examCategory: string) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const ranks = await computeRanksForUser(
    user.id,
    examCategory,
    user.district ?? null,
    user.state ?? null
  );
  return {
    ok: true as const,
    districtRank: ranks.districtRank,
    stateRank: ranks.stateRank,
    globalRank: ranks.globalRank
  };
}

export async function getWeeklyToppers(examCategory?: string) {
  const now = new Date();
  const day = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const optInIds = await prisma.user.findMany({
    where: { leaderboardOptIn: true },
    select: { id: true }
  }).then((list) => new Set(list.map((u) => u.id)));

  const where: { createdAt: { gte: Date; lt: Date }; userId: { in: string[] }; examCategory?: string } = {
    createdAt: { gte: weekStart, lt: weekEnd },
    userId: { in: Array.from(optInIds) }
  };
  if (examCategory) where.examCategory = examCategory;

  const entries = await prisma.leaderboardEntry.findMany({
    where,
    orderBy: { scorePercent: "desc" },
    include: { user: { select: { id: true, name: true } } }
  });

  const bestByCategory = new Map<string, { userId: string; name: string; scorePercent: number }>();
  for (const e of entries) {
    const cur = bestByCategory.get(e.examCategory);
    if (!cur || e.scorePercent > cur.scorePercent) {
      bestByCategory.set(e.examCategory, {
        userId: e.userId,
        name: e.user.name,
        scorePercent: e.scorePercent
      });
    }
  }
  const toppers = [...bestByCategory.entries()].map(([cat, v]) => ({
    examCategory: cat,
    userId: v.userId,
    name: v.name,
    scorePercent: v.scorePercent,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString()
  }));
  return { ok: true as const, toppers };
}

export async function getImprovementAwards(token: string | null, limit = 5) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const awards = await prisma.improvementAward.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit
  });
  return {
    ok: true as const,
    awards: awards.map((a) => ({
      examCategory: a.examCategory,
      oldScore: a.oldScore,
      newScore: a.newScore,
      improvementPercent: a.improvementPercent,
      createdAt: a.createdAt.toISOString()
    }))
  };
}

export async function updateLeaderboardOptIn(token: string | null, optIn: boolean) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  await prisma.user.update({
    where: { id: user.id },
    data: { leaderboardOptIn: optIn }
  });
  return { ok: true as const, leaderboardOptIn: optIn };
}

export async function getLeaderboardOptIn(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { leaderboardOptIn: true }
  });
  return { ok: true as const, leaderboardOptIn: u?.leaderboardOptIn ?? true };
}

export async function getTrainingPlan(token: string | null, examCategory: string) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };

  const plan = await prisma.trainingPlan.findUnique({
    where: {
      userId_examCategory: {
        userId: user.id,
        examCategory
      }
    }
  });

  if (!plan) {
    return { ok: true as const, plan: null as TrainingPlanItem | null };
  }

  const mapped: TrainingPlanItem = {
    id: plan.id,
    examCategory: plan.examCategory,
    planData: plan.planData,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString()
  };
  return { ok: true as const, plan: mapped };
}

export async function saveTrainingPlan(
  token: string | null,
  examCategory: string,
  planData: Prisma.InputJsonValue | unknown
) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };

  const charged = await deductCreditsWithReason(user.id, CREDITS.TRAINING_PLAN, "Training plan saved");
  if (!charged.ok) return charged;

  const jsonPlan: Prisma.InputJsonValue = planData as Prisma.InputJsonValue;
  const plan = await prisma.trainingPlan.upsert({
    where: {
      userId_examCategory: {
        userId: user.id,
        examCategory
      }
    },
    create: {
      userId: user.id,
      examCategory,
      planData: jsonPlan
    },
    update: {
      planData: jsonPlan
    }
  });

  const mapped: TrainingPlanItem = {
    id: plan.id,
    examCategory: plan.examCategory,
    planData: plan.planData,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString()
  };

  return { ok: true as const, plan: mapped };
}

export async function updateTopicPerformance(
  token: string | null,
  payload: { subject: string; topic: string; correct: boolean; timeSeconds: number }
) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };

  const existing = await prisma.topicPerformance.findUnique({
    where: {
      userId_subject_topic: {
        userId: user.id,
        subject: payload.subject,
        topic: payload.topic
      }
    }
  });

  const attempts = existing?.attempts ?? 0;
  const accuracy = existing?.accuracy ?? 0;
  const avgTime = existing?.averageTime ?? 0;

  const nextAttempts = attempts + 1;
  const correctValue = payload.correct ? 1 : 0;
  const nextAccuracy = ((accuracy * attempts + correctValue * 100) / nextAttempts) || 0;
  const nextAvgTime = ((avgTime * attempts + payload.timeSeconds) / nextAttempts) || payload.timeSeconds;

  const record = await prisma.topicPerformance.upsert({
    where: {
      userId_subject_topic: {
        userId: user.id,
        subject: payload.subject,
        topic: payload.topic
      }
    },
    create: {
      userId: user.id,
      subject: payload.subject,
      topic: payload.topic,
      accuracy: nextAccuracy,
      averageTime: nextAvgTime,
      attempts: nextAttempts
    },
    update: {
      accuracy: nextAccuracy,
      averageTime: nextAvgTime,
      attempts: nextAttempts
    }
  });

  return { ok: true as const, performance: record };
}

export async function getTopicAnalytics(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };

  const rows = await prisma.topicPerformance.findMany({ where: { userId: user.id } });
  if (rows.length === 0) {
    return {
      ok: true as const,
      accuracy: 0,
      averageTime: 0,
      strongTopics: [] as string[],
      weakTopics: [] as string[]
    };
  }

  const totalAttempts = rows.reduce((sum, row) => sum + row.attempts, 0);
  const weightedAccuracy =
    rows.reduce((sum, row) => sum + row.accuracy * row.attempts, 0) / (totalAttempts || 1);
  const weightedTime =
    rows.reduce((sum, row) => sum + row.averageTime * row.attempts, 0) / (totalAttempts || 1);

  const sortedByAccuracy = [...rows].sort((a, b) => a.accuracy - b.accuracy);
  const weakTopics = sortedByAccuracy
    .slice(0, 3)
    .map((row) => `${row.subject}: ${row.topic}`);
  const strongTopics = sortedByAccuracy
    .slice(-3)
    .reverse()
    .map((row) => `${row.subject}: ${row.topic}`);

  return {
    ok: true as const,
    accuracy: Math.round(weightedAccuracy),
    averageTime: Math.round(weightedTime),
    strongTopics,
    weakTopics
  };
}

function pickDifficultyForAccuracy(accuracy: number | null | undefined): QuestionDifficulty {
  if (accuracy == null) return "medium";
  if (accuracy < 50) return "easy";
  if (accuracy <= 75) return "medium";
  return "hard";
}

export async function nextPracticeQuestion(
  token: string | null,
  examCategory: string,
  lastAnswer?: { question: ExamQuestion; correct: boolean; timeSeconds: number }
) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };

  if (lastAnswer) {
    await updateTopicPerformance(token, {
      subject: lastAnswer.question.subject,
      topic: lastAnswer.question.topic,
      correct: lastAnswer.correct,
      timeSeconds: lastAnswer.timeSeconds
    });
  }

  // Credit check: 1 credit per question, or 5 free per day when credits are 0
  const today = new Date().toISOString().slice(0, 10);
  if (user.credits >= CREDITS.PRACTICE_QUESTION) {
    const charged = await deductCreditsWithReason(user.id, CREDITS.PRACTICE_QUESTION, "Practice question");
    if (!charged.ok) return charged;
  } else {
    const freeRecord = await prisma.freePracticeDaily.findUnique({
      where: { userId_date: { userId: user.id, date: today } }
    });
    const used = freeRecord?.count ?? 0;
    if (used >= FREE_DAILY_PRACTICE_LIMIT) {
      return { ok: false as const, message: "Not enough credits. Please top up to continue." };
    }
    await prisma.freePracticeDaily.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      create: { userId: user.id, date: today, count: used + 1 },
      update: { count: used + 1 }
    });
  }

  // Get topic-level accuracy for adaptive difficulty
  const perf = lastAnswer
    ? await prisma.topicPerformance.findUnique({
        where: {
          userId_subject_topic: {
            userId: user.id,
            subject: lastAnswer.question.subject,
            topic: lastAnswer.question.topic
          }
        }
      })
    : null;

  const difficulty = pickDifficultyForAccuracy(perf?.accuracy ?? null);
  const question = pickQuestionForCategory(examCategory, difficulty);
  if (!question) {
    return { ok: false as const, message: "No questions available for this category yet." };
  }

  // Do not leak correct answer before user submits
  const safeQuestion = {
    id: question.id,
    examType: question.examType,
    subject: question.subject,
    topic: question.topic,
    difficulty: question.difficulty,
    timeEstimate: question.timeEstimate,
    questionText: question.questionText,
    options: question.options
  };

  return { ok: true as const, question: safeQuestion };
}

export async function evaluatePracticeAnswer(
  token: string | null,
  payload: { examCategory: string; questionId: string; selectedOption: string; timeSeconds: number }
) {
  const question = examQuestions.find((q) => q.id === payload.questionId);
  if (!question) {
    return { ok: false as const, message: "Question not found." };
  }
  const correct = question.correctAnswer === payload.selectedOption;
  const update = await nextPracticeQuestion(token, payload.examCategory, {
    question,
    correct,
    timeSeconds: payload.timeSeconds
  });
  await updatePracticeStreak(token);
  if (!update.ok) {
    return {
      ok: true as const,
      correct,
      explanation: question.explanation,
      correctAnswer: question.correctAnswer,
      tip: question.tip
    };
  }
  return {
    ok: true as const,
    correct,
    explanation: question.explanation,
    correctAnswer: question.correctAnswer,
    tip: question.tip,
    nextQuestion: update.question
  };
}

export async function getSimpleLeaderboard() {
  const attempts = await prisma.examAttempt.findMany({
    where: { scorePercent: { not: null } },
    orderBy: { scorePercent: "desc" },
    take: 10,
    include: { user: true }
  });

  return {
    ok: true as const,
    entries: attempts.map((row) => ({
      name: row.user.name,
      scorePercent: row.scorePercent ?? 0
    }))
  };
}

export async function getPracticeStreak(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const streak = await prisma.practiceStreak.findUnique({ where: { userId: user.id } });
  return {
    ok: true as const,
    streakCount: streak?.streakCount ?? 0,
    lastPracticeAt: streak?.lastPracticeAt?.toISOString() ?? null
  };
}

export async function updatePracticeStreak(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.practiceStreak.findUnique({ where: { userId: user.id } });
  const last = existing?.lastPracticeAt ? new Date(existing.lastPracticeAt) : null;
  const lastDay = last ? new Date(last) : null;
  if (lastDay) lastDay.setHours(0, 0, 0, 0);

  const diffDays = lastDay ? Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  let nextCount = 1;
  if (existing) {
    if (diffDays === 0) nextCount = existing.streakCount;
    else if (diffDays === 1) nextCount = existing.streakCount + 1;
  }

  await prisma.practiceStreak.upsert({
    where: { userId: user.id },
    create: { userId: user.id, lastPracticeAt: new Date(), streakCount: nextCount },
    update: { lastPracticeAt: new Date(), streakCount: nextCount }
  });
  return { ok: true as const, streakCount: nextCount };
}

export async function getWeeklyReport(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [attempts, topicRows] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { userId: user.id, completedAt: { not: null, gte: since } }
    }),
    prisma.topicPerformance.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" } })
  ]);

  const practiceTests = attempts.length;
  const accuracy =
    attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + (a.scorePercent ?? 0), 0) / attempts.length)
      : topicRows.length > 0
        ? Math.round(topicRows.reduce((s, r) => s + r.accuracy * r.attempts, 0) / topicRows.reduce((s, r) => s + r.attempts, 0) || 1)
        : 0;
  const sorted = [...topicRows].sort((a, b) => a.accuracy - b.accuracy);
  const weakSubject = sorted[0] ? `${sorted[0].subject}` : "—";
  const strongSubject = sorted.length > 0 ? `${sorted[sorted.length - 1].subject}` : "—";

  return {
    ok: true as const,
    practiceTests,
    accuracy,
    strongSubject,
    weakSubject
  };
}

export async function getShareCardData(token: string | null, examCategory?: string) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };

  const category = examCategory || "NEET";
  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id, scorePercent: { not: null } },
    orderBy: { createdAt: "asc" }
  });
  const topicPerf = await prisma.topicPerformance.findMany({ where: { userId: user.id } });
  const initialAccuracy =
    attempts.length > 0 ? (attempts[0].scorePercent ?? 0) : topicPerf.length > 0 ? Math.round(topicPerf[0].accuracy) : 0;
  const recentAccuracy =
    attempts.length > 0
      ? (attempts[attempts.length - 1].scorePercent ?? 0)
      : topicPerf.length > 0
        ? Math.round(
            topicPerf.reduce((s, r) => s + r.accuracy * r.attempts, 0) / topicPerf.reduce((s, r) => s + r.attempts, 0) || 1
          )
        : 0;
  const rank = await getRankForUser(user.id, category);
  const ranks = await computeRanksForUser(user.id, category, user.district ?? null, user.state ?? null);

  return {
    ok: true as const,
    name: user.name,
    examCategory: category,
    initialAccuracy,
    currentAccuracy: recentAccuracy,
    improvement: recentAccuracy - initialAccuracy,
    rank,
    districtRank: ranks.districtRank,
    stateRank: ranks.stateRank,
    globalRank: ranks.globalRank
  };
}

async function getRankForUser(userId: string, examCategory?: string): Promise<number> {
  const attempts = await prisma.examAttempt.findMany({
    where: { scorePercent: { not: null } },
    orderBy: { scorePercent: "desc" },
    include: { user: true }
  });
  const seen = new Set<string>();
  const ranked: { userId: string }[] = [];
  for (const a of attempts) {
    if (!seen.has(a.userId)) {
      seen.add(a.userId);
      ranked.push({ userId: a.userId });
    }
  }
  const idx = ranked.findIndex((r) => r.userId === userId);
  return idx === -1 ? ranked.length + 1 : idx + 1;
}

export async function getLeaderboard(type: "state" | "district" | "school", value: string, limit = 10) {
  const where: Record<string, unknown> = {};
  if (type === "state" && value) where.state = value;
  if (type === "district" && value) where.district = value;
  if (type === "school" && value) where.school = value;

  const users = await prisma.user.findMany({
    where: { ...where, role: "STUDENT" },
    select: { id: true }
  });
  const userIds = users.map((u) => u.id);
  const attempts = await prisma.examAttempt.findMany({
    where: { userId: { in: userIds }, scorePercent: { not: null } },
    orderBy: { scorePercent: "desc" },
    take: limit * 3,
    include: { user: true }
  });
  const byUser = new Map<string, { total: number; count: number }>();
  for (const a of attempts) {
    const cur = byUser.get(a.userId) ?? { total: 0, count: 0 };
    cur.total += a.scorePercent ?? 0;
    cur.count += 1;
    byUser.set(a.userId, cur);
  }
  const sorted = [...byUser.entries()]
    .map(([userId, v]) => ({ userId, avg: v.total / v.count }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, limit);
  const userIdOrder = sorted.map((s) => s.userId);
  const userMap = await prisma.user.findMany({ where: { id: { in: userIdOrder } }, select: { id: true, name: true } }).then((list) => new Map(list.map((u) => [u.id, u.name])));
  return {
    ok: true as const,
    entries: sorted.map((s, i) => ({ rank: i + 1, name: userMap.get(s.userId) ?? "—", scorePercent: Math.round(s.avg) }))
  };
}

export async function getUserInviteCode(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const u = await prisma.user.findUnique({ where: { id: user.id }, select: { inviteCode: true } });
  const code = u?.inviteCode ?? null;
  return { ok: true as const, inviteCode: code };
}

export async function getCourseEnrollments(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20
  });
  const mapped: CourseEnrollmentItem[] = enrollments.map((item) => ({
    id: item.id,
    courseTitle: item.courseTitle,
    status: item.status,
    creditsUsed: item.creditsUsed,
    progressPercent: item.progressPercent,
    createdAt: item.createdAt.toISOString(),
    completedAt: item.completedAt?.toISOString() || null
  }));
  return { ok: true as const, enrollments: mapped };
}

export async function updateCourseProgress(token: string | null, enrollmentId: string, delta: number) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const enrollment = await prisma.courseEnrollment.findUnique({ where: { id: enrollmentId } });
  if (!enrollment || enrollment.userId !== user.id) return { ok: false as const, message: "Enrollment not found." };

  const nextProgress = Math.min(100, Math.max(0, enrollment.progressPercent + delta));
  const isCompleted = nextProgress >= 100;
  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPercent: nextProgress,
      status: isCompleted ? "completed" : "active",
      completedAt: isCompleted ? new Date() : null
    }
  });
  return { ok: true as const, message: isCompleted ? "Course completed." : "Progress updated." };
}

export async function getLatestCareerReport(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };
  const assessment = await prisma.careerAssessment.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  if (!assessment) return { ok: false as const, message: "No career assessment available yet." };

  const report: CareerReport = {
    id: assessment.id,
    pathwayTitle: assessment.pathwayTitle,
    matchScore: assessment.matchScore ?? 0,
    reportSummary: assessment.reportSummary ?? "Career report generated.",
    recommendedCourses: (assessment.recommendedCourses || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    createdAt: assessment.createdAt.toISOString()
  };
  return { ok: true as const, report };
}

export async function getCreditHistory(token: string | null) {
  if (!token) return { ok: false as const, message: "Unauthorized." };
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return { ok: false as const, message: "Unauthorized." };
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return {
    ok: true as const,
    transactions: transactions.map((item) => ({
      id: item.id,
      delta: item.delta,
      reason: item.reason,
      balanceAfter: item.balanceAfter,
      createdAt: item.createdAt.toISOString()
    }))
  };
}

export async function getActivityHistory(token: string | null) {
  const user = await getAuthorizedUser(token);
  if (!user) return { ok: false as const, message: "Unauthorized." };

  const [bookings, attempts, enrollments, assessments] = await Promise.all([
    prisma.studyHelpBooking.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.examAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.courseEnrollment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.careerAssessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  const activity: ActivityItem[] = [
    ...bookings.map((item) => ({
      id: item.id,
      type: "study_help_booking" as const,
      title: "Study Help Booking",
      details: item.planLabel,
      creditsUsed: item.creditsUsed,
      createdAt: item.createdAt.toISOString()
    })),
    ...attempts.map((item) => ({
      id: item.id,
      type: "exam_attempt" as const,
      title: "Exam Attempt Started",
      details: item.examName,
      creditsUsed: item.creditsUsed,
      createdAt: item.createdAt.toISOString()
    })),
    ...enrollments.map((item) => ({
      id: item.id,
      type: "course_enrollment" as const,
      title: "Course Enrollment",
      details: item.courseTitle,
      creditsUsed: item.creditsUsed,
      createdAt: item.createdAt.toISOString()
    })),
    ...assessments.map((item) => ({
      id: item.id,
      type: "career_assessment" as const,
      title: "Career Gene Assessment",
      details: item.pathwayTitle,
      creditsUsed: item.creditsUsed,
      createdAt: item.createdAt.toISOString()
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { ok: true as const, activity: activity.slice(0, 20) };
}

export function getCatalog() {
  return {
    studyHelpPlans,
    examCategories,
    exams,
    courses,
    careerPathways
  };
}

export async function getSessionActor(token: string | null) {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          institution: true,
          teacherProfile: true
        }
      }
    }
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } });
    return null;
  }
  return session.user;
}

export async function getTeacherDashboard(token: string | null) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "TEACHER") {
    return { ok: false as const, message: "Forbidden." };
  }

  const classMaps = await prisma.teacherClassMap.findMany({
    where: { teacherId: actor.id },
    include: { students: true }
  });
  const openTasks = await prisma.interventionTask.findMany({
    where: { teacherId: actor.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
    include: { student: true },
    orderBy: { createdAt: "desc" },
    take: 10
  });
  const pendingEvaluations = await prisma.submission.count({
    where: {
      assignment: { teacherId: actor.id },
      scorePercent: null
    }
  });

  const payload: TeacherDashboardData = {
    teacher: {
      id: actor.id,
      name: actor.name,
      institutionName: actor.institution?.name ?? null,
      subjects: (actor.teacherProfile?.subjects || "").split(",").map((item) => item.trim()).filter(Boolean),
      classLevels: (actor.teacherProfile?.classLevels || "").split(",").map((item) => item.trim()).filter(Boolean),
      verified: actor.teacherProfile?.isVerified ?? false
    },
    classLoad: classMaps.map((item) => ({
      id: item.id,
      className: item.className,
      section: item.section,
      subject: item.subject,
      studentCount: item.students.length
    })),
    atRiskStudents: openTasks.map((item) => ({
      studentId: item.studentId,
      studentName: item.student.name,
      reasonCode: item.reasonCode,
      status: item.status,
      dueAt: item.dueAt?.toISOString() ?? null
    })),
    pendingEvaluations,
    openInterventions: openTasks.length
  };

  return { ok: true as const, dashboard: payload };
}

export async function onboardTeacher(
  token: string | null,
  payload: { subjects: string[]; classLevels: string[]; bio?: string; classes: Array<{ className: string; section?: string; subject: string }> }
) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "TEACHER") {
    return { ok: false as const, message: "Forbidden." };
  }
  if (!actor.institutionId) {
    return { ok: false as const, message: "Teacher is not assigned to an institution." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.teacherProfile.upsert({
      where: { userId: actor.id },
      create: {
        userId: actor.id,
        bio: payload.bio?.trim() || null,
        subjects: payload.subjects.join(","),
        classLevels: payload.classLevels.join(","),
        isVerified: true
      },
      update: {
        bio: payload.bio?.trim() || null,
        subjects: payload.subjects.join(","),
        classLevels: payload.classLevels.join(","),
        isVerified: true
      }
    });
    await tx.teacherClassMap.deleteMany({ where: { teacherId: actor.id } });
    if (payload.classes.length) {
      await tx.teacherClassMap.createMany({
        data: payload.classes.map((item) => ({
          teacherId: actor.id,
          institutionId: actor.institutionId!,
          className: item.className,
          section: item.section || null,
          subject: item.subject
        }))
      });
    }
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "teacher_onboarding_completed",
        entityType: "teacher_profile",
        entityId: actor.id,
        payload: JSON.stringify({ subjects: payload.subjects, classLevels: payload.classLevels })
      }
    });
  });

  return { ok: true as const, message: "Teacher onboarding updated." };
}

export async function createIntervention(
  token: string | null,
  payload: { studentId: string; reasonCode: string; summary: string; dueAt?: string }
) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "TEACHER") return { ok: false as const, message: "Forbidden." };

  const student = await prisma.user.findUnique({ where: { id: payload.studentId } });
  if (!student || student.role !== "STUDENT") return { ok: false as const, message: "Student not found." };

  const task = await prisma.interventionTask.create({
    data: {
      teacherId: actor.id,
      studentId: payload.studentId,
      reasonCode: payload.reasonCode,
      summary: payload.summary,
      dueAt: payload.dueAt ? new Date(payload.dueAt) : null
    }
  });
  return { ok: true as const, taskId: task.id };
}

export async function updateInterventionStatus(
  token: string | null,
  payload: { taskId: string; status: InterventionStatus }
) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "TEACHER") return { ok: false as const, message: "Forbidden." };
  const task = await prisma.interventionTask.findUnique({ where: { id: payload.taskId } });
  if (!task || task.teacherId !== actor.id) return { ok: false as const, message: "Task not found." };
  await prisma.interventionTask.update({
    where: { id: task.id },
    data: { status: payload.status }
  });
  return { ok: true as const, message: "Task updated." };
}

export async function getAdminUsers(token: string | null, role?: Role) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "ADMIN") return { ok: false as const, message: "Forbidden." };
  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    include: { institution: true },
    orderBy: { createdAt: "desc" },
    take: 200
  });
  const items: AdminUserItem[] = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    className: user.className,
    credits: user.credits,
    institutionName: user.institution?.name ?? null,
    isActive: true,
    createdAt: user.createdAt.toISOString()
  }));
  return { ok: true as const, users: items };
}

export async function adminUpdateUser(
  token: string | null,
  payload: { userId: string; role?: Role; institutionId?: string | null; creditsDelta?: number }
) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "ADMIN") return { ok: false as const, message: "Forbidden." };
  const target = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!target) return { ok: false as const, message: "User not found." };

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: target.id },
      data: {
        role: payload.role ?? undefined,
        institutionId: payload.institutionId !== undefined ? payload.institutionId : undefined,
        credits: payload.creditsDelta ? target.credits + payload.creditsDelta : undefined
      }
    });
    if (payload.creditsDelta) {
      await tx.creditTransaction.create({
        data: {
          userId: target.id,
          delta: payload.creditsDelta,
          reason: "Admin wallet adjustment",
          balanceAfter: target.credits + payload.creditsDelta
        }
      });
    }
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "admin_update_user",
        entityType: "user",
        entityId: target.id,
        payload: JSON.stringify(payload)
      }
    });
  });
  return { ok: true as const, message: "User updated." };
}

export async function getAdminAnalytics(token: string | null) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "ADMIN") return { ok: false as const, message: "Forbidden." };

  const [students, teachers, institutions, activeApplications, attempts, enrollments, spendByReason] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.institution.count(),
    prisma.admissionApplication.count({ where: { stage: { notIn: ["ADMITTED", "ENROLLED"] } } }),
    prisma.examAttempt.findMany({ where: { scorePercent: { not: null } }, include: { user: true }, take: 500 }),
    prisma.courseEnrollment.findMany({ include: { user: true }, take: 500 }),
    prisma.creditTransaction.findMany({ where: { delta: { lt: 0 } }, take: 300 })
  ]);

  const scoreByClass = new Map<string, number[]>();
  attempts.forEach((item) => {
    const score = item.scorePercent ?? 0;
    const key = item.user.className || "Unassigned";
    const list = scoreByClass.get(key) || [];
    list.push(score);
    scoreByClass.set(key, list);
  });

  const progressByClass = new Map<string, number[]>();
  enrollments.forEach((item) => {
    const key = item.user.className || "Unassigned";
    const list = progressByClass.get(key) || [];
    list.push(item.progressPercent);
    progressByClass.set(key, list);
  });

  const topCohorts = Array.from(scoreByClass.entries())
    .map(([cohort, scores]) => {
      const progresses = progressByClass.get(cohort) || [];
      const avgScore = scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : 0;
      const avgCourseProgress = progresses.length
        ? Math.round(progresses.reduce((sum, value) => sum + value, 0) / progresses.length)
        : 0;
      return {
        cohort,
        avgScore,
        avgCourseProgress,
        challengeParticipation: Math.min(100, scores.length * 5)
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 6);

  const spendMap = new Map<string, number>();
  spendByReason.forEach((item) => {
    const key = item.reason.includes("Exam")
      ? "exam"
      : item.reason.includes("Course")
        ? "courses"
        : item.reason.includes("Study Help")
          ? "study_help"
          : "career";
    spendMap.set(key, (spendMap.get(key) || 0) + Math.abs(item.delta));
  });

  const report: AnalyticsReport = {
    totals: { students, teachers, institutions, activeApplications },
    microCategories: [
      { category: "engagement", label: "Exam credits spent", value: spendMap.get("exam") || 0, deltaLabel: "+12% wow" },
      { category: "engagement", label: "Course credits spent", value: spendMap.get("courses") || 0, deltaLabel: "+9% wow" },
      {
        category: "engagement",
        label: "Study Help credits spent",
        value: spendMap.get("study_help") || 0,
        deltaLabel: "+7% wow"
      },
      { category: "career", label: "Career credits spent", value: spendMap.get("career") || 0, deltaLabel: "+15% wow" }
    ],
    topCohorts
  };
  return { ok: true as const, report };
}

export async function getApplications(token: string | null) {
  const actor = await getSessionActor(token);
  if (!actor || !["ADMIN", "COUNSELOR"].includes(actor.role)) {
    return { ok: false as const, message: "Forbidden." };
  }
  if (actor.role === "COUNSELOR" && !actor.institutionId) {
    return { ok: false as const, message: "Counselor is not assigned to an institution." };
  }
  const rows = await prisma.admissionApplication.findMany({
    where: actor.role === "COUNSELOR" ? { institutionId: actor.institutionId! } : undefined,
    include: {
      institution: true,
      student: true,
      owner: true
    },
    orderBy: { updatedAt: "desc" },
    take: 100
  });

  const applications: AdmissionApplicationItem[] = rows.map((item) => ({
    id: item.id,
    institutionName: item.institution.name,
    studentName: item.student.name,
    ownerName: item.owner?.name ?? null,
    stage: item.stage,
    targetProgram: item.targetProgram,
    intakeYear: item.intakeYear,
    deadlineAt: item.deadlineAt?.toISOString() ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  }));
  return { ok: true as const, applications };
}

export async function createApplication(
  token: string | null,
  payload: { studentId: string; institutionId: string; targetProgram: string; intakeYear: number; deadlineAt?: string }
) {
  const actor = await getSessionActor(token);
  if (!actor || !["ADMIN", "COUNSELOR"].includes(actor.role)) {
    return { ok: false as const, message: "Forbidden." };
  }
  if (actor.role === "COUNSELOR" && actor.institutionId !== payload.institutionId) {
    return { ok: false as const, message: "Forbidden institution scope." };
  }
  const application = await prisma.admissionApplication.create({
    data: {
      studentId: payload.studentId,
      institutionId: payload.institutionId,
      ownerId: actor.id,
      targetProgram: payload.targetProgram,
      intakeYear: payload.intakeYear,
      deadlineAt: payload.deadlineAt ? new Date(payload.deadlineAt) : null,
      stage: "LEAD"
    }
  });
  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "application_created",
      entityType: "admission_application",
      entityId: application.id,
      payload: JSON.stringify({
        institutionId: payload.institutionId,
        targetProgram: payload.targetProgram,
        intakeYear: payload.intakeYear
      })
    }
  });
  return { ok: true as const, applicationId: application.id };
}

export async function updateApplicationStage(
  token: string | null,
  payload: { applicationId: string; stage: ApplicationStage; note?: string }
) {
  const actor = await getSessionActor(token);
  if (!actor || !["ADMIN", "COUNSELOR"].includes(actor.role)) {
    return { ok: false as const, message: "Forbidden." };
  }
  const application = await prisma.admissionApplication.findUnique({ where: { id: payload.applicationId } });
  if (!application) return { ok: false as const, message: "Application not found." };
  if (actor.role === "COUNSELOR" && actor.institutionId !== application.institutionId) {
    return { ok: false as const, message: "Forbidden institution scope." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.admissionApplication.update({
      where: { id: payload.applicationId },
      data: { stage: payload.stage, ownerId: actor.id }
    });
    if (payload.note?.trim()) {
      await tx.applicationNote.create({
        data: {
          applicationId: payload.applicationId,
          authorId: actor.id,
          note: payload.note.trim()
        }
      });
    }
    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: "application_stage_updated",
        entityType: "admission_application",
        entityId: payload.applicationId,
        payload: JSON.stringify({ stage: payload.stage })
      }
    });
  });

  return { ok: true as const, message: "Application updated." };
}

export async function getPrograms(token: string | null) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "ADMIN") return { ok: false as const, message: "Forbidden." };
  const programs = await prisma.skillProgram.findMany({
    include: { institution: true, modules: true, liveSessions: true },
    orderBy: { createdAt: "desc" }
  });
  const items: SkillProgramItem[] = programs.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    mode: item.mode,
    creditsCost: item.creditsCost,
    isPublished: item.isPublished,
    institutionName: item.institution.name,
    moduleCount: item.modules.length,
    liveSessionCount: item.liveSessions.length
  }));
  return { ok: true as const, programs: items };
}

export async function getAdminInstitutions(token: string | null) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "ADMIN") return { ok: false as const, message: "Forbidden." };
  const items = await prisma.institution.findMany({ orderBy: { name: "asc" } });
  return {
    ok: true as const,
    institutions: items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      state: item.state
    }))
  };
}

export async function getStudentDirectory(token: string | null) {
  const actor = await getSessionActor(token);
  if (!actor || !["ADMIN", "COUNSELOR", "TEACHER"].includes(actor.role)) {
    return { ok: false as const, message: "Forbidden." };
  }
  if (actor.role === "TEACHER") {
    const mappings = await prisma.teacherClassMap.findMany({
      where: { teacherId: actor.id },
      include: {
        students: {
          include: {
            student: {
              select: { id: true, name: true, className: true }
            }
          }
        }
      }
    });
    const dedup = new Map<string, { id: string; name: string; className: string }>();
    mappings.forEach((mapping) => {
      mapping.students.forEach((item) => {
        dedup.set(item.student.id, item.student);
      });
    });
    return { ok: true as const, students: Array.from(dedup.values()) };
  }

  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      ...(actor.role === "COUNSELOR" ? { institutionId: actor.institutionId ?? "no-institution" } : {})
    },
    select: { id: true, name: true, className: true },
    orderBy: { name: "asc" },
    take: 300
  });
  return { ok: true as const, students };
}

export async function createProgram(
  token: string | null,
  payload: {
    institutionId: string;
    title: string;
    description: string;
    mode: ProgramMode;
    creditsCost: number;
    modules?: Array<{ title: string; assetUrl?: string; durationMin?: number }>;
  }
) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "ADMIN") return { ok: false as const, message: "Forbidden." };
  const program = await prisma.skillProgram.create({
    data: {
      institutionId: payload.institutionId,
      managerId: actor.id,
      title: payload.title,
      description: payload.description,
      mode: payload.mode,
      creditsCost: payload.creditsCost,
      isPublished: true,
      modules: payload.modules?.length
        ? {
            create: payload.modules.map((item, index) => ({
              title: item.title,
              assetUrl: item.assetUrl || null,
              durationMin: item.durationMin || null,
              orderIndex: index + 1
            }))
          }
        : undefined
    }
  });
  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "program_created",
      entityType: "skill_program",
      entityId: program.id,
      payload: JSON.stringify({ title: payload.title, mode: payload.mode, creditsCost: payload.creditsCost })
    }
  });
  return { ok: true as const, programId: program.id };
}

export async function scheduleLiveSession(
  token: string | null,
  payload: { programId: string; title: string; startsAt: string; endsAt: string; capacity: number; replayUrl?: string }
) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "ADMIN") return { ok: false as const, message: "Forbidden." };
  const program = await prisma.skillProgram.findUnique({ where: { id: payload.programId } });
  if (!program) return { ok: false as const, message: "Program not found." };

  await prisma.liveSession.create({
    data: {
      programId: payload.programId,
      title: payload.title,
      startsAt: new Date(payload.startsAt),
      endsAt: new Date(payload.endsAt),
      capacity: payload.capacity,
      replayUrl: payload.replayUrl || null
    }
  });
  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "live_session_scheduled",
      entityType: "skill_program",
      entityId: payload.programId,
      payload: JSON.stringify({ title: payload.title, startsAt: payload.startsAt, endsAt: payload.endsAt })
    }
  });
  return { ok: true as const, message: "Live session scheduled." };
}

export async function getAuditLogs(token: string | null, take = 200) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "ADMIN") return { ok: false as const, message: "Forbidden." };
  const rows = await prisma.auditLog.findMany({
    include: {
      actor: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(take, 1), 1000)
  });

  const logs: AuditLogItem[] = rows.map((item) => ({
    id: item.id,
    actorName: item.actor.name,
    actorEmail: item.actor.email,
    action: item.action,
    entityType: item.entityType,
    entityId: item.entityId,
    payload: item.payload ?? null,
    createdAt: item.createdAt.toISOString()
  }));
  return { ok: true as const, logs };
}

export async function pruneAuditLogs(olderThanDays: number) {
  const days = Math.max(1, Math.floor(olderThanDays));
  const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: threshold
      }
    }
  });
  return { ok: true as const, deletedCount: result.count, threshold: threshold.toISOString() };
}

export async function upsertCareerProfile(
  token: string | null,
  payload: {
    interests: string[];
    strengths: string[];
    preferredStates: string[];
    budgetBand: string;
    targetExamTimeline: string;
    psychometricSummary: string;
  }
) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "STUDENT") return { ok: false as const, message: "Forbidden." };

  await prisma.careerProfile.upsert({
    where: { userId: actor.id },
    create: {
      userId: actor.id,
      interests: payload.interests.join(","),
      strengths: payload.strengths.join(","),
      preferredStates: payload.preferredStates.join(","),
      budgetBand: payload.budgetBand,
      targetExamTimeline: payload.targetExamTimeline,
      psychometricSummary: payload.psychometricSummary
    },
    update: {
      interests: payload.interests.join(","),
      strengths: payload.strengths.join(","),
      preferredStates: payload.preferredStates.join(","),
      budgetBand: payload.budgetBand,
      targetExamTimeline: payload.targetExamTimeline,
      psychometricSummary: payload.psychometricSummary
    }
  });
  return { ok: true as const, message: "Career profile updated." };
}

export async function getCareerGuidancePlan(token: string | null) {
  const actor = await getSessionActor(token);
  if (!actor || actor.role !== "STUDENT") return { ok: false as const, message: "Forbidden." };
  const [profile, latestAssessment] = await Promise.all([
    prisma.careerProfile.findUnique({ where: { userId: actor.id } }),
    prisma.careerAssessment.findFirst({ where: { userId: actor.id }, orderBy: { createdAt: "desc" } })
  ]);

  const interests = (profile?.interests || "").split(",").map((item) => item.trim()).filter(Boolean);
  const preferredStates = (profile?.preferredStates || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const recommendations = [
    {
      title: latestAssessment?.pathwayTitle || "Start aptitude assessment",
      rationale: latestAssessment?.reportSummary || "We need your profile and assessment to generate pathway matching.",
      nextAction: latestAssessment ? "Book counseling and shortlist institutions." : "Run Career Gene assessment.",
      successProbability: latestAssessment?.matchScore || 60
    },
    {
      title: "Admissions readiness",
      rationale: "Documentation and timeline discipline significantly improve conversion.",
      nextAction: "Complete checklist and submit core documents early.",
      successProbability: 72
    },
    {
      title: "State + all-India strategy",
      rationale: `Preferred regions: ${preferredStates.join(", ") || "Not set"}.`,
      nextAction: "Apply to at least 2 state and 2 all-India options.",
      successProbability: 68
    }
  ];

  const plan: CareerGuidancePlan = {
    profile: profile
      ? {
          interests,
          strengths: (profile.strengths || "").split(",").map((item) => item.trim()).filter(Boolean),
          preferredStates,
          budgetBand: profile.budgetBand,
          targetExamTimeline: profile.targetExamTimeline,
          psychometricSummary: profile.psychometricSummary
        }
      : null,
    recommendations,
    admissionsChecklist: [
      "Profile complete and counselor assigned",
      "Target institutions shortlisted",
      "Entrance exams plan finalized",
      "Documents uploaded",
      "Applications submitted before deadlines"
    ]
  };

  return { ok: true as const, plan };
}

export async function seedPlatformData() {
  const existingInstitution = await prisma.institution.findFirst();
  if (existingInstitution) return;

  const rootsSchool = await prisma.institution.create({
    data: {
      name: "Roots World School",
      code: "RWS001",
      type: "SCHOOL",
      state: "Kerala",
      district: "Ernakulam"
    }
  });
  await prisma.institution.create({
    data: {
      name: "ACE Allied Health College",
      code: "ACE001",
      type: "PARAMEDICAL",
      state: "Kerala",
      district: "Ernakulam"
    }
  });

  const adminHash = await hash(process.env.SEED_ADMIN_PASSWORD || "admin123", 10);
  const teacherHash = await hash(process.env.SEED_TEACHER_PASSWORD || "teacher123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Roots Admin",
      email: (process.env.SEED_ADMIN_EMAIL || "admin@roots.edu").toLowerCase(),
      className: "Operations",
      goal: "Grow institutions",
      credits: 5000,
      passwordHash: adminHash,
      role: "ADMIN",
      institutionId: rootsSchool.id
    }
  });

  const teacher = await prisma.user.create({
    data: {
      name: "Anita Teacher",
      email: (process.env.SEED_TEACHER_EMAIL || "teacher@roots.edu").toLowerCase(),
      className: "Class 10",
      goal: "Improve cohort outcomes",
      credits: 300,
      passwordHash: teacherHash,
      role: "TEACHER",
      institutionId: rootsSchool.id
    }
  });

  await prisma.teacherProfile.create({
    data: {
      userId: teacher.id,
      bio: "Math mentor focused on board + entrance prep",
      subjects: "Mathematics,Physics",
      classLevels: "Class 9,Class 10",
      isVerified: true
    }
  });

  await prisma.teacherClassMap.create({
    data: {
      teacherId: teacher.id,
      institutionId: rootsSchool.id,
      className: "Class 10",
      section: "A",
      subject: "Mathematics"
    }
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "platform_seeded",
      entityType: "institution",
      entityId: rootsSchool.id,
      payload: JSON.stringify({ source: "seedPlatformData" })
    }
  });
}
