"use client";

import { Search, Bell } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";

export default function DesktopTopNav() {
  const { user } = useAppSession();

  return (
    <header className="sticky top-0 z-20 hidden h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur md:flex">
      <div className="flex items-center gap-2">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-sm font-bold text-white">
          R
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">Roots Education Hub</p>
          <p className="text-[11px] text-slate-500">Classteacher student platform</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-4 pl-6">
        <div className="hidden max-w-md flex-1 items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600 shadow-sm sm:flex">
          <Search size={16} className="text-slate-400" />
          <input
            type="search"
            placeholder="Search questions, topics, exams"
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
        >
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-2">
          <div className="text-right leading-tight">
            <p className="text-xs font-medium text-slate-900">{user?.name || "Guest"}</p>
            <p className="text-[11px] text-slate-500">
              {user ? `${user.credits} credits` : "Create account to unlock"}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-sky-500 to-cyan-400 text-xs font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() || "R"}
          </div>
        </div>
      </div>
    </header>
  );
}

