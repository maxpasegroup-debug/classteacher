"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAppSession } from "@/components/providers/AppSessionProvider";

export default function LoginPage() {
  const { login } = useAppSession();
  const router = useRouter();
  const [returnTo, setReturnTo] = useState("/dashboard");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReturnTo(params.get("returnTo") || "/dashboard");
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const result = await login({ email, password });
    if (!result.ok) {
      setError(result.message || "Unable to login.");
      return;
    }
    router.replace(returnTo);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-cyan-700">Roots Education Hub</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">Login to continue</h1>
        <p className="mt-1 text-sm text-slate-600">Access tests, bookings, and your credits.</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email ID"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            required
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Login
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href={`/auth/signup?returnTo=${encodeURIComponent(returnTo)}`} className="text-cyan-700">
            Create new account
          </Link>
          <Link href="/auth/forgot-password" className="text-slate-500">
            Forgot password
          </Link>
        </div>
      </section>
    </main>
  );
}
