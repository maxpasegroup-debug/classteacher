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

export default function DesktopSidebar() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-slate-50/80 px-3 py-4 md:flex md:flex-col">
      <nav className="mt-2 space-y-1 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={18}
                className={cn(
                  "shrink-0",
                  isActive ? "text-cyan-600" : "text-slate-400"
                )}
                aria-hidden
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

