import Link from "next/link";

export default function LeaderboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
            aria-label="Back to dashboard"
          >
            ←
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Leaderboard</h1>
            <p className="text-xs text-slate-500">Compete and share your rank</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-md px-4 py-4">{children}</main>
    </div>
  );
}
