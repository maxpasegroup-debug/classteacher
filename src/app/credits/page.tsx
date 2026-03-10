"use client";

import Link from "next/link";
import { useState } from "react";
import { Coins, Check } from "lucide-react";
import Header from "@/components/Header";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import CreditBadge from "@/components/CreditBadge";

const PACKS = [
  { id: "starter", name: "Starter Pack", credits: 1000, price: 349, popular: false },
  { id: "growth", name: "Growth Pack", credits: 2500, price: 699, popular: true },
  { id: "serious", name: "Serious Prep", credits: 6000, price: 1499, popular: false },
];

export default function CreditsPage() {
  const { user } = useAppSession();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <>
      <Header title="Buy Credits" subtitle="Power your AI Exam Coaching" />
      <main className="space-y-4 px-4 py-5 md:px-0">
        {user && (
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <CreditBadge credits={user.credits} />
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Credit packs</h2>
          <p className="text-xs text-slate-600">
            Use credits for practice questions, mock tests, AI analysis, and training plans. Payment integration coming soon.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {PACKS.map((pack) => (
              <article
                key={pack.id}
                className={`relative rounded-2xl border p-4 shadow-sm ${
                  pack.popular ? "border-teal-300 bg-teal-50/50" : "border-slate-200 bg-white"
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-2 right-3 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Popular
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{pack.name}</h3>
                    <p className="text-lg font-bold text-slate-900">{pack.credits.toLocaleString()} Credits</p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">₹{pack.price}</p>
                <button
                  type="button"
                  className="mt-3 w-full rounded-full bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={() => setMessage("Payment integration will be added soon. Use Profile to add test credits for now.")}
                >
                  Buy Credits
                </button>
              </article>
            ))}
          </div>
          {message && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">{message}</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">How credits work</h3>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <Check size={14} className="text-teal-600" /> Practice question = 1 credit
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-teal-600" /> Full mock test = 50 credits
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-teal-600" /> AI Analysis = 30 credits
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-teal-600" /> Training plan = 40 credits
            </li>
            <li className="flex items-center gap-2">
              <Check size={14} className="text-teal-600" /> 5 free practice questions per day when you run out
            </li>
          </ul>
        </section>

        <div className="flex gap-2">
          <Link href="/credits/history" className="text-sm font-medium text-teal-700 hover:underline">
            Credit History
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/profile" className="text-sm font-medium text-teal-700 hover:underline">
            ← Back to Profile
          </Link>
        </div>
      </main>
    </>
  );
}
