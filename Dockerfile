FROM node:20-alpine

WORKDIR /app

# Default SQLite URL so Prisma validates when DATABASE_URL is unset at build/start.
# If your platform injects a Postgres URL, either unset DATABASE_URL or set it to a file: URL for SQLite.
ENV DATABASE_URL="file:/app/data/dev.db"

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production

EXPOSE 3000

# Force SQLite file: URL at runtime so platform-injected DATABASE_URL (e.g. Postgres) doesn't break Prisma
CMD ["sh", "-c", "mkdir -p data && export DATABASE_URL=file:/app/data/dev.db && npm run prisma:push && npm run db:seed && npm run start -- -p 3000"]
