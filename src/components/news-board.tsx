"use client";

import { useState } from "react";
import type { DashboardArticle, DashboardCategory } from "@/db/queries";
import { NewsCard } from "./news-card";

// 'all' = 전체, 'none' = 카테고리 없음('기타'), number = 카테고리 id
type Filter = "all" | "none" | number;

export function NewsBoard({
  articles,
  categories,
}: {
  articles: DashboardArticle[];
  categories: DashboardCategory[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  // 기사가 하나도 없으면 필터 칩은 의미가 없으므로 안내 화면만 보여 준다.
  if (articles.length === 0) {
    return (
      <EmptyState
        title="아직 수집한 뉴스가 없어요"
        description="뉴스를 가져오면 이곳에 카드로 정리돼요."
      />
    );
  }

  // DB에 '기타' 카테고리가 있으면 그 칩이 카테고리 없는 기사도 함께 보여 준다.
  const etc = categories.find((c) => c.name === "기타");

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "전체" },
    ...categories.map((c) => ({ key: c.id as Filter, label: c.name })),
    ...(etc ? [] : [{ key: "none" as Filter, label: "기타" }]),
  ];

  const visible = articles.filter((a) => {
    if (filter === "all") return true;
    if (filter === "none") return a.categoryId === null;
    if (a.categoryId === filter) return true;
    return filter === etc?.id && a.categoryId === null;
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {chips.map((chip) => {
          const selected = filter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(chip.key)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:py-1.5 ${
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-muted hover:border-primary hover:text-primary"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="이 카테고리에 해당하는 뉴스가 없어요"
          description="다른 카테고리를 고르거나 전체 뉴스를 확인해 보세요."
          action={
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="h-10 rounded-full bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              전체 보기
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {visible.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-primary-soft text-primary">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
        >
          <path d="M4 5h13a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5Z" />
          <path d="M19 9h1a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2" />
          <path d="M8 9h7M8 13h7M8 16h4" />
        </svg>
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-xs text-sm text-muted">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
