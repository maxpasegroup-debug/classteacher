"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BriefcaseBusiness, Compass, GraduationCap } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { useCatalog } from "@/hooks/useCatalog";
import { CareerGuidancePlan, CareerReport } from "@/lib/contracts";

const pathways = [
  { id: "p-eng", title: "Engineering Foundations", nextStep: "Complete aptitude challenge", cost: 18 },
  { id: "p-health", title: "Allied Health Introduction", nextStep: "Explore paramedical programs", cost: 20 },
  { id: "p-creative", title: "Creative Careers", nextStep: "Build mini portfolio activity", cost: 15 }
];

export default function CareerGenePage() {
  const { user, getAuthHeaders, refreshUser } = useAppSession();
  const router = useRouter();
  const { catalog } = useCatalog();
  const recommendedPathways = catalog?.careerPathways ?? pathways;
  const [report, setReport] = useState<CareerReport | null>(null);
  const [plan, setPlan] = useState<CareerGuidancePlan | null>(null);
  const [profileInterests, setProfileInterests] = useState("Biology,Helping people");
  const [profileStates, setProfileStates] = useState("Kerala,Karnataka");
  const [profileStrengths, setProfileStrengths] = useState("Communication,Discipline");
  const [budgetBand, setBudgetBand] = useState("Medium");
  const [timeline, setTimeline] = useState("Within 6 months");

  useEffect(() => {
    async function loadCareerData() {
      if (!user) {
        setReport(null);
        setPlan(null);
        return;
      }
      const [reportResponse, planResponse] = await Promise.all([
        fetch("/api/career/report"),
        fetch("/api/career/plan")
      ]);
      if (reportResponse.ok) {
        const data = (await reportResponse.json()) as { report: CareerReport };
        setReport(data.report || null);
      }
      if (planResponse.ok) {
        const data = (await planResponse.json()) as { plan: CareerGuidancePlan };
        setPlan(data.plan || null);
      }
    }
    loadCareerData();
  }, [user, user?.credits]);

  function requireAuth() {
    if (user) return true;
    router.push(`/auth/signup?returnTo=${encodeURIComponent("/dashboard/career-gene")}`);
    return false;
  }

  async function runCareerAssessment(pathwayId: string, cost: number) {
    if (!requireAuth()) return;
    const response = await fetch("/api/actions/career-assessment", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ pathwayId })
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      alert(result.message || "Unable to start assessment.");
      return;
    }
    await refreshUser();
    const [reportResponse, planResponse] = await Promise.all([
      fetch("/api/career/report"),
      fetch("/api/career/plan")
    ]);
    if (reportResponse.ok) {
      const data = (await reportResponse.json()) as { report: CareerReport };
      setReport(data.report || null);
    }
    if (planResponse.ok) {
      const data = (await planResponse.json()) as { plan: CareerGuidancePlan };
      setPlan(data.plan || null);
    }
    alert(`Career Gene assessment started. ${cost} credits deducted.`);
  }

  async function saveCareerProfile() {
    if (!requireAuth()) return;
    const response = await fetch("/api/career/profile", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        interests: profileInterests.split(",").map((item) => item.trim()).filter(Boolean),
        strengths: profileStrengths.split(",").map((item) => item.trim()).filter(Boolean),
        preferredStates: profileStates.split(",").map((item) => item.trim()).filter(Boolean),
        budgetBand,
        targetExamTimeline: timeline,
        psychometricSummary: "Balanced learner with high motivation and moderate risk appetite."
      })
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      alert(result.message || "Unable to save profile.");
      return;
    }
    const planResponse = await fetch("/api/career/plan");
    if (planResponse.ok) {
      const data = (await planResponse.json()) as { plan: CareerGuidancePlan };
      setPlan(data.plan || null);
    }
    alert("Career profile updated.");
  }

  return (
    <main className="space-y-4 px-4 py-5">
      <section className="rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 p-4 text-white shadow-md">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness size={18} />
          <p className="text-sm font-semibold">Career Gene</p>
        </div>
        <h1 className="mt-2 text-lg font-semibold">AI-powered career path guidance</h1>
        <p className="mt-1 text-sm text-white/90">
          Generate assessments, discover pathways, choose courses, and get admission support.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Recommended Career Pathways</h2>
        {recommendedPathways.map((pathway) => (
          <article key={pathway.id} className="rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">{pathway.title}</p>
            <p className="mt-1 text-xs text-slate-600">Next: {pathway.nextStep}</p>
            <button
              type="button"
              onClick={() => runCareerAssessment(pathway.id, pathway.cost)}
              className="mt-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              {user ? `Run assessment (${pathway.cost} credits)` : "Create account to continue"}
            </button>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Compass size={16} className="text-emerald-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Career Match</p>
          <p className="mt-1 text-xs text-slate-600">Health Science - 82%</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <GraduationCap size={16} className="text-cyan-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Admission Support</p>
          <p className="mt-1 text-xs text-slate-600">Applications + counseling</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Career Profiling</h2>
        <div className="mt-2 space-y-2">
          <input
            value={profileInterests}
            onChange={(event) => setProfileInterests(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Interests (comma separated)"
          />
          <input
            value={profileStrengths}
            onChange={(event) => setProfileStrengths(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Strengths (comma separated)"
          />
          <input
            value={profileStates}
            onChange={(event) => setProfileStates(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Preferred states"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={budgetBand}
              onChange={(event) => setBudgetBand(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Budget band"
            />
            <input
              value={timeline}
              onChange={(event) => setTimeline(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Timeline"
            />
          </div>
          <button
            type="button"
            onClick={saveCareerProfile}
            className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-medium text-white"
          >
            Save profile
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Smart Admissions Plan</h2>
        {!plan ? (
          <p className="mt-2 text-sm text-slate-600">Save profile to generate recommendations.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {plan.recommendations.map((item) => (
              <article key={item.title} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600">{item.rationale}</p>
                <p className="mt-1 text-xs font-medium text-slate-700">
                  Next: {item.nextAction} | Success probability: {item.successProbability}%
                </p>
              </article>
            ))}
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Admissions checklist</p>
              <ul className="mt-1 space-y-1 text-sm text-emerald-900">
                {plan.admissionsChecklist.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Career Gene Report</h2>
        {!report ? (
          <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Run a career assessment to generate your personalized report.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="text-sm font-semibold text-slate-900">{report.pathwayTitle}</p>
            <p className="text-sm text-slate-700">Match Score: {report.matchScore}%</p>
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{report.reportSummary}</p>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recommended Courses</p>
              {report.recommendedCourses.map((course) => (
                <p key={course} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700">
                  {course}
                </p>
              ))}
            </div>
          </div>
        )}
      </section>

      <Link
        href="/dashboard"
        className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back to Classteacher
      </Link>
    </main>
  );
}
