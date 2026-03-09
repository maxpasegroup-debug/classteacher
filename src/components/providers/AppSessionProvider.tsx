"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppUser, AuthResponse, WalletResponse } from "@/lib/contracts";

type AppSessionContextValue = {
  user: AppUser | null;
  isReady: boolean;
  signup: (payload: { name: string; email: string; className: string; goal: string; password: string; inviteCode?: string }) => Promise<{ ok: boolean; message?: string }>;
  login: (payload: { email: string; password: string }) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  addCredits: (amount: number) => Promise<{ ok: boolean; message?: string }>;
  spendCredits: (amount: number) => Promise<{ ok: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  getAuthHeaders: (withJson?: boolean) => Headers;
};

const CSRF_COOKIE_KEY = "roots_csrf";

const AppSessionContext = createContext<AppSessionContextValue | undefined>(undefined);

export function AppSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const getCsrfToken = useCallback(() => {
    const cookies = document.cookie.split(";").map((item) => item.trim());
    for (const item of cookies) {
      if (item.startsWith(`${CSRF_COOKIE_KEY}=`)) {
        return decodeURIComponent(item.slice(CSRF_COOKIE_KEY.length + 1));
      }
    }
    return null;
  }, []);

  const buildAuthHeaders = useCallback(
    (withJson = false) => {
      const headers = new Headers();
      if (withJson) headers.set("Content-Type", "application/json");
      const csrf = getCsrfToken();
      if (csrf) headers.set("x-csrf-token", csrf);
      return headers;
    },
    [getCsrfToken]
  );

  const refreshUser = useCallback(async () => {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      setUser(null);
      return;
    }
    const data = (await response.json()) as { ok: boolean; user?: AppUser };
    setUser(data.user ?? null);
  }, []);

  useEffect(() => {
    async function bootstrapSession() {
      try {
        await fetch("/api/auth/csrf");
        await refreshUser();
      } catch {
        setUser(null);
      } finally {
        setIsReady(true);
      }
    }
    bootstrapSession();
  }, [refreshUser]);

  const persistAuth = useCallback((nextUser: AppUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo<AppSessionContextValue>(
    () => ({
      user,
      isReady,
      signup: async ({ name, email, className, goal, password, inviteCode }) => {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: buildAuthHeaders(true),
          body: JSON.stringify({ name, email, className, goal, password, inviteCode: inviteCode ?? undefined })
        });
        const data = (await response.json()) as AuthResponse;
        if (!data.ok) return { ok: false, message: data.message };
        persistAuth(data.user);
        return { ok: true };
      },
      login: async ({ email, password }) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: buildAuthHeaders(true),
          body: JSON.stringify({ email, password })
        });
        const data = (await response.json()) as AuthResponse;
        if (!data.ok) return { ok: false, message: data.message };
        persistAuth(data.user);
        return { ok: true };
      },
      logout: async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: buildAuthHeaders()
          });
        } catch {
          // Ignore network errors on logout and clear local session.
        }
        setUser(null);
      },
      addCredits: async (amount) => {
        if (!user) return { ok: false, message: "Please login to continue." };
        const response = await fetch("/api/wallet/add", {
          method: "POST",
          headers: buildAuthHeaders(true),
          body: JSON.stringify({ amount })
        });
        const data = (await response.json()) as WalletResponse;
        if (!data.ok) return { ok: false, message: data.message };
        setUser(data.user);
        return { ok: true };
      },
      spendCredits: async (amount) => {
        if (!user) return { ok: false, message: "Please login to continue." };
        const response = await fetch("/api/wallet/spend", {
          method: "POST",
          headers: buildAuthHeaders(true),
          body: JSON.stringify({ amount })
        });
        const data = (await response.json()) as WalletResponse;
        if (!data.ok) return { ok: false, message: data.message };
        setUser(data.user);
        return { ok: true };
      },
      refreshUser,
      getAuthHeaders: buildAuthHeaders
    }),
    [buildAuthHeaders, isReady, persistAuth, refreshUser, user]
  );

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>;
}

export function useAppSession() {
  const context = useContext(AppSessionContext);
  if (!context) {
    throw new Error("useAppSession must be used within AppSessionProvider");
  }
  return context;
}
