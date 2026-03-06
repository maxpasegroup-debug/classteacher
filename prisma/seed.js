const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function seedInstitutions() {
  const existing = await prisma.institution.findFirst();
  if (existing) return existing;

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

  return rootsSchool;
}

async function seedDemoUser(institutionId) {
  const email = (process.env.SEED_DEMO_USER_EMAIL || "student@roots.edu").toLowerCase();
  const password = process.env.SEED_DEMO_USER_PASSWORD || "password123";
  const passwordHash = await hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const user = await prisma.user.create({
    data: {
      name: "Rahul",
      email,
      className: "Class 10 | CBSE",
      goal: "Master algebra and science fundamentals",
      passwordHash,
      credits: 120,
      role: "STUDENT",
      institutionId
    }
  });

  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      delta: 120,
      reason: "Joining bonus credits",
      balanceAfter: 120
    }
  });

  return user;
}

async function seedAdminAndTeacher(institutionId) {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@roots.edu").toLowerCase();
  const teacherEmail = (process.env.SEED_TEACHER_EMAIL || "teacher@roots.edu").toLowerCase();

  const [adminExists, teacherExists] = await Promise.all([
    prisma.user.findUnique({ where: { email: adminEmail } }),
    prisma.user.findUnique({ where: { email: teacherEmail } })
  ]);

  let admin = adminExists;
  if (!admin) {
    const adminHash = await hash(process.env.SEED_ADMIN_PASSWORD || "admin123", 10);
    admin = await prisma.user.create({
      data: {
        name: "Roots Admin",
        email: adminEmail,
        className: "Operations",
        goal: "Scale Roots ecosystem",
        passwordHash: adminHash,
        credits: 5000,
        role: "ADMIN",
        institutionId
      }
    });
  }

  let teacher = teacherExists;
  if (!teacher) {
    const teacherHash = await hash(process.env.SEED_TEACHER_PASSWORD || "teacher123", 10);
    teacher = await prisma.user.create({
      data: {
        name: "Anita Teacher",
        email: teacherEmail,
        className: "Class 10",
        goal: "Improve class outcomes",
        passwordHash: teacherHash,
        credits: 300,
        role: "TEACHER",
        institutionId
      }
    });
  }

  const profile = await prisma.teacherProfile.findUnique({ where: { userId: teacher.id } });
  if (!profile) {
    await prisma.teacherProfile.create({
      data: {
        userId: teacher.id,
        bio: "Mathematics mentor",
        subjects: "Mathematics,Physics",
        classLevels: "Class 9,Class 10",
        isVerified: true
      }
    });
  }

  const classMapCount = await prisma.teacherClassMap.count({ where: { teacherId: teacher.id } });
  if (classMapCount === 0) {
    await prisma.teacherClassMap.create({
      data: {
        teacherId: teacher.id,
        institutionId,
        className: "Class 10",
        section: "A",
        subject: "Mathematics"
      }
    });
  }
}

async function seedTutorSlots() {
  const count = await prisma.tutorSlot.count();
  if (count > 0) return;

  const tutors = ["Asha Menon", "Rahul Das", "Meera Nair"];
  const planIds = ["sh-hourly", "sh-weekly", "sh-monthly"];

  const base = new Date();
  base.setMinutes(0, 0, 0);
  base.setHours(16, 0, 0, 0);

  const slots = [];
  for (let day = 0; day < 7; day += 1) {
    for (let index = 0; index < planIds.length; index += 1) {
      const startAt = new Date(base);
      startAt.setDate(base.getDate() + day);
      startAt.setHours(16 + index, 0, 0, 0);

      const endAt = new Date(startAt);
      endAt.setHours(startAt.getHours() + 1);

      slots.push({
        planId: planIds[index],
        tutorName: tutors[(day + index) % tutors.length],
        startAt,
        endAt,
        isBooked: false
      });
    }
  }

  await prisma.tutorSlot.createMany({ data: slots });
}

async function main() {
  const institution = await seedInstitutions();
  await seedDemoUser(institution.id);
  await seedAdminAndTeacher(institution.id);
  await seedTutorSlots();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log("Seed completed.");
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
