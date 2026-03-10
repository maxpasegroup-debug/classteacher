"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { Share2, Download, MessageCircle } from "lucide-react";
import { useAppSession } from "@/components/providers/AppSessionProvider";

const APP_NAME = "Classteacher AI Exam Coaching";
const SHARE_TEXT = (name: string, score: number, exam: string, districtRank: number | null) =>
  `I scored ${score}% in ${exam} mock test on ${APP_NAME}.${districtRank ? ` District Rank: ${districtRank}.` : ""} Join and improve your rank.`;

export default function ShareLeaderboardPage() {
  const searchParams = useSearchParams();
  const { user, getAuthHeaders } = useAppSession();
  const cardRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<{
    name: string;
    examCategory: string;
    currentAccuracy: number;
    districtRank?: number;
    stateRank?: number;
    globalRank?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fromUrl = {
      name: searchParams.get("name") ?? user?.name ?? "Student",
      examCategory: searchParams.get("examCategory") ?? "NEET",
      currentAccuracy: Number(searchParams.get("score")) || 0,
      districtRank: searchParams.get("districtRank") ? Number(searchParams.get("districtRank")) : undefined,
      stateRank: searchParams.get("stateRank") ? Number(searchParams.get("stateRank")) : undefined,
      globalRank: searchParams.get("globalRank") ? Number(searchParams.get("globalRank")) : undefined
    };

    if (user && !searchParams.get("score")) {
      (async () => {
        try {
          const category = searchParams.get("examCategory") ?? "NEET";
          const res = await fetch(`/api/exam-coaching/share-card?category=${encodeURIComponent(category)}`, {
            headers: getAuthHeaders()
          });
          const json = (await res.json()) as {
            ok?: boolean;
            name?: string;
            examCategory?: string;
            currentAccuracy?: number;
            districtRank?: number;
            stateRank?: number;
            globalRank?: number;
          };
          if (json.ok && json.name) {
            setData({
              name: json.name,
              examCategory: json.examCategory ?? "NEET",
              currentAccuracy: json.currentAccuracy ?? 0,
              districtRank: json.districtRank,
              stateRank: json.stateRank,
              globalRank: json.globalRank
            });
          } else {
            setData({
              name: fromUrl.name,
              examCategory: fromUrl.examCategory,
              currentAccuracy: fromUrl.currentAccuracy,
              districtRank: fromUrl.districtRank,
              stateRank: fromUrl.stateRank,
              globalRank: fromUrl.globalRank
            });
          }
        } catch {
          setData(fromUrl);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setData(fromUrl);
      setLoading(false);
    }
  }, [user, searchParams, getAuthHeaders]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !data) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: "#ffffff", pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `classteacher-${data.examCategory}-result.png`;
      a.click();
    } catch {
      // ignore
    } finally {
      setDownloading(false);
    }
  }, [data]);

  if (loading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <p className="text-slate-600">Loading…</p>
      </main>
    );
  }

  const shareMessage = SHARE_TEXT(data.name, data.currentAccuracy, data.examCategory, data.districtRank ?? null);
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-8">
      <div className="mx-auto max-w-sm space-y-6">
        <div
          ref={cardRef}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg"
          style={{ minHeight: 280 }}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-emerald-600">
            {APP_NAME}
          </p>
          <h1 className="mt-3 text-center text-lg font-bold text-slate-900">
            {data.examCategory} Mock Test Result
          </h1>
          <p className="mt-2 text-center text-2xl font-bold text-emerald-600">{data.currentAccuracy}%</p>
          {data.districtRank != null && (
            <p className="mt-1 text-center text-sm text-slate-600">District Rank: {data.districtRank}</p>
          )}
          {data.stateRank != null && (
            <p className="text-center text-sm text-slate-600">State Rank: {data.stateRank}</p>
          )}
          <p className="mt-4 text-center text-xs font-medium text-slate-500">
            Improve your rank with Classteacher
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white"
          >
            <MessageCircle className="h-5 w-5" />
            Share on WhatsApp
          </a>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="h-5 w-5" />
            {downloading ? "Preparing…" : "Download image"}
          </button>
          <p className="text-center text-xs text-slate-500">
            Upload the downloaded image to your Instagram story.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/dashboard/exam-coaching"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 underline"
          >
            <Share2 className="h-4 w-4" />
            Back to Exam Coaching
          </Link>
        </div>
      </div>
    </main>
  );
}
