const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const days = Number(process.env.AUDIT_RETENTION_DAYS || "90");
  const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 90;
  const threshold = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: threshold
      }
    }
  });

  // eslint-disable-next-line no-console
  console.log(`Audit prune complete. deleted=${result.count} threshold=${threshold.toISOString()}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error("Audit prune failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
