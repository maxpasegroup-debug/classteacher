"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { CreditTransactionItem } from "@/lib/contracts";

export default function CreditHistoryPage() {
  const { user } = useAppSession();
  const [transactions, setTransactions] = useState<CreditTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/wallet/history");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = (await res.json()) as { transactions?: CreditTransactionItem[] };
      setTransactions(data.transactions ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (!user) {
    return (
      <>
        <Header title="Credit History" subtitle="Credits spent and earned" />
        <main className="px-4 py-5">
          <p className="text-sm text-slate-600">Sign in to view your credit history.</p>
          <Link href="/auth/login" className="mt-2 inline-block text-sm font-medium text-teal-700">
            Log in
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Credit History" subtitle="Credits spent and earned" />
      <main className="space-y-4 px-4 py-5 md:px-0">
        <p className="text-xs text-slate-600">
          Credits remaining: <strong>{user.credits.toLocaleString()}</strong>
        </p>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No credit transactions yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{tx.reason}</p>
                  <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                </div>
                <span className={tx.delta > 0 ? "font-semibold text-emerald-600" : "font-semibold text-slate-700"}>
                  {tx.delta > 0 ? `+${tx.delta}` : tx.delta}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <Link href="/credits" className="text-sm font-medium text-teal-700 hover:underline">
            Buy Credits
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/profile" className="text-sm font-medium text-teal-700 hover:underline">
            Back to Profile
          </Link>
        </div>
      </main>
    </>
  );
}
