import Header from "@/components/Header";
import Link from "next/link";

export default function MIPSPage() {
  return (
    <>
      <Header title="MIPS Paramedical Institute" subtitle="Paramedical pathways" />
      <main className="space-y-4 px-4 py-5 md:px-0">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-48 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-200" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">About</h2>
          <p className="mt-2 text-sm text-slate-600">
            Specialized paramedical pathways designed for clinical readiness and confidence. Hands-on training and
            placement support.
          </p>
          <h2 className="mt-4 text-sm font-semibold text-slate-900">Programs</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>• Diploma in Paramedical Sciences</li>
            <li>• Operation Theatre Technology</li>
            <li>• Emergency &amp; Critical Care</li>
          </ul>
          <Link
            href="/explore"
            className="mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            ← Back to Explore
          </Link>
        </section>
      </main>
    </>
  );
}
