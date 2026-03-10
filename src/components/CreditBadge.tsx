"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import { LOW_CREDIT_WARNING_THRESHOLD } from "@/lib/config/credits";

type CreditBadgeProps = {
  credits: number;
  showLabel?: boolean;
  className?: string;
};

export default function CreditBadge({ credits, showLabel = true, className = "" }: CreditBadgeProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-sm ${className}`}>
      <Coins size={14} className="text-amber-600" />
      {showLabel && <span className="text-slate-600">Credits remaining:</span>}
      <span className="font-semibold text-slate-900">{credits.toLocaleString()}</span>
    </div>
  );
}

export function LowCreditBanner({ credits }: { credits: number }) {
  if (credits >= LOW_CREDIT_WARNING_THRESHOLD) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
      <p className="font-medium text-amber-900">
        Only {credits} credits remaining. Top up to continue training.
      </p>
      <Link
        href="/credits"
        className="mt-2 inline-block rounded-full bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
      >
        Buy Credits
      </Link>
    </div>
  );
}
