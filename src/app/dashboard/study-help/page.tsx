"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MessageCircleQuestion, PenLine, Sparkles, Users } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { useCatalog } from "@/hooks/useCatalog";
import { StudyHelpSlot } from "@/lib/contracts";

const bookingPlans = [
  { id: "sh-hourly", label: "Hourly booking", details: "One-off live tuition support", cost: 20 },
  { id: "sh-weekly", label: "Weekly plan", details: "3 live sessions per week", cost: 60 },
  { id: "sh-monthly", label: "Monthly plan", details: "12 live sessions + mentor review", cost: 220 }
];

export default function StudyHelpPage() {
  const { user, getAuthHeaders, refreshUser } = useAppSession();
  const router = useRouter();
  const { catalog } = useCatalog();
  const plans = catalog?.studyHelpPlans ?? bookingPlans;
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || "sh-hourly");
  const [slots, setSlots] = useState<StudyHelpSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  useEffect(() => {
    if (plans.length && !plans.some((plan) => plan.id === selectedPlanId)) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  useEffect(() => {
    async function loadSlots() {
      const response = await fetch(`/api/study-help/slots?planId=${encodeURIComponent(selectedPlanId)}`);
      if (!response.ok) return;
      const data = (await response.json()) as { ok: boolean; slots: StudyHelpSlot[] };
      const openSlots = (data.slots || []).filter((slot) => !slot.isBooked);
      setSlots(openSlots);
      setSelectedSlotId(openSlots[0]?.id || "");
    }
    loadSlots();
  }, [selectedPlanId]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) || plans[0],
    [plans, selectedPlanId]
  );

  function requireAuth() {
    if (user) return true;
    router.push(`/auth/signup?returnTo=${encodeURIComponent("/dashboard/study-help")}`);
    return false;
  }

  async function startBooking(planId: string, cost: number) {
    if (!requireAuth()) return;
    if (!selectedSlotId) {
      alert("Please select an available slot.");
      return;
    }
    const response = await fetch("/api/actions/study-help-booking", {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ planId, slotId: selectedSlotId })
    });
    const result = (await response.json()) as { ok: boolean; message?: string };
    if (!response.ok || !result.ok) {
      alert(result.message || "Booking failed.");
      return;
    }
    await refreshUser();
    setSlots((prev) => prev.filter((slot) => slot.id !== selectedSlotId));
    setSelectedSlotId("");
    alert(`Booking confirmed. ${cost} credits deducted.`);
  }

  return (
    <main className="space-y-4 px-4 py-5">
      <section className="rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-500 p-4 text-white shadow-md">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion size={18} />
          <p className="text-sm font-semibold">Study Help</p>
        </div>
        <h1 className="mt-2 text-lg font-semibold">Clear doubts with AI + real tutors</h1>
        <p className="mt-1 text-sm text-white/90">
          AI assistant is personalized for your profile and live tutors support deep doubt solving.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Live Tuition Bookings</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlanId(plan.id)}
              className={`rounded-xl px-2 py-2 text-xs ${
                selectedPlanId === plan.id ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {plan.label}
            </button>
          ))}
        </div>
        <ul className="mt-3 space-y-2">
          {plans.map((plan) => (
            <li key={plan.id} className="rounded-xl bg-slate-50 px-3 py-3 text-sm">
              <p className="font-semibold text-slate-800">{plan.label}</p>
              <p className="text-xs text-slate-600">{plan.details}</p>
              {plan.id === selectedPlanId ? (
                <>
                  <div className="mt-2 space-y-1.5">
                    {slots.length === 0 ? (
                      <p className="text-xs text-rose-600">No open slots for this plan.</p>
                    ) : (
                      slots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`block w-full rounded-lg border px-2 py-1.5 text-left text-xs ${
                            selectedSlotId === slot.id
                              ? "border-cyan-500 bg-cyan-50 text-cyan-800"
                              : "border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          {slot.tutorName} - {new Date(slot.startAt).toLocaleString()}
                        </button>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startBooking(plan.id, plan.cost)}
                    className="mt-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    {user ? `Book with ${plan.cost} credits` : "Create account to book"}
                  </button>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <PenLine size={16} className="text-cyan-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Recent Doubts</p>
          <p className="mt-1 text-xs text-slate-600">4 answered this week</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <Users size={16} className="text-emerald-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">Tutor Rooms</p>
          <p className="mt-1 text-xs text-slate-600">2 sessions live now</p>
        </article>
      </section>

      <section className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-cyan-700" />
          <p className="text-sm font-semibold text-slate-900">AI Learning Assistant</p>
        </div>
        <p className="mt-2 text-sm text-slate-700">
          Custom trained for your profile: {user?.className || "Class 10 | CBSE"} and goal{" "}
          {user?.goal || "master algebra this week"}.
        </p>
        <button
          type="button"
          onClick={() => requireAuth() && alert("AI tutor session started.")}
          className="mt-3 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white"
        >
          {user ? "Ask AI Tutor" : "Create account to ask AI"}
        </button>
      </section>

      <Link
        href="/dashboard"
        className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back to Classteacher
      </Link>
    </main>
  );
}
