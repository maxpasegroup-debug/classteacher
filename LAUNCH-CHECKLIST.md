# Roots Education Hub MVP Launch Checklist

## Product Readiness
- [x] Splash screen and dashboard entry flow.
- [x] Classteacher dashboard with all core sections.
- [x] Dedicated module screens:
  - [x] Study Help
  - [x] Exam Practice
  - [x] Skill Development
  - [x] Career Boost
- [x] My Journey, Explore Roots, and Profile flows.
- [x] Bottom navigation with active-tab highlighting.
- [x] Teacher Hub MVP (`/teacher`) with class load and intervention workflow.
- [x] Admin Console starter (`/admin`) with users, analytics, applications, and program ops modules.
- [x] Career Gene 2.0 profile + recommendations + admissions checklist flow.

## Quality
- [x] Lint clean (`npm run lint`).
- [x] Production build check (`npm run build`).
- [ ] Manual cross-device UI pass (recommended before public release).
- [ ] Real backend/API integration (replace static demo data).

## Deployment
- [ ] Set production environment values (if backend is connected).
- [ ] Deploy to Vercel or your cloud target.
- [ ] Run post-deploy smoke tests on mobile devices.

## Pilot and Governance (5-10 institutions)
- [x] RBAC + institution tenancy model enabled in database and APIs.
- [x] Admin analytics baseline for micro categories.
- [x] Admissions pipeline stages with counselor/admin ownership.
- [x] Program hosting operations for live + recorded content.
- [x] Admin audit logs with CSV export.
- [x] Session invalidation (`/api/auth/logout`) enabled.
- [x] Password reset token flow (`forgot-password` + `reset-password`) enabled.
- [x] API rate limiting enabled for auth and credit-sensitive endpoints.
- [x] Cookie-based session support + CSRF protection for mutating routes.
- [x] Redis-ready distributed rate limiting fallback implemented.
- [ ] Weekly KPI review ritual with institution stakeholders.
- [ ] AI safety and pedagogy review sign-off.
- [ ] Security sign-off and production incident runbook.

## CEO/CTO Sign-off
- [ ] Product sign-off.
- [ ] Engineering sign-off.
- [ ] Go-live approval.
