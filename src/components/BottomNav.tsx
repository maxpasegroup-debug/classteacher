"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, GraduationCap, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Classteacher", icon: LayoutDashboard },
  { href: "/journey", label: "My Journey", icon: GraduationCap },
  { href: "/explore", label: "Explore Roots", icon: Compass },
  { href: "/profile", label: "Profile", icon: User }
];

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/admin") || pathname.startsWith("/teacher")) {
    return null;
  }

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-3 z-20 px-3 sm:bottom-4">
      <div className="mx-auto w-full max-w-md">
        <div className="pointer-events-auto rounded-3xl border border-slate-200/80 bg-white/95 p-1.5 shadow-lg shadow-slate-200/70 backdrop-blur">
          <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[11px] font-medium leading-none transition",
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2.4 : 2}
                className={cn("transition-transform", isActive && "-translate-y-0.5")}
                aria-hidden
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
          </div>
        </div>
      </div>
    </nav>
  );
}
