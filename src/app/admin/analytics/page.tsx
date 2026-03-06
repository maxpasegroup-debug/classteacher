"use client";

import { useEffect, useState } from "react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { AnalyticsReport } from "@/lib/contracts";

export default function AdminAnalyticsPage() {
  const { user } = useAppSession();
  const [report, setReport] = useState<AnalyticsReport | null>(null);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    fetch("/api/admin/analytics")
      .then((response) => response.json())
      .then((data: { report: AnalyticsReport }) => setReport(data.report))
      .catch(() => setReport(null));
  }, [user]);

  if (!user || user.role !== "ADMIN") {
    return <main className="px-4 py-5 text-sm text-slate-700">Admin access only.</main>;
  }

  return (
    <main className="space-y-4 px-4 py-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-slate-900">Full Analytics Report</h1>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <article className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-600">Students</p>
            <p className="text-lg font-semibold text-slate-900">{report?.totals.students ?? 0}</p>
          </article>
          <article className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-600">Teachers</p>
            <p className="text-lg font-semibold text-slate-900">{report?.totals.teachers ?? 0}</p>
          </article>
          <article className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-600">Institutions</p>
            <p className="text-lg font-semibold text-slate-900">{report?.totals.institutions ?? 0}</p>
          </article>
          <article className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs text-slate-600">Active applications</p>
            <p className="text-lg font-semibold text-slate-900">{report?.totals.activeApplications ?? 0}</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Micro categories</h2>
        <div className="mt-2 space-y-2">
          {report?.microCategories.map((item) => (
            <article key={`${item.category}-${item.label}`} className="rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-medium text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-600">
                {item.value} credits | {item.deltaLabel}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Top cohorts</h2>
        <div className="mt-2 space-y-2">
          {report?.topCohorts.map((item) => (
            <article key={item.cohort} className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="font-medium text-slate-800">{item.cohort}</p>
              <p className="text-xs text-slate-600">
                Avg score {item.avgScore}% | Course progress {item.avgCourseProgress}% | Challenge participation{" "}
                {item.challengeParticipation}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
