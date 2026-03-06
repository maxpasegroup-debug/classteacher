"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [resetTokenPreview, setResetTokenPreview] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = (await response.json()) as { ok: boolean; message?: string; resetTokenPreview?: string };
    setMessage(data.message || "If this email exists, reset instructions have been sent.");
    setResetTokenPreview(data.resetTokenPreview || null);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Forgot password</h1>
        <p className="mt-1 text-sm text-slate-600">Enter your email and we will send reset instructions.</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email ID"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            required
          />
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Send reset link
          </button>
        </form>

        {submitted ? (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        {submitted && resetTokenPreview ? (
          <div className="mt-2 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs text-cyan-800">
            <p>Local preview reset token generated.</p>
            <Link
              href={`/auth/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetTokenPreview)}`}
              className="mt-1 inline-flex text-cyan-700 underline"
            >
              Open reset password page
            </Link>
          </div>
        ) : null}

        <div className="mt-4 flex items-center gap-3 text-sm">
          <Link href="/auth/login" className="text-cyan-700">
            Back to login
          </Link>
          <Link href="/auth/signup" className="text-slate-500">
            Create account
          </Link>
        </div>
      </section>
    </main>
  );
}
