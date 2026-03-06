# 90-Day PRD: Roots Education Hub (Pilot Launch)

## Document Owner
- Product: CEO Office + Product Lead
- Technology: CTO Office + Engineering Lead
- Date: Immediate execution plan (Day 0 start)

## 1) Problem Statement
Students, teachers, and institutions currently use fragmented workflows for learning, guidance, and progress tracking. Roots needs a unified mobile-first experience that drives measurable learning outcomes.

## 2) Objective (Day 0 to Day 90)
Ship a production-ready `Classteacher` student hub and pilot it with 5-10 institutions with measurable outcomes.

## 3) Success Criteria
- 70%+ weekly active usage in pilot institutions.
- 20%+ improvement in completion rates for assigned practice.
- 10%+ increase in assessment score trend in target cohorts.
- Teacher intervention dashboard used weekly by 80%+ pilot teachers.

## 4) Scope

## In Scope (MVP)
- Splash + auth-ready home entry.
- Classteacher dashboard with:
  - Search
  - Main modules (Study Help, Exam Practice, Skill Development, Career Boost)
  - Daily challenge
  - Continue practice
  - Leaderboard
  - Skill spotlight
- My Journey progression map.
- Explore Roots institution discovery.
- Profile with progress summary and settings.
- Mobile-first bottom navigation.
- Baseline analytics instrumentation.

## Out of Scope (for 90 days)
- Full fee/payment workflows.
- Marketplace APIs.
- Advanced global localization.

## 5) User Stories (Top Priority)
- As a student, I can quickly start a daily learning activity in under 10 seconds.
- As a student, I can resume unfinished tests from the dashboard.
- As a student, I can track my level, XP, and current tasks.
- As a teacher, I can identify at-risk students and recommended interventions.
- As an institution admin, I can view cohort-level engagement and progress snapshots.

## 6) Functional Requirements
- Mobile-first UI for all core views.
- 2x2 module grid with navigation and clear descriptions.
- Challenge card with single tap CTA.
- Progress bars and leaderboard updates from data service.
- Role-based rendering for student/teacher/institution users.
- Event logging for all primary actions.

## 7) Non-Functional Requirements
- App uptime target: 99.9%.
- P95 interaction latency target: < 2.0s on standard mobile networks.
- WCAG-minded contrast and tap targets.
- Secure session handling and protected routes.

## 8) Workstreams and Owners
- Product + UX: information architecture, design system, usability tests.
- Frontend: app router views, component library, interactions.
- Backend/API: learner graph endpoints, dashboard feeds, user context.
- Data/AI: recommendation seed model, analytics events, baseline reporting.
- QA/Security: test matrix, privacy checks, release gating.

## 9) 12-Week Plan

## Weeks 1-2
- Finalize design system tokens and components.
- Lock UX flows and navigation map.
- Define analytics event schema and KPI dashboard draft.

## Weeks 3-4
- Build production dashboard APIs and integrate UI.
- Implement search, module routing, challenge flow.
- Implement basic learner profile and progress services.

## Weeks 5-6
- Build My Journey logic and task progression states.
- Integrate leaderboard and continue-practice feeds.
- Begin teacher intervention dashboard v1.

## Weeks 7-8
- Pilot data onboarding (5-10 institutions).
- Feature hardening, performance tuning, accessibility pass.
- Security and compliance review.

## Weeks 9-10
- AI personalization v1 for recommended practice.
- Experiment framework and A/B hooks.
- Parent visibility proof-of-concept.

## Weeks 11-12
- Pilot launch and monitoring.
- Publish baseline impact report.
- Prepare public launch assets and executive readout.

## 10) Risks and Mitigations
- Data quality risk -> strict ingestion validation and QA checks.
- Low adoption risk -> weekly feedback loops and UX simplification.
- AI trust risk -> explainable suggestions + moderation + escalation.
- Scope creep risk -> hard phase gates and change control board.

## 11) Go/No-Go Criteria (Pilot Release)
- All P0 journeys pass QA.
- Security review signed off.
- Analytics baseline reporting live.
- Pilot institution onboarding complete.
