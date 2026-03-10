"use client";

import { Sparkles } from "lucide-react";

export default function ComingSoonCard() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
      <Sparkles size={20} className="mx-auto text-amber-600" />
      <p className="mt-2 text-sm font-medium text-slate-900">This feature will be available soon.</p>
      <p className="mt-1 text-xs text-slate-600">We are working on it.</p>
    </div>
  );
}
