"use client";

import { AppSessionProvider } from "@/components/providers/AppSessionProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <AppSessionProvider>{children}</AppSessionProvider>;
}
