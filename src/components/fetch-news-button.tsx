"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Message = { kind: "ok" | "error"; text: string };

export function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const [message, setMessage] = useState<Message | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          kind: "error",
          text: data.error ?? "뉴스를 가져오지 못했어요.",
        });
        return;
      }
      const failed = data.failedFeeds?.length ?? 0;
      setMessage({
        kind: failed > 0 && data.added === 0 ? "error" : "ok",
        text: `신규 ${data.added}건, 실패 ${failed}건`,
      });
      startTransition(() => router.refresh());
    } catch {
      setMessage({ kind: "error", text: "네트워크 오류가 발생했어요." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 sm:h-9"
      >
        {loading ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
      {message && (
        <p
          role="status"
          className={`absolute right-0 top-full mt-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm ${
            message.kind === "ok"
              ? "bg-primary-soft text-primary-soft-text"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
