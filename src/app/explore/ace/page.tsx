import Header from "@/components/Header";
import Link from "next/link";

export default function ACEPage() {
  return (
    <>
      <Header title="ACE Allied Health College" subtitle="Career-driven health education" />
      <main className="space-y-4 px-4 py-5 md:px-0">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-48 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">About</h2>
          <p className="mt-2 text-sm text-slate-600">
            Career-driven health education with practical training for modern care environments. Diploma and degree
            programs in allied health sciences.
          </p>
          <h2 className="mt-4 text-sm font-semibold text-slate-900">Programs</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>• B.Sc. Allied Health Sciences</li>
            <li>• Diploma in Medical Lab Technology</li>
            <li>• Radiology &amp; Imaging support</li>
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
