import Header from "@/components/Header";
import Link from "next/link";

export default function WorldSchoolPage() {
  return (
    <>
      <Header title="Roots World School" subtitle="K-12 academic excellence" />
      <main className="space-y-4 px-4 py-5 md:px-0">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-48 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">About</h2>
          <p className="mt-2 text-sm text-slate-600">
            A K-12 school focused on academic excellence and values-based learning. We prepare students for board exams,
            competitive entrance tests, and lifelong learning.
          </p>
          <h2 className="mt-4 text-sm font-semibold text-slate-900">Programs</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>• Primary &amp; Middle School (CBSE / State)</li>
            <li>• Senior Secondary (Science / Commerce / Humanities)</li>
            <li>• Entrance exam coaching (NEET, JEE, KEAM)</li>
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
