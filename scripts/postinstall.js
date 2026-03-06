const { existsSync } = require("fs");
const { execSync } = require("child_process");

const schemaPath = "prisma/schema.prisma";

if (!existsSync(schemaPath)) {
  console.log(`[postinstall] Skipping Prisma generate: ${schemaPath} not found.`);
  process.exit(0);
}

execSync(`npx prisma generate --schema ${schemaPath}`, { stdio: "inherit" });
