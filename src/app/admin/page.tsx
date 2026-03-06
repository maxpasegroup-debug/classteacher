"use client";

import Link from "next/link";
import { useAppSession } from "@/components/providers/AppSessionProvider";

const modules = [
  {
    href: "/admin/users",
    title: "Manage Users",
    description: "Invite, role updates, institution assignments, credit controls."
  },
  {
    href: "/admin/analytics",
    title: "Analytics Report",
    description: "Micro-category student outcomes with drill-down cohorts."
  },
  {
    href: "/admin/applications",
    title: "Applications Pipeline",
    description: "Track admissions across Roots institutions and counselor notes."
  },
  {
    href: "/admin/programs",
    title: "Skill Program Ops",
    description: "Upload/host live and recorded programs with scheduling."
  },
  {
    href: "/admin/audit",
    title: "Audit and Export",
    description: "Review activity logs and export CSV for compliance."
  }
];

export default function AdminHomePage() {
  const { user } = useAppSession();

  if (!user || user.role !== "ADMIN") {
    return (
      <main className="px-4 py-5">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h1 className="text-base font-semibold text-amber-900">Admin access only</h1>
          <p className="mt-1 text-sm text-amber-800">Please login with an admin account to access this console.</p>
          <Link href="/dashboard" className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-4 px-4 py-5">
      <section className="rounded-3xl bg-gradient-to-r from-slate-800 to-slate-700 p-4 text-white">
        <p className="text-xs uppercase tracking-wide text-slate-200">Admin Console</p>
        <h1 className="mt-1 text-lg font-semibold">Roots Operations Command Center</h1>
        <p className="text-sm text-slate-200">Manage users, outcomes, admissions pipeline, and program operations.</p>
      </section>

      <section className="space-y-3">
        {modules.map((item) => (
          <Link key={item.href} href={item.href} className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-600">{item.description}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
