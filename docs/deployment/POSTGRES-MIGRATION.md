# PostgreSQL Migration Playbook

This project currently uses SQLite for single-instance simplicity. Use this playbook to migrate to PostgreSQL for production scale, multi-instance workloads, and better operational resilience.

## 1) Provision PostgreSQL

- Managed options: Neon, Supabase, AWS RDS, GCP Cloud SQL.
- Create a production database and least-privilege app user.
- Enable automated backups and point-in-time recovery.

## 2) Update Environment Variables

Set `DATABASE_URL` in production:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/rootseducationhub?schema=public"
```

## 3) Switch Prisma Datasource Provider

In `prisma/schema.prisma`, change:

- `provider = "sqlite"` -> `provider = "postgresql"`

Then run:

```bash
npm run prisma:generate
npx prisma migrate dev --name init_postgres
```

For production:

```bash
npx prisma migrate deploy
```

## 4) Data Migration Strategy

- Export critical seed and operational entities from SQLite:
  - users, sessions, credit transactions
  - attempts, enrollments, bookings
  - institutions, teacher/admin entities
- Import with a one-time migration script using Prisma Client.
- Validate record counts per table after import.

## 5) Deployment Cutover

- Put app in maintenance mode.
- Run final incremental sync.
- Apply Prisma migrations on PostgreSQL.
- Switch `DATABASE_URL` and restart application.
- Run smoke tests:
  - auth login/signup
  - dashboard data loading
  - teacher/admin endpoints
  - credit ledger actions

## 6) Post-Cutover Hardening

- Add connection pooling (PgBouncer or provider-native pooler).
- Add query-performance logging for slow queries.
- Add retention policy and daily audit log exports.
- Configure alerting for DB CPU, storage, and connection exhaustion.
