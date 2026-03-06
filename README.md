# Roots Education Hub - Ready to Deploy

Mobile-first Next.js 14 application for the Roots ecosystem with:
- Classteacher dashboard
- My Journey
- Explore Roots
- Profile
- Auth + credits + bookings + exam attempts + course enrollments + career report
- Teacher Hub (`/teacher`) with interventions
- Admin Console (`/admin`) with users, analytics, applications, and program operations

## Tech Stack
- Next.js 14 (App Router)
- TypeScript + TailwindCSS + Framer Motion
- Prisma ORM
- SQLite (default)

## 1) Local Run

```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run db:seed
npm run dev
```

Open: `http://localhost:3000`

Health checks:
- `http://localhost:3000/api/health`
- `http://localhost:3000/api/ready`

Security flows:
- Forgot password: `/auth/forgot-password`
- Reset password: `/auth/reset-password`
- CSRF token endpoint: `/api/auth/csrf`
- Cookie-first auth: UI now uses httpOnly session cookies + CSRF headers (no localStorage token dependency).
- Legacy bearer auth is disabled by default. Set `ALLOW_LEGACY_BEARER=true` only for controlled automation compatibility.

## 2) Production Build (without Docker)

```bash
npm install
npm run build
npm run start:prod
```

## 3) Docker Deploy (recommended for quick launch)

```bash
docker compose up -d --build
```

App will run on `http://localhost:3000` with persisted SQLite data using Docker volume `roots_data`.

Stop:

```bash
docker compose down
```

## Demo Login
- Email: `student@roots.edu`
- Password: `password123`

Admin:
- Email: `admin@roots.edu`
- Password: `admin123`

Teacher:
- Email: `teacher@roots.edu`
- Password: `teacher123`

These users are seeded automatically and can be customized via env variables.

## Environment Variables
Copy `.env.example` to `.env` and adjust values:

```env
DATABASE_URL="file:./prisma/dev.db"
SEED_DEMO_USER_EMAIL="student@roots.edu"
SEED_DEMO_USER_PASSWORD="password123"
```

## Deployment Notes
- SQLite is suitable for single-instance deployment.
- For multi-instance/high-scale production, migrate Prisma datasource to PostgreSQL.
- `postinstall` runs `prisma generate` automatically to support CI/CD deploys.
- PostgreSQL migration playbook: `docs/deployment/POSTGRES-MIGRATION.md`.
- Audit retention prune: `npm run audit:prune` (uses `AUDIT_RETENTION_DAYS`).
- Distributed rate limiting: set `RATE_LIMIT_REDIS_URL` + `RATE_LIMIT_REDIS_TOKEN` (falls back to in-memory if unset).

## Key Role Routes
- Student: `/dashboard`
- Teacher: `/teacher`
- Admin: `/admin`
