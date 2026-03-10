import Header from "@/components/Header";
import Link from "next/link";

export default function TuitionPage() {
  return (
    <>
      <Header title="Roots Tuition Centres" subtitle="After-school coaching" />
      <main className="space-y-4 px-4 py-5 md:px-0">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-48 rounded-2xl bg-gradient-to-br from-cyan-100 to-sky-200" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">About</h2>
          <p className="mt-2 text-sm text-slate-600">
            After-school coaching programs with personalized support across core subjects. Small batches, doubt
            resolution, and regular tests to track progress.
          </p>
          <h2 className="mt-4 text-sm font-semibold text-slate-900">Programs</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>• Class 8–10 (Math, Science, English)</li>
            <li>• Class 11–12 (Physics, Chemistry, Biology, Math)</li>
            <li>• Crash courses for entrance exams</li>
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
