"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Message = { kind: "ok" | "error"; text: string };

export function FetchNewsButton() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const [message, setMessage] = useState<Message | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      // 세션 쿠키는 수명이 짧아 만료됐을 수 있으므로, 요청 직전에 최신 토큰을 받아 보낸다.
      const token = await getToken();
      const res = await fetch("/api/news/fetch", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          kind: "error",
          text:
            res.status === 401
              ? "로그인이 만료됐어요. 새로고침 후 다시 로그인해 주세요."
              : (data.error ?? "뉴스를 가져오지 못했어요."),
        });
        return;
      }
      const failedFeeds: string[] = data.failedFeeds ?? [];
      const failed: number = data.failed ?? 0;
      const feedNote =
        failedFeeds.length > 0 ? ` (피드 실패: ${failedFeeds.join(", ")})` : "";
      setMessage({
        kind:
          data.added === 0 && (failed > 0 || failedFeeds.length > 0)
            ? "error"
            : "ok",
        text: `신규 ${data.added}건, 실패 ${failed}건${feedNote}`,
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
