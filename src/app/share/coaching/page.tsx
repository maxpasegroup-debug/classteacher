import type { Metadata } from "next";
import Link from "next/link";

type Props = { searchParams: Promise<{ name?: string; initial?: string; current?: string; rank?: string; exam?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams;
  const name = p.name ?? "Student";
  const initial = p.initial ?? "0";
  const current = p.current ?? "0";
  const exam = p.exam ?? "NEET";
  const title = `${name} improved ${initial}% → ${current}% | Classteacher AI Exam Coaching`;
  const description = `${name} improved from ${initial}% to ${current}% in ${exam} practice. Join Classteacher for AI exam coaching.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website"
    },
    twitter: { card: "summary_large_image", title, description }
  };
}

export default async function ShareCoachingPage({ searchParams }: Props) {
  const p = await searchParams;
  const name = p.name ?? "Student";
  const initial = p.initial ?? "0";
  const current = p.current ?? "0";
  const rank = p.rank ?? "—";
  const exam = p.exam ?? "NEET";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Classteacher AI Exam Coaching
        </p>
        <h1 className="mt-3 text-center text-lg font-bold text-slate-900">
          {name} improved from {initial}% → {current}%
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          {exam} Practice Rank {rank}
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            href="/ai-exam-coaching"
            className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Join Classteacher
          </Link>
        </div>
      </div>
    </main>
  );
}
