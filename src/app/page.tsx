"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-cyan-50 via-white to-emerald-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="w-full max-w-xs rounded-3xl border border-cyan-100 bg-white/90 p-8 text-center shadow-lg shadow-cyan-100 backdrop-blur"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-md">
          <GraduationCap size={36} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Classteacher</h1>
        <p className="mt-1 text-sm text-slate-600">Learn, Practice, Grow</p>
      </motion.div>
    </main>
  );
}
