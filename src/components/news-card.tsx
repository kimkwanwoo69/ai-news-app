"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { DashboardArticle } from "@/db/queries";

// 서버/클라이언트 렌더 결과가 같도록 시간대를 고정한다.
const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Seoul",
});

export function NewsCard({ article }: { article: DashboardArticle }) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 저장 직후 router.refresh()가 끝나기 전에도 '저장됨'으로 보이게 한다.
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const notionPageUrl = article.notionPageUrl ?? savedUrl;

  const date = article.publishedAt
    ? dateFormatter.format(new Date(article.publishedAt))
    : null;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/articles/${article.id}/notion`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          res.status === 401
            ? "로그인이 만료됐어요. 새로고침 후 다시 로그인해 주세요."
            : (data.error ?? "Notion에 저장하지 못했어요."),
        );
        return;
      }
      setSavedUrl(data.notionPageUrl);
      startTransition(() => router.refresh());
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`/api/articles/${article.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          res.status === 401
            ? "로그인이 만료됐어요. 새로고침 후 다시 로그인해 주세요."
            : (data.error ?? "뉴스를 삭제하지 못했어요."),
        );
        return;
      }
      setDeleted(true);
      startTransition(() => router.refresh());
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setDeleting(false);
    }
  }

  // 삭제 직후 router.refresh()가 끝나기 전에도 카드를 바로 숨긴다.
  if (deleted) return null;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary-soft-text">
          {article.categoryName ?? "기타"}
        </span>
        <div className="flex min-w-0 items-center gap-1">
          <span className="truncate text-xs text-muted">
            {article.sourceName}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            aria-label={`"${article.titleKo}" 뉴스 삭제`}
            title="삭제"
            className="-mr-1.5 flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 dark:hover:bg-red-950 dark:hover:text-red-300"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-4"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="break-words text-lg font-semibold leading-snug">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {article.titleKo}
          </a>
        </h2>
        <p className="line-clamp-1 break-words text-xs text-muted">
          {article.titleOriginal}
        </p>
        <p className="line-clamp-4 break-words text-sm leading-relaxed text-foreground/80">
          {article.summaryKo}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-xs text-muted">
            {article.author && (
              <span className="block truncate">{article.author}</span>
            )}
            {date && <time dateTime={article.publishedAt!}>{date}</time>}
          </div>

          {notionPageUrl ? (
            <a
              href={notionPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-medium text-primary-soft-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              저장됨
            </a>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
            >
              {saving ? "저장 중…" : "뉴스 저장"}
            </button>
          )}
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
