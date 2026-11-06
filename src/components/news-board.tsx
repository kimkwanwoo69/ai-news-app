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
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
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

      {articles.length === 0 ? (
        <p className="py-20 text-center text-muted">
          아직 가져온 뉴스가 없습니다. &apos;뉴스 가져오기&apos;를 눌러 보세요.
        </p>
      ) : visible.length === 0 ? (
        <p className="py-20 text-center text-muted">
          이 카테고리에 해당하는 뉴스가 없습니다.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </>
  );
}
